import React, { useState, useEffect } from 'react';
import { Pergunta, RespostaEnvio, Sala, Turma, UserSession } from './types';
import { dbService } from './services/db';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DirectorDashboard } from './components/DirectorDashboard';
import { TeacherView } from './components/TeacherView';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('escola_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<RespostaEnvio[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all initial data from IndexedDB
  const carregarDadosDoBanco = async () => {
    try {
      const [pList, rList, sList, tList] = await Promise.all([
        dbService.getPerguntas(),
        dbService.getRespostas(),
        dbService.getSalas(),
        dbService.getTurmas(),
      ]);
      setPerguntas(pList);
      setRespostas(rList);
      setSalas(sList);
      setTurmas(tList);
    } catch (e) {
      console.error('Erro ao carregar dados do IndexedDB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  const handleLogin = (userSession: UserSession) => {
    setSession(userSession);
    try {
      localStorage.setItem('escola_user_session', JSON.stringify(userSession));
    } catch {}
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem('escola_user_session');
    } catch {}
  };

  // Perguntas actions
  const handleAddPergunta = async (perguntaData: Omit<Pergunta, 'id' | 'criadaEm' | 'ordem'>) => {
    const nova: Pergunta = {
      ...perguntaData,
      id: 'p-' + Date.now(),
      ordem: perguntas.length + 1,
      criadaEm: new Date().toISOString(),
    };
    await dbService.salvarPergunta(nova);
    const atualizadas = await dbService.getPerguntas();
    setPerguntas(atualizadas);
  };

  const handleDeletePergunta = async (id: string) => {
    await dbService.excluirPergunta(id);
    const atualizadas = await dbService.getPerguntas();
    setPerguntas(atualizadas);
  };

  const handleTogglePerguntaAtiva = async (id: string, ativa: boolean) => {
    const p = perguntas.find((item) => item.id === id);
    if (!p) return;
    const atualizada = { ...p, ativa };
    await dbService.salvarPergunta(atualizada);
    const lista = await dbService.getPerguntas();
    setPerguntas(lista);
  };

  // Salas actions
  const handleAddSala = async (nome: string, bloco?: string) => {
    const nova: Sala = {
      id: 'sala-' + Date.now(),
      nome,
      bloco,
    };
    await dbService.salvarSala(nova);
    const lista = await dbService.getSalas();
    setSalas(lista);
  };

  const handleDeleteSala = async (id: string) => {
    await dbService.excluirSala(id);
    const lista = await dbService.getSalas();
    setSalas(lista);
  };

  // Turmas actions
  const handleAddTurma = async (nome: string, turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral') => {
    const nova: Turma = {
      id: 'turma-' + Date.now(),
      nome,
      turno,
    };
    await dbService.salvarTurma(nova);
    const lista = await dbService.getTurmas();
    setTurmas(lista);
  };

  const handleDeleteTurma = async (id: string) => {
    await dbService.excluirTurma(id);
    const lista = await dbService.getTurmas();
    setTurmas(lista);
  };

  // Respostas actions
  const handleSalvarResposta = async (
    respostaData: Omit<RespostaEnvio, 'id' | 'criadaEm' | 'timestamp'>
  ) => {
    const now = Date.now();
    const nova: RespostaEnvio = {
      ...respostaData,
      id: 'resp-' + now,
      criadaEm: new Date(now).toISOString(),
      timestamp: now,
    };
    await dbService.salvarResposta(nova);
    const lista = await dbService.getRespostas();
    setRespostas(lista);
  };

  const handleChangeSalaTurma = (
    salaId: string,
    salaNome: string,
    turmaId: string,
    turmaNome: string
  ) => {
    if (!session) return;
    const updated = {
      ...session,
      salaId,
      salaNome,
      turmaId,
      turmaNome,
    };
    setSession(updated);
    try {
      localStorage.setItem('escola_user_session', JSON.stringify(updated));
    } catch {}
  };

  const handleResetDefaults = async () => {
    if (confirm('Deseja restaurar as perguntas, salas, turmas e respostas de demonstração padrão?')) {
      setIsLoading(true);
      await dbService.restaurarPadrao();
      await carregarDadosDoBanco();
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (respostas.length === 0) {
      alert('Não há respostas salvas para exportar.');
      return;
    }

    let csvContent = '\uFEFF'; // BOM for Excel UTF-8 support
    csvContent += 'Data/Hora,Professor,Sala,Turma';
    perguntas.forEach((p) => {
      csvContent += `,"${p.enunciado.replace(/"/g, '""')}"`;
    });
    csvContent += '\n';

    respostas.forEach((r) => {
      const dataStr = new Date(r.timestamp).toLocaleString('pt-BR');
      let row = `"${dataStr}","${r.professorNome}","${r.salaNome}","${r.turmaNome}"`;
      perguntas.forEach((p) => {
        const val = r.respostas[p.id] !== undefined ? r.respostas[p.id] : '';
        row += `,"${String(val).replace(/"/g, '""')}"`;
      });
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_questionario_escolar_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = async () => {
    const backup = await dbService.exportarTodosDados();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_questionario_indexeddb_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const link = document.createElement('a');
    link.href = '/public/index.html';
    link.download = 'index.html';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Inicializando Banco de Dados IndexedDB...</p>
        <p className="text-xs text-slate-400 mt-1">Carregando perguntas e configurações escolares</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header
        session={session}
        onLogout={handleLogout}
        onDownloadHtml={handleDownloadHtml}
      />

      <main className="flex-1">
        {!session ? (
          <LoginView
            salas={salas}
            turmas={turmas}
            onLogin={handleLogin}
            onDownloadHtml={handleDownloadHtml}
          />
        ) : session.role === 'diretor' ? (
          <DirectorDashboard
            perguntas={perguntas}
            respostas={respostas}
            salas={salas}
            turmas={turmas}
            onAddPergunta={handleAddPergunta}
            onDeletePergunta={handleDeletePergunta}
            onTogglePerguntaAtiva={handleTogglePerguntaAtiva}
            onAddSala={handleAddSala}
            onDeleteSala={handleDeleteSala}
            onAddTurma={handleAddTurma}
            onDeleteTurma={handleDeleteTurma}
            onResetDefaults={handleResetDefaults}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
            onDownloadHtml={handleDownloadHtml}
          />
        ) : (
          <TeacherView
            session={session}
            perguntas={perguntas}
            respostas={respostas}
            salas={salas}
            turmas={turmas}
            onSalvarResposta={handleSalvarResposta}
            onChangeSalaTurma={handleChangeSalaTurma}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Colégio Saber Ativo &bull; Sistema de Gestão & Avaliação Escolar
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadHtml}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Baixar Código HTML Único (.html)
            </button>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-400">IndexedDB v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
