import React, { useState, useEffect, useRef } from 'react';
import { Pergunta, RespostaEnvio, UserSession, Sala, Turma, QuestionCategory } from '../types';
import {
  CheckCircle2,
  Building,
  Users,
  Send,
  Star,
  MessageSquare,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  ThumbsUp,
  LayoutGrid,
  ClipboardList,
  Calendar,
  Check,
  ChevronRight,
  Filter,
  Save,
  Sparkles,
  Clock,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Cell,
} from 'recharts';

interface TeacherViewProps {
  session: UserSession;
  perguntas: Pergunta[];
  respostas: RespostaEnvio[];
  salas: Sala[];
  turmas: Turma[];
  onSalvarResposta: (resposta: Omit<RespostaEnvio, 'id' | 'criadaEm' | 'timestamp'>) => Promise<void>;
  onChangeSalaTurma: (salaId: string, salaNome: string, turmaId: string, turmaNome: string) => void;
}

type TeacherTab = 'responder' | 'desempenho' | 'panorama';

type CaixaAvaliacao = 'Ótimo' | 'Bom' | 'Regular' | 'Ruim';

export const TeacherView: React.FC<TeacherViewProps> = ({
  session,
  perguntas,
  respostas,
  salas,
  turmas,
  onSalvarResposta,
  onChangeSalaTurma,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('responder');
  const [tipoGrafico, setTipoGrafico] = useState<'radar' | 'barras'>('radar');
  const [respostasState, setRespostasState] = useState<Record<string, string | number>>({});
  const [observacoesAdicionais, setObservacoesAdicionais] = useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const isInitialMount = useRef<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Selected class for Performance Tab
  const [selectedTurmaDesempenho, setSelectedTurmaDesempenho] = useState<string>(
    session.turmaId || turmas[0]?.id || ''
  );

  // Filter for Panorama
  const [filtroPanorama, setFiltroPanorama] = useState<'todas' | 'otimo' | 'regular_ruim'>('todas');

  // Modal edit states
  const [selectedSalaId, setSelectedSalaId] = useState(session.salaId || salas[0]?.id || '');
  const [selectedTurmaId, setSelectedTurmaId] = useState(session.turmaId || turmas[0]?.id || '');

  // Active questions
  const activePerguntas = perguntas.filter((p) => p.ativa);

  // Storage keys tied to the current teacher and current turma
  const draftKey = `escola_draft_obs_${session.nome}_${session.turmaId || 'geral'}`;
  const draftRespostasKey = `escola_draft_respostas_${session.nome}_${session.turmaId || 'geral'}`;

  // Restore draft locally if session was interrupted
  useEffect(() => {
    isInitialMount.current = true;
    try {
      const savedObs = localStorage.getItem(draftKey);
      const savedRespostas = localStorage.getItem(draftRespostasKey);
      let found = false;

      if (savedObs) {
        setObservacoesAdicionais(savedObs);
        found = true;
      }

      if (savedRespostas) {
        const parsed = JSON.parse(savedRespostas);
        if (parsed && typeof parsed === 'object') {
          setRespostasState(parsed);
          found = true;
        }
      }

      if (found) {
        setHasRestoredDraft(true);
        setAutoSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
      } else {
        setHasRestoredDraft(false);
        setAutoSaveStatus('idle');
      }
    } catch (e) {
      console.warn('Erro ao restaurar rascunho de observações:', e);
    }
  }, [draftKey, draftRespostasKey]);

  // Debounced auto-save effect (600ms) for 'Observações adicionais' and questionnaire progress
  useEffect(() => {
    // Avoid saving on initial mount before user starts typing
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setAutoSaveStatus('saving');

    const debounceTimer = setTimeout(() => {
      try {
        if (observacoesAdicionais.trim()) {
          localStorage.setItem(draftKey, observacoesAdicionais);
        } else {
          localStorage.removeItem(draftKey);
        }

        if (Object.keys(respostasState).length > 0) {
          localStorage.setItem(draftRespostasKey, JSON.stringify(respostasState));
        }

        const now = new Date();
        const formatted = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSavedTime(formatted);
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Erro ao auto-salvar no localStorage:', err);
        setAutoSaveStatus('idle');
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(debounceTimer);
  }, [observacoesAdicionais, respostasState, draftKey, draftRespostasKey]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      localStorage.removeItem(draftRespostasKey);
    } catch {}
    setObservacoesAdicionais('');
    setRespostasState({});
    setHasRestoredDraft(false);
    setAutoSaveStatus('idle');
    setLastSavedTime(null);
  };

  // Calculate completion progress
  const totalPerguntas = activePerguntas.length;
  const respondidasCount = activePerguntas.filter((p) => {
    const val = respostasState[p.id];
    return val !== undefined && val !== '';
  }).length;
  const progressPercent = totalPerguntas > 0 ? Math.round((respondidasCount / totalPerguntas) * 100) : 0;

  const handleSetValor = (perguntaId: string, valor: string | number) => {
    setRespostasState((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }));
  };

  const isObsQuestion = (p: Pergunta) =>
    p.id === 'p-7' || p.enunciado.toLowerCase().includes('observações adicionais');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check mandatory
    for (const p of activePerguntas) {
      if (p.obrigatoria) {
        const val = respostasState[p.id];
        if (val === undefined || val === '') {
          alert(`Por favor, responda a pergunta obrigatória:\n"${p.enunciado}"`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Sync observacoesAdicionais to question if active
      const finalRespostas = { ...respostasState };
      const obsQ = activePerguntas.find((p) => isObsQuestion(p));
      if (obsQ && observacoesAdicionais) {
        finalRespostas[obsQ.id] = observacoesAdicionais;
      }

      await onSalvarResposta({
        professorNome: session.nome,
        salaId: session.salaId || 'sala-geral',
        salaNome: session.salaNome || 'Geral',
        turmaId: session.turmaId || 'turma-geral',
        turmaNome: session.turmaNome || 'Turma Principal',
        respostas: finalRespostas,
        observacoesGerais: observacoesAdicionais.trim() || undefined,
      });

      // Clear local storage draft upon successful completion
      try {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftRespostasKey);
      } catch {}
      setObservacoesAdicionais('');
      setRespostasState({});
      setHasRestoredDraft(false);
      setAutoSaveStatus('idle');
      setLastSavedTime(null);

      setShowSuccessCard(true);
      // Auto-set the current turma for the performance view
      if (session.turmaId) {
        setSelectedTurmaDesempenho(session.turmaId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmChangeSalaTurma = () => {
    const s = salas.find((item) => item.id === selectedSalaId) || salas[0];
    const t = turmas.find((item) => item.id === selectedTurmaId) || turmas[0];
    onChangeSalaTurma(s.id, s.nome, t.id, t.nome);
    setSelectedTurmaDesempenho(t.id);
    setShowChangeModal(false);
  };

  // Helper to map Caixa to numerical score or text
  const caixasOpcoes: Array<{
    tipo: CaixaAvaliacao;
    nota: number;
    label: string;
    sublabel: string;
    icon: typeof Smile;
    bg: string;
    border: string;
    text: string;
    activeBg: string;
    activeRing: string;
  }> = [
    {
      tipo: 'Ótimo',
      nota: 5,
      label: 'Ótimo',
      sublabel: 'Excelente / Acima do esperado',
      icon: ThumbsUp,
      bg: 'bg-emerald-50/50 hover:bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      activeBg: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400',
      activeRing: 'border-emerald-600',
    },
    {
      tipo: 'Bom',
      nota: 4,
      label: 'Bom',
      sublabel: 'Dentro do padrão / Positivo',
      icon: Smile,
      bg: 'bg-sky-50/50 hover:bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      activeBg: 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400',
      activeRing: 'border-sky-600',
    },
    {
      tipo: 'Regular',
      nota: 3,
      label: 'Regular',
      sublabel: 'Exige atenção / Parcial',
      icon: Meh,
      bg: 'bg-amber-50/50 hover:bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      activeBg: 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300',
      activeRing: 'border-amber-500',
    },
    {
      tipo: 'Ruim',
      nota: 1,
      label: 'Ruim',
      sublabel: 'Abaixo do esperado / Crítico',
      icon: Frown,
      bg: 'bg-rose-50/50 hover:bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      activeBg: 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400',
      activeRing: 'border-rose-600',
    },
  ];

  // ==========================================
  // METRICS COMPUTATION FOR TURMAS
  // ==========================================
  const calcularMetricasTurma = (turmaId: string) => {
    const respostasDaTurma = respostas.filter((r) => r.turmaId === turmaId);
    if (respostasDaTurma.length === 0) {
      return {
        totalAvaliacoes: 0,
        mediaNota: 0,
        status: 'Sem avaliações',
        corStatus: 'text-slate-500 bg-slate-100',
        disciplinaMedia: 0,
        materiaisMedia: 'Sem dados',
        ocorrenciasCount: 0,
        alunosDestacados: [] as string[],
        respostasRecentes: [],
      };
    }

    const notas: number[] = [];
    const disciplinaNotas: number[] = [];
    let ocorrenciasCount = 0;
    const alunosDestacados: string[] = [];

    respostasDaTurma.forEach((r) => {
      Object.entries(r.respostas).forEach(([pid, val]) => {
        if (typeof val === 'number') {
          notas.push(val);
          if (pid === 'p-4') disciplinaNotas.push(val); // foco e disciplina
        }
        if (typeof val === 'string') {
          if (val === 'Ótimo') notas.push(5);
          else if (val === 'Bom') notas.push(4);
          else if (val === 'Regular') notas.push(3);
          else if (val === 'Ruim') notas.push(1);
        }
        if (pid === 'p-6' && val === 'Sim') ocorrenciasCount++;
        if ((pid === 'p-14' || pid === 'p-7') && typeof val === 'string' && val.trim()) {
          alunosDestacados.push(`${r.professorNome}: "${val}"`);
        }
      });
    });

    const mediaNota = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 4.0;
    const disciplinaMedia =
      disciplinaNotas.length > 0
        ? disciplinaNotas.reduce((a, b) => a + b, 0) / disciplinaNotas.length
        : mediaNota;

    let status = 'Ótimo';
    let corStatus = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (mediaNota < 2.5) {
      status = 'Atenção Crítica / Ruim';
      corStatus = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (mediaNota < 3.5) {
      status = 'Regular';
      corStatus = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (mediaNota < 4.4) {
      status = 'Bom';
      corStatus = 'text-sky-700 bg-sky-50 border-sky-200';
    }

    return {
      totalAvaliacoes: respostasDaTurma.length,
      mediaNota: Number(mediaNota.toFixed(1)),
      status,
      corStatus,
      disciplinaMedia: Number(disciplinaMedia.toFixed(1)),
      ocorrenciasCount,
      alunosDestacados,
      respostasRecentes: respostasDaTurma.slice(0, 5),
    };
  };

  // Helper to calculate category averages for Recharts radar/bar chart
  const calcularMediasCategorias = (turmaId: string) => {
    const respostasDaTurma = respostas.filter((r) => r.turmaId === turmaId);

    const categoriasBase: Record<
      QuestionCategory,
      { nome: string; descricao: string; cor: string; notas: number[] }
    > = {
      turma: {
        nome: 'Comportamento da Turma',
        descricao: 'Foco, pontualidade, disciplina e participação em sala',
        cor: '#10b981', // emerald-500
        notas: [],
      },
      sala: {
        nome: 'Estrutura & Recursos',
        descricao: 'Equipamentos, materiais didáticos e ambiente físico',
        cor: '#0ea5e9', // sky-500
        notas: [],
      },
      geral: {
        nome: 'Geral & Pedagógico',
        descricao: 'Clima escolar, desenvolvimento das aulas e melhorias',
        cor: '#6366f1', // indigo-500
        notas: [],
      },
    };

    respostasDaTurma.forEach((resp) => {
      Object.entries(resp.respostas).forEach(([pid, val]) => {
        const pergunta = perguntas.find((p) => p.id === pid);
        if (!pergunta) return;
        const cat = pergunta.categoria;
        if (!categoriasBase[cat]) return;

        let notaNum: number | null = null;
        if (typeof val === 'number') {
          notaNum = val;
        } else if (typeof val === 'string') {
          if (val === 'Ótimo') notaNum = 5;
          else if (val === 'Bom') notaNum = 4;
          else if (val === 'Regular') notaNum = 3;
          else if (val === 'Ruim') notaNum = 1;
          else if (val === 'Sim') {
            const isNegative =
              pergunta.enunciado.toLowerCase().includes('ocorrência') ||
              pergunta.enunciado.toLowerCase().includes('grave') ||
              pergunta.enunciado.toLowerCase().includes('dispersão');
            notaNum = isNegative ? 1.5 : 5;
          } else if (val === 'Não') {
            const isNegative =
              pergunta.enunciado.toLowerCase().includes('ocorrência') ||
              pergunta.enunciado.toLowerCase().includes('grave') ||
              pergunta.enunciado.toLowerCase().includes('dispersão');
            notaNum = isNegative ? 5 : 2;
          } else if (pergunta.opcoes && pergunta.opcoes.length > 0) {
            const idx = pergunta.opcoes.indexOf(val);
            if (idx !== -1) {
              const totalOpcoes = pergunta.opcoes.length;
              notaNum = Number((5 - idx * (3 / Math.max(1, totalOpcoes - 1))).toFixed(1));
            }
          }
        }

        if (notaNum !== null && !isNaN(notaNum)) {
          categoriasBase[cat].notas.push(notaNum);
        }
      });
    });

    return Object.entries(categoriasBase).map(([catKey, data]) => {
      const media =
        data.notas.length > 0
          ? Number((data.notas.reduce((a, b) => a + b, 0) / data.notas.length).toFixed(1))
          : 0;

      return {
        key: catKey,
        categoria: data.nome,
        descricao: data.descricao,
        media,
        totalRespostas: data.notas.length,
        cor: data.cor,
        meta: 5.0,
      };
    });
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700/80 space-y-1.5 max-w-xs z-50">
          <div className="flex items-center justify-between gap-3">
            <span className="font-extrabold text-xs text-emerald-400">{data.categoria}</span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.cor }}
            />
          </div>
          <p className="text-slate-300 text-[10px] leading-relaxed">{data.descricao}</p>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-slate-400 text-[11px]">Média da Categoria:</span>
            <span className="font-extrabold text-white font-mono text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {data.media} / 5.0
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Respostas computadas:</span>
            <span className="font-mono">{data.totalRespostas} registros</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const turmaAtivaObj = turmas.find((t) => t.id === selectedTurmaDesempenho) || turmas[0];
  const metricasTurmaAtiva = turmaAtivaObj ? calcularMetricasTurma(turmaAtivaObj.id) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Session Context Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-semibold text-emerald-100 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Portal do Docente Ativo
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {session.nome}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <Users className="w-4 h-4 text-emerald-300" />
                Turma Selecionada: <strong className="text-white ml-1">{session.turmaNome}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChangeModal(true)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mudar de Turma</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('responder');
            setShowSuccessCard(false);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'responder'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Responder Questionário</span>
        </button>

        <button
          onClick={() => setActiveTab('desempenho')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'desempenho'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Desempenho da Turma ({session.turmaNome})</span>
        </button>

        <button
          onClick={() => setActiveTab('panorama')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'panorama'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Panorama Geral das Turmas ({turmas.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: RESPONDER QUESTIONÁRIO                                  */}
      {/* ============================================================== */}
      {activeTab === 'responder' && (
        <>
          {showSuccessCard ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-xs animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Respostas Gravadas com Sucesso!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                Suas avaliações sobre a turma <strong>{session.turmaNome}</strong> foram salvas com sucesso no banco de dados na nuvem e já atualizaram os indicadores pedagógicos da escola.
              </p>

              {/* Direct Next Step Action Boxes */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <button
                  type="button"
                  onClick={() => {
                    if (session.turmaId) setSelectedTurmaDesempenho(session.turmaId);
                    setActiveTab('desempenho');
                  }}
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors cursor-pointer group"
                >
                  <BarChart3 className="w-5 h-5 text-emerald-700 mb-2" />
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Ver Desempenho da Turma</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Veja as médias e gráficos de {session.turmaNome}.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('panorama')}
                  className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60 transition-colors cursor-pointer group"
                >
                  <LayoutGrid className="w-5 h-5 text-indigo-700 mb-2" />
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Ver Panorama Geral</span>
                    <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Compare a situação de todas as turmas escolares.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessCard(false);
                    setRespostasState({});
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <ClipboardList className="w-5 h-5 text-slate-700 mb-2" />
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Nova Avaliação</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Responder para outra turma ou sala de aula.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Progress Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Questionário da Aula: {session.turmaNome} &bull; {session.salaNome}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Utilize as caixas interativas (Ótimo, Bom, Regular, Ruim) ou seletores para avaliar a aula.
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs font-semibold text-slate-700">
                    Progresso: <span className="font-mono tabular-nums text-emerald-700">{respondidasCount}</span> de{' '}
                    <span className="font-mono tabular-nums">{totalPerguntas}</span> respondidas
                  </div>
                  <div className="w-full sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Draft Recovered Banner */}
              {hasRestoredDraft && (
                <div className="mb-5 p-3.5 bg-indigo-50 border border-indigo-200/90 text-indigo-950 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-indigo-900">Rascunho recuperado com sucesso</span>
                      <span className="text-slate-600 text-[11px]">
                        Suas observações adicionais e respostas anteriores foram restauradas localmente da sessão anterior.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer"
                    >
                      Descartar Rascunho
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {activePerguntas.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                    <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Nenhuma pergunta cadastrada</p>
                    <p className="text-xs text-slate-500 mt-1">
                      A diretoria ainda não ativou perguntas neste questionário.
                    </p>
                  </div>
                ) : (
                  activePerguntas.map((p, idx) => {
                    const valorAtual = respostasState[p.id];
                    const foiRespondida = valorAtual !== undefined && valorAtual !== '';
                    const showSectionHeader =
                      idx === 0 || activePerguntas[idx - 1].categoria !== p.categoria;

                    const sectionTitles: Record<string, { title: string; subtitle: string }> = {
                      sala: {
                        title: '1. Condições da Sala de Aula & Instalações',
                        subtitle: 'Iluminação, ventilação, ar-condicionado, lousa e equipamentos',
                      },
                      turma: {
                        title: '2. Desempenho e Dinâmica dos Alunos',
                        subtitle: 'Foco, entrega de materiais, celulares, convivência e aprendizagem',
                      },
                      geral: {
                        title: '3. Observações Finais & Encaminhamentos',
                        subtitle: 'Comentários livres e solicitações à diretoria',
                      },
                    };

                    return (
                      <React.Fragment key={p.id}>
                        {showSectionHeader && sectionTitles[p.categoria] && (
                          <div className="pt-3 pb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                {sectionTitles[p.categoria].title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {sectionTitles[p.categoria].subtitle}
                            </p>
                          </div>
                        )}

                        <div
                          className={`bg-white rounded-xl border p-5 sm:p-6 transition-all ${
                            foiRespondida
                              ? 'border-emerald-200 ring-1 ring-emerald-100/50 shadow-2xs'
                              : 'border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 font-mono">
                                  #{idx + 1}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                  {p.categoria === 'sala' ? 'Sala' : p.categoria === 'turma' ? 'Alunos / Turma' : 'Geral'}
                                </span>
                                {p.obrigatoria && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                    Obrigatória
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                {p.enunciado}
                              </h4>
                            </div>

                            {foiRespondida && (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          {/* ============================================== */}
                          {/* INPUT TYPES - INCLUDING FORMULÁRIO DE CAIXAS   */}
                          {/* ============================================== */}
                          <div className="mt-4">
                            {p.tipo === 'escala' && (
                              <div>
                                <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                  Selecione uma caixa de avaliação:
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  {caixasOpcoes.map((cx) => {
                                    const IconComp = cx.icon;
                                    const isSelected =
                                      valorAtual === cx.tipo || valorAtual === cx.nota;

                                    return (
                                      <button
                                        type="button"
                                        key={cx.tipo}
                                        onClick={() => handleSetValor(p.id, cx.tipo)}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                          isSelected
                                            ? cx.activeBg
                                            : `${cx.bg} ${cx.border} text-slate-700 hover:border-slate-300`
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-extrabold uppercase tracking-wide">
                                            {cx.label}
                                          </span>
                                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : cx.text}`} />
                                        </div>
                                        <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                                          {cx.sublabel}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {valorAtual && (
                                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Selecionado: <strong>{String(valorAtual)}</strong></span>
                                  </div>
                                )}
                              </div>
                            )}

                            {p.tipo === 'sim_nao' && (
                              <div className="flex items-center gap-3">
                                {['Sim', 'Não'].map((opt) => {
                                  const isSelected = valorAtual === opt;
                                  return (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => handleSetValor(p.id, opt)}
                                      className={`px-7 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                          ? opt === 'Sim'
                                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                                            : 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-300'
                                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {p.tipo === 'multipla_escolha' && (
                              <div className="space-y-2">
                                {(p.opcoes || []).map((opt, i) => {
                                  const isSelected = valorAtual === opt;
                                  return (
                                    <label
                                      key={i}
                                      onClick={() => handleSetValor(p.id, opt)}
                                      className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                                          : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`pergunta_${p.id}`}
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {p.tipo === 'texto' && (
                              <div>
                                <textarea
                                  rows={isObsQuestion(p) ? 4 : 3}
                                  value={
                                    isObsQuestion(p)
                                      ? (observacoesAdicionais || (valorAtual as string) || '')
                                      : ((valorAtual as string) || '')
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleSetValor(p.id, val);
                                    if (isObsQuestion(p)) {
                                      setObservacoesAdicionais(val);
                                    }
                                  }}
                                  placeholder={
                                    isObsQuestion(p)
                                      ? "Escreva aqui suas observações adicionais... O texto é salvo automaticamente no seu navegador com debounce."
                                      : "Escreva aqui suas observações pedagógicas, pontos de atenção ou alunos que se destacaram..."
                                  }
                                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 leading-relaxed transition-all"
                                />

                                {isObsQuestion(p) && (
                                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                                    <div className="flex items-center gap-1.5">
                                      {autoSaveStatus === 'saving' && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                          Salvando rascunho automaticamente...
                                        </span>
                                      )}
                                      {autoSaveStatus === 'saved' && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          Salvo localmente {lastSavedTime ? `às ${lastSavedTime}` : ''}
                                        </span>
                                      )}
                                      {autoSaveStatus === 'idle' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                          <Save className="w-3.5 h-3.5 text-slate-400" />
                                          Salvamento automático debounced ativo
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                      <span>Progresso seguro contra interrupções</span>
                                      <span className="font-mono">
                                        {(observacoesAdicionais || (valorAtual as string) || '').length} caracteres
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Fallback dedicated block for Observações adicionais if no matching question is active */}
                {activePerguntas.length > 0 && !activePerguntas.some((p) => isObsQuestion(p)) && (
                  <div className="p-5 rounded-xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <label htmlFor="obs-adicionais-textarea" className="text-sm font-bold text-slate-900 block">
                            Observações adicionais
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Anotações pedagógicas, pontos de atenção ou solicitações gerais da turma.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {autoSaveStatus === 'saving' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Salvando rascunho...
                          </span>
                        )}
                        {autoSaveStatus === 'saved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Salvo localmente {lastSavedTime ? `às ${lastSavedTime}` : ''}
                          </span>
                        )}
                        {autoSaveStatus === 'idle' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Save className="w-3.5 h-3.5 text-slate-400" />
                            Salvamento automático ativo
                          </span>
                        )}
                      </div>
                    </div>

                    <textarea
                      id="obs-adicionais-textarea"
                      rows={4}
                      value={observacoesAdicionais}
                      onChange={(e) => setObservacoesAdicionais(e.target.value)}
                      placeholder="Escreva aqui suas observações adicionais sobre esta turma... O texto é salvo automaticamente no seu navegador com debounce."
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs leading-relaxed"
                    />

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>Progresso seguro contra fechamento acidental da página ou queda de rede.</span>
                      <span className="font-mono">{observacoesAdicionais.length} caracteres</span>
                    </div>
                  </div>
                )}

                {activePerguntas.length > 0 && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      {respondidasCount === totalPerguntas ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Todas as perguntas respondidas!
                        </span>
                      ) : (
                        <span>
                          Faltam {totalPerguntas - respondidasCount} pergunta(s) para completar.
                        </span>
                      )}
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Gravando no Banco...' : 'Gravar Respostas no Banco de Dados'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DESEMPENHO DA TURMA APÓS RESPONDER                      */}
      {/* ============================================================== */}
      {activeTab === 'desempenho' && (
        <div className="space-y-6 animate-fade-in">
          {/* Class Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desempenho e Indicadores da Turma
                </h3>
                <p className="text-xs text-slate-500">
                  Estatísticas consolidadas a partir de todas as avaliações registradas no IndexedDB.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Turma selecionada:</span>
              <select
                value={selectedTurmaDesempenho}
                onChange={(e) => setSelectedTurmaDesempenho(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:border-emerald-600"
              >
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.turno})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {metricasTurmaAtiva && (
            <>
              {/* Performance Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status Geral
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${metricasTurmaAtiva.corStatus}`}>
                      {metricasTurmaAtiva.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Classificação pelo índice médio
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Média de Avaliação
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-1 font-mono tabular-nums">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    {metricasTurmaAtiva.mediaNota} / 5.0
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {metricasTurmaAtiva.totalAvaliacoes} avaliações de professores
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Foco & Disciplina
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
                    {metricasTurmaAtiva.disciplinaMedia} / 5.0
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Nível de atenção em aula
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ocorrências Graves
                  </span>
                  <div className={`text-2xl font-extrabold mt-1 font-mono tabular-nums ${
                    metricasTurmaAtiva.ocorrenciasCount > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {metricasTurmaAtiva.ocorrenciasCount}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {metricasTurmaAtiva.ocorrenciasCount > 0 ? 'Exige mediação escolar' : 'Nenhuma ocorrência grave'}
                  </p>
                </div>
              </div>

              {/* ============================================================== */}
              {/* RECHARTS: GRÁFICO DE RADAR OU BARRAS POR CATEGORIA DE PERGUNTA */}
              {/* ============================================================== */}
              {turmaAtivaObj && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-base font-bold text-slate-900">
                          Média por Categoria de Pergunta ({turmaAtivaObj.nome})
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Visualização gráfica do desempenho médio da turma dividido por categorias de avaliação.
                      </p>
                    </div>

                    {/* Chart Type Toggle: Radar vs Barras */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTipoGrafico('radar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          tipoGrafico === 'radar'
                            ? 'bg-white text-emerald-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Radar (360°)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoGrafico('barras')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          tipoGrafico === 'barras'
                            ? 'bg-white text-emerald-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Barras</span>
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const dadosCategorias = calcularMediasCategorias(turmaAtivaObj.id);
                    const temDados = dadosCategorias.some((c) => c.totalRespostas > 0);

                    if (!temDados) {
                      return (
                        <div className="py-12 text-center text-slate-500">
                          <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-semibold text-slate-700">
                            Aguardando primeiras avaliações para gerar o gráfico
                          </p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                            Assim que os professores responderem às perguntas sobre a turma <strong>{turmaAtivaObj.nome}</strong>,
                            o gráfico de radar e de barras exibirá as médias consolidadas por categoria.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Chart Area */}
                        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[340px]">
                          <div className="w-full h-80 sm:h-88">
                            <ResponsiveContainer width="100%" height="100%">
                              {tipoGrafico === 'radar' ? (
                                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={dadosCategorias}>
                                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                                  <PolarAngleAxis
                                    dataKey="categoria"
                                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                                  />
                                  <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                  />
                                  <Radar
                                    name="Média da Categoria (1 a 5)"
                                    dataKey="media"
                                    stroke="#059669"
                                    fill="#10b981"
                                    fillOpacity={0.4}
                                  />
                                  <RechartsTooltip content={<CustomChartTooltip />} />
                                  <RechartsLegend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                </RadarChart>
                              ) : (
                                <BarChart
                                  data={dadosCategorias}
                                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                  <XAxis
                                    dataKey="categoria"
                                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                                    interval={0}
                                  />
                                  <YAxis
                                    domain={[0, 5]}
                                    ticks={[0, 1, 2, 3, 4, 5]}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                  />
                                  <RechartsTooltip content={<CustomChartTooltip />} />
                                  <Bar
                                    dataKey="media"
                                    name="Média da Categoria (1 a 5)"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={55}
                                  >
                                    {dadosCategorias.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.cor} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1">
                            Escala de avaliação normalizada de 1.0 (crítico) a 5.0 (excelente)
                          </span>
                        </div>

                        {/* Breakdown Cards by Category */}
                        <div className="lg:col-span-5 space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Detalhamento por Categoria:
                          </h5>
                          {dadosCategorias.map((item) => {
                            const percentual = Math.min(100, Math.round((item.media / 5) * 100));
                            let badgeCor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                            let statusTexto = 'Excelente';
                            if (item.media < 2.5) {
                              badgeCor = 'text-rose-700 bg-rose-50 border-rose-200';
                              statusTexto = 'Atenção Crítica';
                            } else if (item.media < 3.5) {
                              badgeCor = 'text-amber-700 bg-amber-50 border-amber-200';
                              statusTexto = 'Regular';
                            } else if (item.media < 4.4) {
                              badgeCor = 'text-sky-700 bg-sky-50 border-sky-200';
                              statusTexto = 'Bom';
                            }

                            return (
                              <div
                                key={item.key}
                                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: item.cor }}
                                    />
                                    <span className="font-bold text-xs text-slate-900">
                                      {item.categoria}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCor}`}>
                                    {statusTexto}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">
                                  {item.descricao}
                                </p>

                                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                  <span className="text-slate-600 text-[11px]">
                                    {item.totalRespostas} {item.totalRespostas === 1 ? 'registro' : 'registros'}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {item.media.toFixed(1)} / 5.0
                                  </span>
                                </div>

                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${percentual}%`,
                                      backgroundColor: item.cor,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Highlight Quotes & Teacher Observations */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Anotações e Alunos Citados pelos Professores em {turmaAtivaObj?.nome}
                  </h4>
                </div>

                {metricasTurmaAtiva.alunosDestacados.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nenhuma observação ou aluno citado para esta turma ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {metricasTurmaAtiva.alunosDestacados.map((obs, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                      >
                        {obs}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent evaluations for this turma */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Histórico Recente de Avaliações Desta Turma
                </h4>

                {metricasTurmaAtiva.respostasRecentes.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhum envio registrado para esta turma.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {metricasTurmaAtiva.respostasRecentes.map((r) => {
                      const dataStr = new Date(r.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{r.professorNome}</span>
                            <span className="text-slate-400 mx-1.5">&bull;</span>
                            <span className="text-slate-600">Sala: {r.salaNome}</span>
                            <span className="text-slate-400 mx-1.5">&bull;</span>
                            <span className="text-slate-500">{dataStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {Object.entries(r.respostas).slice(0, 3).map(([pid, val]) => (
                              <span
                                key={pid}
                                className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              >
                                {String(val)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PANORAMA GERAL DAS TURMAS                               */}
      {/* ============================================================== */}
      {activeTab === 'panorama' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Filter */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panorama Comparativo de Todas as Turmas
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o termômetro escolar de comportamento, engajamento e ocorrências.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filtrar:</span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFiltroPanorama('todas')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroPanorama === 'todas'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({turmas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroPanorama('otimo')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroPanorama === 'otimo'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ótimo / Bom
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroPanorama('regular_ruim')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroPanorama === 'regular_ruim'
                      ? 'bg-white text-rose-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Regular / Atenção
                </button>
              </div>
            </div>
          </div>

          {/* Turmas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas
              .map((turma) => {
                const met = calcularMetricasTurma(turma.id);
                return { turma, met };
              })
              .filter(({ met }) => {
                if (filtroPanorama === 'otimo') return met.mediaNota >= 3.5;
                if (filtroPanorama === 'regular_ruim') return met.mediaNota < 3.5 && met.totalAvaliacoes > 0;
                return true;
              })
              .map(({ turma, met }) => {
                return (
                  <div
                    key={turma.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">
                            {turma.nome}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Turno: {turma.turno}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${met.corStatus}`}>
                          {met.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Índice Médio</span>
                          <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {met.totalAvaliacoes > 0 ? `${met.mediaNota} / 5.0` : '-'}
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Avaliações</span>
                          <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                            {met.totalAvaliacoes}
                          </div>
                        </div>
                      </div>

                      {met.ocorrenciasCount > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{met.ocorrenciasCount} ocorrência(s) registrada(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTurmaDesempenho(turma.id);
                          setActiveTab('desempenho');
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver detalhes da turma</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const s = salas[0];
                          onChangeSalaTurma(s?.id || '', s?.nome || '', turma.id, turma.nome);
                          setActiveTab('responder');
                          setShowSuccessCard(false);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        Avaliar esta
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal to Switch Class */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Mudar Turma de Avaliação
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione a turma que você deseja avaliar agora.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione a Turma / Série
                </label>
                <select
                  value={selectedTurmaId}
                  onChange={(e) => setSelectedTurmaId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                >
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} — Turno {t.turno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmChangeSalaTurma}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Confirmar Turma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
