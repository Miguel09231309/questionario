import React, { useState } from 'react';
import { Pergunta, RespostaEnvio, UserSession, Sala, Turma } from '../types';
import {
  CheckCircle2,
  Building,
  Users,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Star,
  MessageSquare,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface TeacherViewProps {
  session: UserSession;
  perguntas: Pergunta[];
  salas: Sala[];
  turmas: Turma[];
  onSalvarResposta: (resposta: Omit<RespostaEnvio, 'id' | 'criadaEm' | 'timestamp'>) => Promise<void>;
  onChangeSalaTurma: (salaId: string, salaNome: string, turmaId: string, turmaNome: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  session,
  perguntas,
  salas,
  turmas,
  onSalvarResposta,
  onChangeSalaTurma,
}) => {
  const [respostasState, setRespostasState] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Modal edit states
  const [selectedSalaId, setSelectedSalaId] = useState(session.salaId || salas[0]?.id || '');
  const [selectedTurmaId, setSelectedTurmaId] = useState(session.turmaId || turmas[0]?.id || '');

  // Only active questions
  const activePerguntas = perguntas.filter((p) => p.ativa);

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
      await onSalvarResposta({
        professorNome: session.nome,
        salaId: session.salaId || 'sala-geral',
        salaNome: session.salaNome || 'Sala Principal',
        turmaId: session.turmaId || 'turma-geral',
        turmaNome: session.turmaNome || 'Turma Principal',
        respostas: respostasState,
      });

      setShowSuccessCard(true);
      setRespostasState({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmChangeSalaTurma = () => {
    const s = salas.find((item) => item.id === selectedSalaId) || salas[0];
    const t = turmas.find((item) => item.id === selectedTurmaId) || turmas[0];
    onChangeSalaTurma(s.id, s.nome, t.id, t.nome);
    setShowChangeModal(false);
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Muito Ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Session Context Bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/60 border border-emerald-400/40 text-[11px] font-semibold text-emerald-100 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sessão Ativa do Docente
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {session.nome}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-md">
                <Building className="w-3.5 h-3.5 text-emerald-200" />
                Sala: <strong className="text-white">{session.salaNome}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-md">
                <Users className="w-3.5 h-3.5 text-emerald-200" />
                Turma: <strong className="text-white">{session.turmaNome}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowChangeModal(true)}
            className="self-start sm:self-auto px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
          >
            Alterar Sala / Turma
          </button>
        </div>
      </div>

      {showSuccessCard ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Avaliação Enviada com Sucesso!
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            Suas respostas foram salvas no banco de dados local (IndexedDB) e já estão disponíveis no painel da diretoria.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowSuccessCard(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Responder Novamente para Outra Turma / Sala
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Progress Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Questionário de Avaliação da Aula
              </h2>
              <p className="text-xs text-slate-500">
                Perguntas cadastradas pela direção escolar sobre infraestrutura e alunos.
              </p>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-semibold text-slate-700">
                Progresso: <span className="font-mono tabular-nums text-emerald-700">{respondidasCount}</span> de{' '}
                <span className="font-mono tabular-nums">{totalPerguntas}</span> respondidas
              </div>
              <div className="w-full sm:w-44 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

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

                return (
                  <div
                    key={p.id}
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
                            Pergunta {idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                            {p.categoria === 'sala' ? 'Infraestrutura da Sala' : p.categoria === 'turma' ? 'Comportamento da Turma' : 'Geral'}
                          </span>
                          {p.obrigatoria && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Obrigatória
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {p.enunciado}
                        </h3>
                      </div>

                      {foiRespondida && (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Inputs based on type */}
                    <div className="mt-4">
                      {p.tipo === 'escala' && (
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            {[1, 2, 3, 4, 5].map((score) => {
                              const isSelected = valorAtual === score;
                              return (
                                <button
                                  type="button"
                                  key={score}
                                  onClick={() => handleSetValor(p.id, score)}
                                  className={`w-12 h-12 rounded-xl font-mono text-base font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-xs scale-105 ring-2 ring-emerald-300'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  <span>{score}</span>
                                </button>
                              );
                            })}
                          </div>
                          {typeof valorAtual === 'number' && (
                            <p className="text-xs text-emerald-700 font-semibold mt-2">
                              Avaliação: {valorAtual} estrelas ({ratingDescriptions[valorAtual]})
                            </p>
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
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                                    ? 'bg-emerald-50/60 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                                    : 'bg-slate-50/40 hover:bg-slate-100/60 border-slate-200 text-slate-700'
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
                            rows={3}
                            value={(valorAtual as string) || ''}
                            onChange={(e) => handleSetValor(p.id, e.target.value)}
                            placeholder="Escreva aqui suas observações pedagógicas ou observações sobre a sala..."
                            className="w-full text-xs px-3 py-2 bg-slate-50/40 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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

      {/* Modal to Switch Classroom or Class */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Alterar Sala de Aula ou Turma
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione os dados da nova aula que você está avaliando agora.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sala de Aula
                </label>
                <select
                  value={selectedSalaId}
                  onChange={(e) => setSelectedSalaId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                >
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turma / Série
                </label>
                <select
                  value={selectedTurmaId}
                  onChange={(e) => setSelectedTurmaId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                >
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.turno})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmChangeSalaTurma}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
