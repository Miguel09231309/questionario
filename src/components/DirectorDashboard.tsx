import React, { useState } from 'react';
import { Pergunta, RespostaEnvio, Sala, Turma, QuestionCategory, QuestionType } from '../types';
import {
  Plus,
  Trash2,
  Filter,
  Download,
  Database,
  Users,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  AlertCircle,
  Star,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  Eye,
  Check,
  X,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';

interface DirectorDashboardProps {
  perguntas: Pergunta[];
  respostas: RespostaEnvio[];
  salas: Sala[];
  turmas: Turma[];
  onAddPergunta: (pergunta: Omit<Pergunta, 'id' | 'criadaEm' | 'ordem'>) => Promise<void>;
  onDeletePergunta: (id: string) => Promise<void>;
  onTogglePerguntaAtiva: (id: string, ativa: boolean) => Promise<void>;
  onAddSala: (nome: string, bloco?: string) => Promise<void>;
  onDeleteSala: (id: string) => Promise<void>;
  onAddTurma: (nome: string, turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral') => Promise<void>;
  onEditTurma: (id: string, nome: string, turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral') => Promise<void>;
  onDeleteTurma: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  perguntas,
  respostas,
  turmas,
  onAddPergunta,
  onDeletePergunta,
  onTogglePerguntaAtiva,
  onAddTurma,
  onEditTurma,
  onDeleteTurma,
  onResetDefaults,
  onExportCsv,
  onExportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'perguntas' | 'respostas' | 'turmas' | 'database'>('turmas');

  // Form states for new question
  const [novoEnunciado, setNovoEnunciado] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<QuestionCategory>('turma');
  const [novoTipo, setNovoTipo] = useState<QuestionType>('escala');
  const [opcoesTexto, setOpcoesTexto] = useState('Excelente\nBom\nRegular\nRuim');
  const [obrigatoria, setObrigatoria] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filters for responses
  const [filtroTurma, setFiltroTurma] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [expandedRespostaId, setExpandedRespostaId] = useState<string | null>(null);

  // New Turma form state
  const [novaTurmaNome, setNovaTurmaNome] = useState('');
  const [novaTurmaTurno, setNovaTurmaTurno] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Integral'>('Manhã');
  const [isSubmittingNovaTurma, setIsSubmittingNovaTurma] = useState(false);

  // Edit Turma modal states
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<Turma | null>(null);
  const [editTurmaNome, setEditTurmaNome] = useState('');
  const [editTurmaTurno, setEditTurmaTurno] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Integral'>('Manhã');
  const [isSavingEdicaoTurma, setIsSavingEdicaoTurma] = useState(false);

  // Confirmation dialog state
  const [perguntaParaExcluir, setPerguntaParaExcluir] = useState<Pergunta | null>(null);
  const [turmaParaExcluir, setTurmaParaExcluir] = useState<Turma | null>(null);

  const handleSalvarPergunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEnunciado.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      let opcoes: string[] | undefined = undefined;
      if (novoTipo === 'multipla_escolha') {
        opcoes = opcoesTexto
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean);
        if (opcoes.length < 2) {
          alert('Por favor, informe no mínimo 2 opções para a múltipla escolha.');
          setIsSubmittingQuestion(false);
          return;
        }
      }

      await onAddPergunta({
        enunciado: novoEnunciado.trim(),
        categoria: novaCategoria,
        tipo: novoTipo,
        opcoes,
        obrigatoria,
        ativa: true,
      });

      setNovoEnunciado('');
      setFeedbackMsg('Pergunta cadastrada com sucesso no Banco de Dados!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!perguntaParaExcluir) return;
    await onDeletePergunta(perguntaParaExcluir.id);
    setPerguntaParaExcluir(null);
    setFeedbackMsg('Pergunta excluída do banco de dados.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleAddNovaTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTurmaNome.trim()) return;
    setIsSubmittingNovaTurma(true);
    try {
      await onAddTurma(novaTurmaNome.trim(), novaTurmaTurno);
      setNovaTurmaNome('');
      setFeedbackMsg(`Turma "${novaTurmaNome.trim()}" cadastrada com sucesso!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setIsSubmittingNovaTurma(false);
    }
  };

  const handleAbrirEdicaoTurma = (turma: Turma) => {
    setTurmaEmEdicao(turma);
    setEditTurmaNome(turma.nome);
    setEditTurmaTurno(turma.turno);
  };

  const handleSalvarEdicaoTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaEmEdicao || !editTurmaNome.trim()) return;
    setIsSavingEdicaoTurma(true);
    try {
      await onEditTurma(turmaEmEdicao.id, editTurmaNome.trim(), editTurmaTurno);
      const nomeSalvo = editTurmaNome.trim();
      setTurmaEmEdicao(null);
      setFeedbackMsg(`Turma alterada com sucesso para "${nomeSalvo}" (${editTurmaTurno})!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setIsSavingEdicaoTurma(false);
    }
  };

  const handleConfirmarExclusaoTurma = async () => {
    if (!turmaParaExcluir) return;
    await onDeleteTurma(turmaParaExcluir.id);
    const nomeExcluido = turmaParaExcluir.nome;
    setTurmaParaExcluir(null);
    setFeedbackMsg(`Turma "${nomeExcluido}" excluída do sistema.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Filtered responses logic
  const filteredRespostas = respostas.filter((r) => {
    if (filtroTurma !== 'todos' && r.turmaId !== filtroTurma) return false;
    if (filtroBusca.trim()) {
      const q = filtroBusca.toLowerCase();
      const matchProf = r.professorNome.toLowerCase().includes(q);
      const matchTurma = r.turmaNome.toLowerCase().includes(q);
      return matchProf || matchTurma;
    }
    return true;
  });

  // Calculate quick metrics
  const totalRespostas = respostas.length;
  const escalaScores: number[] = [];
  respostas.forEach((r) => {
    Object.values(r.respostas).forEach((val) => {
      if (typeof val === 'number') escalaScores.push(val);
      if (typeof val === 'string') {
        if (val === 'Ótimo') escalaScores.push(5);
        else if (val === 'Bom') escalaScores.push(4);
        else if (val === 'Regular') escalaScores.push(3);
        else if (val === 'Ruim') escalaScores.push(1);
      }
    });
  });
  const mediaGeralAvaliacao =
    escalaScores.length > 0
      ? (escalaScores.reduce((a, b) => a + b, 0) / escalaScores.length).toFixed(1)
      : '5.0';

  const categoryLabels: Record<QuestionCategory, { label: string; color: string }> = {
    sala: { label: 'Infraestrutura da Turma', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    turma: { label: 'Comportamento da Turma', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    geral: { label: 'Geral / Melhorias', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  };

  const typeLabels: Record<QuestionType, string> = {
    escala: 'Escala 1 a 5 (Estrelas / Caixas)',
    sim_nao: 'Sim ou Não',
    multipla_escolha: 'Múltipla Escolha',
    texto: 'Texto Dissertativo',
  };

  // Turno badge helper
  const getTurnoBadge = (turno: Turma['turno']) => {
    switch (turno) {
      case 'Manhã':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Tarde':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Noite':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Integral':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper to compute stats for a single turma
  const getTurmaStats = (turmaId: string) => {
    const respTurma = respostas.filter((r) => r.turmaId === turmaId);
    const notas: number[] = [];
    respTurma.forEach((r) => {
      Object.values(r.respostas).forEach((val) => {
        if (typeof val === 'number') notas.push(val);
        if (typeof val === 'string') {
          if (val === 'Ótimo') notas.push(5);
          else if (val === 'Bom') notas.push(4);
          else if (val === 'Regular') notas.push(3);
          else if (val === 'Ruim') notas.push(1);
        }
      });
    });

    const media = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : null;
    return {
      total: respTurma.length,
      media,
      mediaNum: media ? parseFloat(media) : 5.0,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Painel da Direção Escolar
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão Escolar, Turmas e Questionários
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize todas as turmas, edite turmas escolares, gerencie perguntas e acompanhe as respostas dos professores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mt-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('turmas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'turmas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Turmas da Escola ({turmas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('respostas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'respostas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Respostas dos Professores ({respostas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('perguntas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'perguntas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Perguntas Cadastradas ({perguntas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'database'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Banco de Dados (Firestore)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TURMAS DA ESCOLA (VISUALIZAR TODAS AS TURMAS & MUDAR TURMAS)      */}
      {/* ========================================================================= */}
      {activeTab === 'turmas' && (
        <div className="mt-6 space-y-6">
          {/* Top Info & Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total de Turmas
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {turmas.length} turmas
              </div>
              <span className="text-xs text-indigo-600 font-medium">Cadastradas na instituição</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Turno Matutino
              </span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1 font-mono tabular-nums">
                {turmas.filter((t) => t.turno === 'Manhã').length}
              </div>
              <span className="text-xs text-slate-500">Turmas pela manhã</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Turno Vespertino
              </span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums">
                {turmas.filter((t) => t.turno === 'Tarde').length}
              </div>
              <span className="text-xs text-slate-500">Turmas pela tarde</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Noite & Integral
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono tabular-nums">
                {turmas.filter((t) => t.turno === 'Noite' || t.turno === 'Integral').length}
              </div>
              <span className="text-xs text-slate-500">Turmas especiais</span>
            </div>
          </div>

          {/* New Turma Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Cadastrar Nova Turma</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Adicione novas turmas para ficarem disponíveis aos professores no questionário.
            </p>

            <form onSubmit={handleAddNovaTurma} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={novaTurmaNome}
                  onChange={(e) => setNovaTurmaNome(e.target.value)}
                  placeholder="Nome da Turma (Ex: 2º Ano B, 8º Ano C, Pré-Vestibular)"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
                />
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={novaTurmaTurno}
                  onChange={(e) => setNovaTurmaTurno(e.target.value as any)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-indigo-600"
                >
                  <option value="Manhã">Turno: Manhã</option>
                  <option value="Tarde">Turno: Tarde</option>
                  <option value="Noite">Turno: Noite</option>
                  <option value="Integral">Turno: Integral</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmittingNovaTurma}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Turma</span>
              </button>
            </form>
          </div>

          {/* Grid of ALL Turmas with "Mudar Turmas" actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Todas as Turmas Cadastradas ({turmas.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  O diretor pode mudar o nome e o turno de qualquer turma clicando no botão "Mudar Turma".
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Sincronizado no Firebase Firestore
              </span>
            </div>

            {turmas.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Nenhuma turma cadastrada no momento.</p>
                <p className="text-xs text-slate-400 mt-1">Utilize o formulário acima para adicionar a primeira turma.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
                {turmas.map((turma) => {
                  const stats = getTurmaStats(turma.id);

                  let statusBadge = {
                    label: 'Excelente',
                    cor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  };
                  if (!stats.media) {
                    statusBadge = {
                      label: 'Sem avaliações',
                      cor: 'bg-slate-50 text-slate-600 border-slate-200',
                    };
                  } else if (stats.mediaNum < 2.5) {
                    statusBadge = {
                      label: 'Atenção Crítica',
                      cor: 'bg-rose-50 text-rose-700 border-rose-200',
                    };
                  } else if (stats.mediaNum < 3.8) {
                    statusBadge = {
                      label: 'Regular',
                      cor: 'bg-amber-50 text-amber-700 border-amber-200',
                    };
                  } else if (stats.mediaNum < 4.5) {
                    statusBadge = {
                      label: 'Bom',
                      cor: 'bg-blue-50 text-blue-700 border-blue-200',
                    };
                  }

                  return (
                    <div
                      key={turma.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header of Turma Card */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md border ${getTurnoBadge(
                              turma.turno
                            )}`}
                          >
                            {turma.turno}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusBadge.cor}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Turma Name */}
                        <h4 className="text-base font-bold text-slate-900 mb-2">
                          {turma.nome}
                        </h4>

                        {/* Performance metrics of this Turma */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Avaliações recebidas:</span>
                            <span className="font-bold text-slate-900 font-mono">
                              {stats.total} {stats.total === 1 ? 'registro' : 'registros'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-600">
                            <span>Média de satisfação:</span>
                            {stats.media ? (
                              <span className="font-bold text-indigo-700 flex items-center gap-1 font-mono">
                                <Star className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                                {stats.media} / 5.0
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pendente</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Mudar Turma & Ver Respostas */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirEdicaoTurma(turma)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-indigo-200/70"
                          title="Mudar nome e turno desta turma"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Mudar Turma</span>
                        </button>

                        {stats.total > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFiltroTurma(turma.id);
                              setActiveTab('respostas');
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver avaliações desta turma"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setTurmaParaExcluir(turma)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir turma"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESPOSTAS DOS PROFESSORES (SEM SALA, SÓ TURMA)                    */}
      {/* ========================================================================= */}
      {activeTab === 'respostas' && (
        <div className="mt-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total de Avaliações
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {totalRespostas}
              </div>
              <span className="text-xs text-emerald-600 font-medium">Sincronizadas no Firestore</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Média Geral das Turmas
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1 flex items-center gap-1 font-mono tabular-nums">
                <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                {mediaGeralAvaliacao} / 5.0
              </div>
              <span className="text-xs text-slate-500">Média ponderada geral</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Turmas Cadastradas
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {turmas.length}
              </div>
              <span className="text-xs text-slate-500">Total no colégio</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Turmas Avaliadas
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {turmas.filter((t) => respostas.some((r) => r.turmaId === t.id)).length} de {turmas.length}
              </div>
              <span className="text-xs text-slate-500">Com pelo menos 1 registro</span>
            </div>
          </div>

          {/* Filters Bar: ONLY TURMA & BUSCA (NO SALA) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Filtrar por Turma:</span>
              </div>

              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600"
              >
                <option value="todos">Todas as Turmas ({turmas.length})</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.turno})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar professor ou turma..."
                className="w-full text-xs px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Respostas List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Envios de Professores ({filteredRespostas.length} de {respostas.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Firestore: respostas
              </span>
            </div>

            {filteredRespostas.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Nenhuma resposta encontrada para os filtros atuais.</p>
              </div>
            ) : (
              filteredRespostas.map((resp) => {
                const isExpanded = expandedRespostaId === resp.id;
                const formattedDate = new Date(resp.timestamp).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={resp.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedRespostaId(isExpanded ? null : resp.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm text-slate-900">
                            {resp.professorNome}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/70">
                            Turma: {resp.turmaNome}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                          <span>·</span>
                          <span>{Object.keys(resp.respostas).length} perguntas respondidas</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 font-semibold hidden sm:inline">
                          {isExpanded ? 'Recolher detalhes' : 'Ver respostas'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded answers detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-3 animate-fade-in">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Detalhamento das Respostas Fornecidas:
                        </h4>

                        <div className="space-y-2.5">
                          {Object.entries(resp.respostas).map(([perguntaId, valor]) => {
                            const pObj = perguntas.find((p) => p.id === perguntaId);
                            const textoPergunta = pObj ? pObj.enunciado : `Pergunta ID ${perguntaId}`;

                            return (
                              <div
                                key={perguntaId}
                                className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs"
                              >
                                <div className="font-medium text-slate-600 mb-1">{textoPergunta}</div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {pObj?.tipo === 'escala' && typeof valor === 'number' ? (
                                    <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                                      <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                                      Nota {valor} / 5
                                    </span>
                                  ) : (
                                    <span className="text-slate-900">{String(valor)}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {resp.observacoesGerais && (
                            <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200/80 text-xs mt-2.5">
                              <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-700" />
                                Observações Adicionais Registradas:
                              </div>
                              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {resp.observacoesGerais}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERGUNTAS CADASTRADAS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'perguntas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Column Left: Cadastro de Nova Pergunta */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs sticky top-24">
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Cadastrar Nova Pergunta
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Esta pergunta ficará imediatamente visível para todos os professores ao avaliarem as turmas.
              </p>

              <form onSubmit={handleSalvarPergunta} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enunciado da Pergunta *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={novoEnunciado}
                    onChange={(e) => setNovoEnunciado(e.target.value)}
                    placeholder="Ex: Como você avalia a pontualidade e o foco dos alunos durante a aula?"
                    className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoria da Pergunta
                    </label>
                    <select
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value as QuestionCategory)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="turma">Desempenho da Turma</option>
                      <option value="sala">Recursos Pedagógicos</option>
                      <option value="geral">Geral / Observações</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Formato de Resposta
                    </label>
                    <select
                      value={novoTipo}
                      onChange={(e) => setNovoTipo(e.target.value as QuestionType)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="escala">Escala 1 a 5 (Estrelas / Caixas)</option>
                      <option value="sim_nao">Sim / Não</option>
                      <option value="multipla_escolha">Múltipla Escolha</option>
                      <option value="texto">Texto Dissertativo</option>
                    </select>
                  </div>
                </div>

                {novoTipo === 'multipla_escolha' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opções de Resposta (uma por linha) *
                    </label>
                    <textarea
                      rows={3}
                      value={opcoesTexto}
                      onChange={(e) => setOpcoesTexto(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="obrigatoria"
                    checked={obrigatoria}
                    onChange={(e) => setObrigatoria(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="obrigatoria" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Resposta Obrigatória pelo Professor
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Pergunta</span>
                </button>
              </form>
            </div>
          </div>

          {/* Column Right: Lista de Perguntas */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/70 flex items-center justify-between border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Perguntas Ativas no Questionário ({perguntas.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ordem de exibição respeitada durante o preenchimento.
                  </p>
                </div>
              </div>

              {perguntas.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">Nenhuma pergunta cadastrada.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {perguntas.map((p, index) => (
                    <div key={p.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              categoryLabels[p.categoria]?.color || 'text-slate-600'
                            }`}
                          >
                            {categoryLabels[p.categoria]?.label || p.categoria}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{typeLabels[p.tipo]}</span>
                          {p.obrigatoria && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Obrigatória
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {p.enunciado}
                        </p>

                        {p.opcoes && p.opcoes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.opcoes.map((opt, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pt-1">
                        <button
                          onClick={() => setPerguntaParaExcluir(p)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir pergunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BANCO DE DADOS (FIRESTORE)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'database' && (
        <div className="mt-6 max-w-4xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Banco de Dados em Nuvem: Firebase Firestore & Sincronização em Tempo Real
                </h2>
                <p className="text-xs text-slate-500">
                  Infraestrutura NoSQL serverless distribuída com replicação automática e escuta de eventos via WebSockets.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              O sistema utiliza o <strong>Firebase Firestore</strong> como banco de dados principal de produção. Todas as alterações efetuadas pela coordenação (como cadastrar e mudar turmas) ou respostas submetidas pelos professores são sincronizadas instantaneamente com listeners em tempo real (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">onSnapshot</code>).
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Coleção: turmas</span>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{turmas.length} documentos</div>
                <p className="text-[11px] text-slate-500">Séries e turnos letivos</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Coleção: respostas</span>
                <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">{respostas.length} documentos</div>
                <p className="text-[11px] text-slate-500">Histórico de avaliações</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Coleção: perguntas</span>
                <div className="text-lg font-bold text-indigo-700 font-mono tabular-nums">{perguntas.length} documentos</div>
                <p className="text-[11px] text-slate-500">Perguntas ativas e regras</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Exportação e Cópia de Segurança (Backup)</h4>
                <p className="text-xs text-slate-500">
                  Exporte o banco de dados completo em formato JSON ou CSV para arquivamento ou análise externa.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onExportJson}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Backup JSON</span>
                </button>
                <button
                  onClick={onExportCsv}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Planilha CSV</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={onResetDefaults}
                className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Dados e Perguntas Padrão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MUDAR / EDITAR TURMA                                              */}
      {/* ========================================================================= */}
      {turmaEmEdicao && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mudar Turma</h3>
                  <p className="text-xs text-slate-500">Alterar nome e turno desta turma</p>
                </div>
              </div>
              <button
                onClick={() => setTurmaEmEdicao(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoTurma} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Turma / Série *
                </label>
                <input
                  type="text"
                  required
                  value={editTurmaNome}
                  onChange={(e) => setEditTurmaNome(e.target.value)}
                  placeholder="Ex: 6º Ano A, 3º Ano Médio B"
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turno Letivo *
                </label>
                <select
                  value={editTurmaTurno}
                  onChange={(e) => setEditTurmaTurno(e.target.value as any)}
                  className="w-full text-sm px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-indigo-600"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTurmaEmEdicao(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdicaoTurma}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações da Turma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO EXCLUSÃO DE TURMA                                     */}
      {/* ========================================================================= */}
      {turmaParaExcluir && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Excluir Turma?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Tem certeza de que deseja remover a turma:
              <br />
              <strong className="text-slate-900 mt-1 block italic">"{turmaParaExcluir.nome}" ({turmaParaExcluir.turno})</strong>
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Esta ação removerá a turma do banco de dados na nuvem e ela não será mais selecionável para os professores.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setTurmaParaExcluir(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusaoTurma}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Sim, Excluir Turma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO EXCLUSÃO DE PERGUNTA                                  */}
      {/* ========================================================================= */}
      {perguntaParaExcluir && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Excluir Pergunta?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Tem certeza de que deseja remover a pergunta:
              <br />
              <strong className="text-slate-900 mt-1 block italic">"{perguntaParaExcluir.enunciado}"</strong>
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Esta ação removerá a pergunta do banco de dados na nuvem e ela não será mais exibida para os professores.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPerguntaParaExcluir(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Sim, Excluir Pergunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
