import React, { useState, useEffect } from 'react';
import { Pergunta, RespostaEnvio, Sala, Turma, UserSession } from './types';
import { dbService } from './services/db';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DirectorDashboard } from './components/DirectorDashboard';
import { TeacherView } from './components/TeacherView';
import { Loader2, Database, AlertCircle } from 'lucide-react';

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
  const [dbInfo, setDbInfo] = useState<{
    isCloud: boolean;
    projectId?: string;
    statusLabel: string;
  }>({
    isCloud: true,
    statusLabel: 'Conectando ao Firebase Firestore...',
  });

  // Real-time synchronization setup
  useEffect(() => {
    let unsubSalas = () => {};
    let unsubTurmas = () => {};
    let unsubPerguntas = () => {};
    let unsubRespostas = () => {};

    const startSync = async () => {
      try {
        await dbService.init();
        const info = dbService.getDatabaseInfo();
        setDbInfo({
          isCloud: info.isCloud,
          projectId: info.projectId,
          statusLabel: info.statusLabel,
        });

        // Set up real-time snapshot listeners
        unsubSalas = dbService.subscribeSalas((list) => {
          setSalas(list);
          setIsLoading(false);
        });

        unsubTurmas = dbService.subscribeTurmas((list) => {
          setTurmas(list);
        });

        unsubPerguntas = dbService.subscribePerguntas((list) => {
          setPerguntas(list);
        });

        unsubRespostas = dbService.subscribeRespostas((list) => {
          setRespostas(list);
        });
      } catch (err) {
        console.error('Falha ao inicializar sincronização com Firestore:', err);
        // Fallback to one-off read
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
        } catch (fallbackErr) {
          console.error('Falha no fallback:', fallbackErr);
        } finally {
          setIsLoading(false);
        }
      }
    };

    startSync();

    return () => {
      unsubSalas();
      unsubTurmas();
      unsubPerguntas();
      unsubRespostas();
    };
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
  };

  const handleDeletePergunta = async (id: string) => {
    await dbService.excluirPergunta(id);
  };

  const handleTogglePerguntaAtiva = async (id: string, ativa: boolean) => {
    const p = perguntas.find((item) => item.id === id);
    if (!p) return;
    const atualizada = { ...p, ativa };
    await dbService.salvarPergunta(atualizada);
  };

  // Salas actions
  const handleAddSala = async (nome: string, bloco?: string) => {
    const nova: Sala = {
      id: 'sala-' + Date.now(),
      nome,
      bloco,
    };
    await dbService.salvarSala(nova);
  };

  const handleDeleteSala = async (id: string) => {
    await dbService.excluirSala(id);
  };

  // Turmas actions
  const handleAddTurma = async (nome: string, turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral') => {
    const nova: Turma = {
      id: 'turma-' + Date.now(),
      nome,
      turno,
    };
    await dbService.salvarTurma(nova);
  };

  const handleDeleteTurma = async (id: string) => {
    await dbService.excluirTurma(id);
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
    if (confirm('Deseja restaurar as perguntas, salas, turmas e respostas modelo no banco de dados na nuvem?')) {
      setIsLoading(true);
      await dbService.restaurarPadrao();
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (respostas.length === 0) {
      alert('Não há respostas salvas para exportar.');
      return;
    }

    let csvContent = '\uFEFF'; // BOM for Excel UTF-8
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
    link.download = `backup_escolar_firestore_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Conectando ao Banco de Dados</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Sincronizando perguntas, salas, turmas e histórico em tempo real com o Firebase Firestore...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans antialiased">
      <Header
        session={session}
        onLogout={handleLogout}
        databaseStatus={dbInfo}
      />

      <main className="flex-1">
        {!session ? (
          <LoginView
            salas={salas}
            turmas={turmas}
            onLogin={handleLogin}
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

      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Colégio Saber Ativo</span>
            <span className="text-slate-300">&bull;</span>
            <span>Sistema Integrado de Avaliação Institucional</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Firebase Firestore Sincronizado
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
