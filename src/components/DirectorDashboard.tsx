import React, { useState } from 'react';
import { Pergunta, RespostaEnvio, Sala, Turma, QuestionCategory, QuestionType } from '../types';
import {
  Plus,
  Trash2,
  Filter,
  Download,
  Database,
  Building,
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
  onDeleteTurma: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onExportCsv: () => void;
  onExportJson: () => void;
  onDownloadHtml: () => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  perguntas,
  respostas,
  salas,
  turmas,
  onAddPergunta,
  onDeletePergunta,
  onTogglePerguntaAtiva,
  onAddSala,
  onDeleteSala,
  onAddTurma,
  onDeleteTurma,
  onResetDefaults,
  onExportCsv,
  onExportJson,
  onDownloadHtml,
}) => {
  const [activeTab, setActiveTab] = useState<'perguntas' | 'respostas' | 'salas_turmas' | 'database'>('perguntas');

  // Form states for new question
  const [novoEnunciado, setNovoEnunciado] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<QuestionCategory>('sala');
  const [novoTipo, setNovoTipo] = useState<QuestionType>('escala');
  const [opcoesTexto, setOpcoesTexto] = useState('Excelente\nBom\nRegular\nRuim');
  const [obrigatoria, setObrigatoria] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filters for responses
  const [filtroSala, setFiltroSala] = useState<string>('todos');
  const [filtroTurma, setFiltroTurma] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [expandedRespostaId, setExpandedRespostaId] = useState<string | null>(null);

  // New Sala / Turma form
  const [novaSalaNome, setNovaSalaNome] = useState('');
  const [novaSalaBloco, setNovaSalaBloco] = useState('Bloco Principal');
  const [novaTurmaNome, setNovaTurmaNome] = useState('');
  const [novaTurmaTurno, setNovaTurmaTurno] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Integral'>('Manhã');

  // Confirmation dialog state
  const [perguntaParaExcluir, setPerguntaParaExcluir] = useState<Pergunta | null>(null);

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
      setFeedbackMsg('Pergunta cadastrada com sucesso no IndexedDB!');
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

  const handleAddNovaSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSalaNome.trim()) return;
    await onAddSala(novaSalaNome.trim(), novaSalaBloco.trim());
    setNovaSalaNome('');
  };

  const handleAddNovaTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTurmaNome.trim()) return;
    await onAddTurma(novaTurmaNome.trim(), novaTurmaTurno);
    setNovaTurmaNome('');
  };

  // Filtered responses logic
  const filteredRespostas = respostas.filter((r) => {
    if (filtroSala !== 'todos' && r.salaId !== filtroSala) return false;
    if (filtroTurma !== 'todos' && r.turmaId !== filtroTurma) return false;
    if (filtroBusca.trim()) {
      const q = filtroBusca.toLowerCase();
      const matchProf = r.professorNome.toLowerCase().includes(q);
      const matchSala = r.salaNome.toLowerCase().includes(q);
      const matchTurma = r.turmaNome.toLowerCase().includes(q);
      return matchProf || matchSala || matchTurma;
    }
    return true;
  });

  // Calculate quick metrics
  const totalRespostas = respostas.length;
  const escalaScores: number[] = [];
  respostas.forEach((r) => {
    Object.values(r.respostas).forEach((val) => {
      if (typeof val === 'number') escalaScores.push(val);
    });
  });
  const mediaGeralAvaliacao =
    escalaScores.length > 0
      ? (escalaScores.reduce((a, b) => a + b, 0) / escalaScores.length).toFixed(1)
      : '5.0';

  const categoryLabels: Record<QuestionCategory, { label: string; color: string }> = {
    sala: { label: 'Estrutura da Sala', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    turma: { label: 'Comportamento da Turma', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    geral: { label: 'Geral / Melhorias', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  };

  const typeLabels: Record<QuestionType, string> = {
    escala: 'Escala 1 a 5 (Estrelas)',
    sim_nao: 'Sim ou Não',
    multipla_escolha: 'Múltipla Escolha',
    texto: 'Texto Dissertativo',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Painel da Direção Escolar
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão do Questionário e Resultados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre perguntas para os professores responderem e visualize a avaliação contínua da escola.
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
          onClick={() => setActiveTab('salas_turmas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'salas_turmas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Salas & Turmas ({salas.length} / {turmas.length})</span>
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
          <span>Banco de Dados (IndexedDB)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TAB 1: PERGUNTAS */}
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
                Esta pergunta ficará imediatamente visível para todos os professores ao responderem o questionário.
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
                    placeholder="Ex: As tomadas e equipamentos audiovisuais estavam funcionando normalmente?"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Foco / Categoria
                    </label>
                    <select
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value as QuestionCategory)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="sala">Estrutura da Sala</option>
                      <option value="turma">Comportamento da Turma</option>
                      <option value="geral">Geral / Observações</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Resposta
                    </label>
                    <select
                      value={novoTipo}
                      onChange={(e) => setNovoTipo(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="escala">Escala 1 a 5 (Estrelas)</option>
                      <option value="sim_nao">Sim ou Não</option>
                      <option value="multipla_escolha">Múltipla Escolha</option>
                      <option value="texto">Texto Livre</option>
                    </select>
                  </div>
                </div>

                {novoTipo === 'multipla_escolha' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opções da Múltipla Escolha (uma por linha)
                    </label>
                    <textarea
                      rows={3}
                      value={opcoesTexto}
                      onChange={(e) => setOpcoesTexto(e.target.value)}
                      placeholder="Excelente&#10;Bom&#10;Regular&#10;Ruim"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={obrigatoria}
                      onChange={(e) => setObrigatoria(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Resposta obrigatória</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingQuestion}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    {isSubmittingQuestion ? 'Salvando...' : '+ Salvar Pergunta'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Column Right: Lista de Perguntas */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Perguntas Ativas no Questionário
                  </h2>
                  <p className="text-xs text-slate-500">
                    O diretor pode excluir perguntas antigas ou desativar temporariamente.
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {perguntas.length} cadastradas
                </span>
              </div>

              {perguntas.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Nenhuma pergunta cadastrada</p>
                  <p className="text-xs text-slate-500 mt-1">Use o formulário ao lado para cadastrar a primeira pergunta.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {perguntas.map((p, idx) => (
                    <div
                      key={p.id}
                      className="py-4 flex items-start justify-between gap-4 group hover:bg-slate-50/60 -mx-3 px-3 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                              categoryLabels[p.categoria].color
                            }`}
                          >
                            {categoryLabels[p.categoria].label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {typeLabels[p.tipo]}
                          </span>
                          {p.obrigatoria ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Obrigatória
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">
                              Opcional
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {p.enunciado}
                        </p>

                        {p.opcoes && p.opcoes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.opcoes.map((opt, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
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

      {/* TAB 2: RESPOSTAS & RELATÓRIOS */}
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
              <span className="text-xs text-emerald-600 font-medium">Registros no IndexedDB</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Média Geral de Avaliações
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1 flex items-center gap-1 font-mono tabular-nums">
                <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                {mediaGeralAvaliacao} / 5.0
              </div>
              <span className="text-xs text-slate-500">Média das questões de escala</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Salas Monitoradas
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {salas.length}
              </div>
              <span className="text-xs text-slate-500">Espaços físicos ativos</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Turmas Acompanhadas
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
                {turmas.length}
              </div>
              <span className="text-xs text-slate-500">Classes cadastradas</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Filtrar por:</span>
              </div>

              <select
                value={filtroSala}
                onChange={(e) => setFiltroSala(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600"
              >
                <option value="todos">Todas as Salas</option>
                {salas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>

              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-indigo-600"
              >
                <option value="todos">Todas as Turmas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar por professor ou termo..."
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
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
                IndexedDB Store: respostas
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
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {resp.salaNome}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {resp.turmaNome}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                          <span>·</span>
                          <span>{Object.keys(resp.respostas).length} respostas fornecidas</span>
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
                          Detalhamento das Respostas:
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

      {/* TAB 3: SALAS & TURMAS */}
      {activeTab === 'salas_turmas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Gerenciar Salas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Salas de Aula Cadastradas</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Espaços físicos avaliados pelos professores.
            </p>

            <form onSubmit={handleAddNovaSala} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                value={novaSalaNome}
                onChange={(e) => setNovaSalaNome(e.target.value)}
                placeholder="Ex: Sala Maker / Robótica"
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
              >
                + Adicionar Sala
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {salas.map((sala) => (
                <div key={sala.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{sala.nome}</span>
                    {sala.bloco && (
                      <span className="text-slate-400 ml-2">({sala.bloco})</span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteSala(sala.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    title="Remover sala"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gerenciar Turmas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Turmas Cadastradas</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Séries e turmas que os professores selecionam ao responder.
            </p>

            <form onSubmit={handleAddNovaTurma} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                value={novaTurmaNome}
                onChange={(e) => setNovaTurmaNome(e.target.value)}
                placeholder="Ex: 2º Ano Ensino Médio B"
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
              <select
                value={novaTurmaTurno}
                onChange={(e) => setNovaTurmaTurno(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg px-2 bg-white"
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
                <option value="Integral">Integral</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                + Adicionar Turma
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {turmas.map((turma) => (
                <div key={turma.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{turma.nome}</span>
                    <span className="text-slate-400 ml-2">({turma.turno})</span>
                  </div>
                  <button
                    onClick={() => onDeleteTurma(turma.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    title="Remover turma"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BANCO DE DADOS (INDEXEDDB) */}
      {activeTab === 'database' && (
        <div className="mt-6 max-w-4xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Arquitetura do Banco de Dados: IndexedDB
                </h2>
                <p className="text-xs text-slate-500">
                  Banco transacional assíncrono nativo do navegador (Name: <code>EscolaQuestionarioDB</code>, v1).
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              O IndexedDB é o mecanismo mais robusto de armazenamento local na Web moderna. Ao contrário do simples <code className="bg-slate-100 px-1 py-0.5 rounded">localStorage</code> (que é síncrono e limitado a 5MB de strings), o IndexedDB suporta transações atômicas ACID, índices por múltiplos campos e grandes volumes de respostas sem degradar a interface.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Store: perguntas</span>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{perguntas.length} itens</div>
                <p className="text-[11px] text-slate-500">Índices: categoria, ordem</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Store: respostas</span>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{respostas.length} itens</div>
                <p className="text-[11px] text-slate-500">Índices: sala, turma, timestamp</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Store: salas</span>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{salas.length} itens</div>
                <p className="text-[11px] text-slate-500">Salas físicas cadastradas</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Store: turmas</span>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{turmas.length} itens</div>
                <p className="text-[11px] text-slate-500">Séries e turnos escolares</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Versão Autônoma em Arquivo Único</h4>
                <p className="text-xs text-slate-500">
                  Baixe o código HTML pronto com CSS + JS + IndexedDB integrados para rodar sem servidor.
                </p>
              </div>
              <button
                onClick={onDownloadHtml}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Baixar questionario.html</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
              <button
                onClick={onResetDefaults}
                className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Dados e Perguntas Iniciais</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Question */}
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
              Esta ação removerá a pergunta do IndexedDB e ela não será mais exibida para os professores.
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
