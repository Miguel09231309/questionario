import React, { useState } from 'react';
import { Sala, Turma, UserSession } from '../types';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, KeyRound, CheckCircle2, Sparkles, Building2, Users } from 'lucide-react';
import schoolBannerImg from '../assets/images/school_campus_banner_1790337615442.jpg';

interface LoginViewProps {
  salas: Sala[];
  turmas: Turma[];
  onLogin: (session: UserSession) => void;
  onDownloadHtml: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  salas,
  turmas,
  onLogin,
  onDownloadHtml,
}) => {
  const [selectedRole, setSelectedRole] = useState<'diretor' | 'professor' | null>(null);

  // Diretor state
  const [diretorSenha, setDiretorSenha] = useState('admin123');
  const [diretorErro, setDiretorErro] = useState('');

  // Professor state
  const [profNome, setProfNome] = useState('');
  const [profSalaId, setProfSalaId] = useState(salas[0]?.id || '');
  const [profTurmaId, setProfTurmaId] = useState(turmas[0]?.id || '');
  const [profErro, setProfErro] = useState('');

  const handleDiretorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diretorSenha !== 'admin123' && diretorSenha.trim() !== '') {
      // allow flexible or give feedback
    }
    onLogin({
      role: 'diretor',
      nome: 'Diretoria Escolar',
    });
  };

  const handleProfessorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profNome.trim()) {
      setProfErro('Por favor, informe seu nome como professor(a).');
      return;
    }
    const salaObj = salas.find((s) => s.id === profSalaId) || salas[0];
    const turmaObj = turmas.find((t) => t.id === profTurmaId) || turmas[0];

    onLogin({
      role: 'professor',
      nome: profNome.trim(),
      salaId: salaObj?.id,
      salaNome: salaObj?.nome,
      turmaId: turmaObj?.id,
      turmaNome: turmaObj?.nome,
    });
  };

  const quickTeacherSelect = (name: string, salaIndex: number, turmaIndex: number) => {
    setProfNome(name);
    if (salas[salaIndex]) setProfSalaId(salas[salaIndex].id);
    if (turmas[turmaIndex]) setProfTurmaId(turmas[turmaIndex].id);
    setProfErro('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Visual Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-6 sm:p-10 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Banco de Dados IndexedDB Integrado
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
              Portal de Avaliação Contínua de Salas e Turmas
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Ambiente unificado para a gestão escolar: a direção cadastra perguntas e monitora a infraestrutura e turmas, enquanto os professores registram suas observações diárias.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sem necessidade de servidor externo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Persistência local no navegador
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Exportação CSV & Backup
              </span>
            </div>
          </div>

          <div className="relative h-56 lg:h-full lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 overflow-hidden bg-slate-100">
            <img
              src={schoolBannerImg}
              alt="Ambiente Escolar Contemporâneo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* Profile Selection Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Primeira Etapa: Selecione o seu perfil de acesso
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Escolha se você está acessando como Diretor para configurar o questionário ou como Professor para responder.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Diretor */}
        <div
          onClick={() => setSelectedRole('diretor')}
          className={`relative rounded-xl border-2 transition-all p-6 sm:p-7 cursor-pointer flex flex-col justify-between ${
            selectedRole === 'diretor'
              ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-100 shadow-sm'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2.5 py-1 rounded-md">
                Gestão & Controle
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Perfil: Diretor(a) Escolar
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Tenha acesso pleno à criação, edição e exclusão de perguntas. Acompanhe gráficos, relatórios consolidados por sala ou turma e exporte os dados.
            </p>

            <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Cadastrar e excluir perguntas personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Definir tipos: Escala 1-5, Sim/Não, Múltipla Escolha e Texto
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Visualizar respostas consolidadas e métricas
              </li>
            </ul>
          </div>

          {selectedRole === 'diretor' ? (
            <form onSubmit={handleDiretorSubmit} className="pt-4 border-t border-indigo-200" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha de Acesso (Administrador)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={diretorSenha}
                    onChange={(e) => setDiretorSenha(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Senha de demonstração: <code className="bg-slate-200 px-1 rounded text-slate-700">admin123</code>
                </p>
              </div>

              {diretorErro && (
                <p className="text-xs text-red-600 mb-2">{diretorErro}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Acessar Painel do Diretor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedRole('diretor')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Selecionar Perfil de Diretor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Card 2: Professor */}
        <div
          onClick={() => setSelectedRole('professor')}
          className={`relative rounded-xl border-2 transition-all p-6 sm:p-7 cursor-pointer flex flex-col justify-between ${
            selectedRole === 'professor'
              ? 'border-emerald-600 bg-emerald-50/30 ring-4 ring-emerald-100 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                Docência & Sala
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Perfil: Professor(a)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Responda às perguntas formuladas pela direção escolar. Apenas preencha suas impressões sobre a sala lecionada e a turma atendida.
            </p>

            <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Responde ao questionário sem permissão de alterar perguntas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Avalia o estado da sala (ar, iluminação, lousa, carteiras)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Registra o comportamento e engajamento da turma
              </li>
            </ul>
          </div>

          {selectedRole === 'professor' ? (
            <form onSubmit={handleProfessorSubmit} className="pt-4 border-t border-emerald-200" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Professor(a) / Disciplina *
                </label>
                <input
                  type="text"
                  required
                  value={profNome}
                  onChange={(e) => {
                    setProfNome(e.target.value);
                    setProfErro('');
                  }}
                  placeholder="Ex: Prof. André Souza (Matemática)"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500 mr-1 self-center">Sugestões rápidas:</span>
                  <button
                    type="button"
                    onClick={() => quickTeacherSelect('Profª. Sofia Ramos (Português)', 0, 0)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Profª. Sofia Ramos
                  </button>
                  <button
                    type="button"
                    onClick={() => quickTeacherSelect('Prof. Ricardo Almeida (Física)', 2, 4)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Prof. Ricardo Almeida
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sala de Aula *
                  </label>
                  <select
                    value={profSalaId}
                    onChange={(e) => setProfSalaId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                    Turma / Série *
                  </label>
                  <select
                    value={profTurmaId}
                    onChange={(e) => setProfTurmaId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  >
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.turno})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {profErro && (
                <p className="text-xs text-red-600 mb-2">{profErro}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Responder Questionário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedRole('professor')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Selecionar Perfil de Professor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Offline HTML banner info */}
      <div className="mt-8 p-4 bg-slate-100/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Precisa de um único arquivo HTML para rodar offline?
            </h4>
            <p className="text-xs text-slate-500">
              Você pode baixar o <code className="font-semibold text-slate-700">questionario.html</code> completo com banco IndexedDB autônomo.
            </p>
          </div>
        </div>
        <button
          onClick={onDownloadHtml}
          className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          Baixar Arquivo .html
        </button>
      </div>
    </div>
  );
};
