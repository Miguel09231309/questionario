import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { Pergunta, RespostaEnvio, Sala, Turma } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export const INITIAL_SALAS: Sala[] = [
  { id: 'sala-101', nome: 'Sala 101 (Bloco A)', bloco: 'Bloco A', capacidade: 35 },
  { id: 'sala-102', nome: 'Sala 102 (Bloco A)', bloco: 'Bloco A', capacidade: 35 },
  { id: 'sala-lab', nome: 'Laboratório de Ciências', bloco: 'Bloco B', capacidade: 30 },
  { id: 'sala-info', nome: 'Laboratório de Informática', bloco: 'Bloco B', capacidade: 32 },
  { id: 'sala-204', nome: 'Sala 204 (Multimídia)', bloco: 'Bloco C', capacidade: 40 },
  { id: 'sala-artes', nome: 'Ateliê de Artes', bloco: 'Bloco Cultural', capacidade: 28 },
];

export const INITIAL_TURMAS: Turma[] = [
  { id: 'turma-6a', nome: '6º Ano A', turno: 'Manhã' },
  { id: 'turma-7b', nome: '7º Ano B', turno: 'Manhã' },
  { id: 'turma-8a', nome: '8º Ano A', turno: 'Tarde' },
  { id: 'turma-9c', nome: '9º Ano C', turno: 'Tarde' },
  { id: 'turma-1em', nome: '1º Ano Ensino Médio', turno: 'Manhã' },
  { id: 'turma-3em', nome: '3º Ano Ensino Médio', turno: 'Manhã' },
];

export const INITIAL_PERGUNTAS: Pergunta[] = [
  {
    id: 'p-1',
    enunciado: 'Como você avalia as condições físicas da sala (iluminação, ventilação e ar-condicionado)?',
    categoria: 'sala',
    tipo: 'escala',
    obrigatoria: true,
    ativa: true,
    ordem: 1,
    criadaEm: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'p-2',
    enunciado: 'Os equipamentos multimídia (projetor, TV, caixas de som e tomadas) estavam em pleno funcionamento?',
    categoria: 'sala',
    tipo: 'sim_nao',
    obrigatoria: true,
    ativa: true,
    ordem: 2,
    criadaEm: '2026-09-20T10:05:00.000Z',
  },
  {
    id: 'p-3',
    enunciado: 'Qual é o estado geral de conservação das carteiras e cadeiras dos alunos?',
    categoria: 'sala',
    tipo: 'multipla_escolha',
    opcoes: [
      'Excelente (todas novas e sem avarias)',
      'Bom (pequeno desgaste natural)',
      'Regular (algumas com folga ou pichadas)',
      'Ruim (necessita reparo imediato)',
    ],
    obrigatoria: true,
    ativa: true,
    ordem: 3,
    criadaEm: '2026-09-20T10:10:00.000Z',
  },
  {
    id: 'p-4',
    enunciado: 'Como foi o nível de foco, disciplina e atenção dos alunos durante as explicações da aula?',
    categoria: 'turma',
    tipo: 'escala',
    obrigatoria: true,
    ativa: true,
    ordem: 4,
    criadaEm: '2026-09-20T10:15:00.000Z',
  },
  {
    id: 'p-5',
    enunciado: 'Os alunos trouxeram os materiais pedagógicos (livros, cadernos) e entregaram as atividades de casa?',
    categoria: 'turma',
    tipo: 'multipla_escolha',
    opcoes: [
      'Quase a totalidade (acima de 90%)',
      'Maioria dos alunos (70% a 90%)',
      'Cerca da metade da turma (50%)',
      'Minoria ou índice insuficiente (<50%)',
    ],
    obrigatoria: true,
    ativa: true,
    ordem: 5,
    criadaEm: '2026-09-20T10:20:00.000Z',
  },
  {
    id: 'p-6',
    enunciado: 'Houve alguma ocorrência disciplinar grave, conflitos entre alunos ou necessidade de mediação pedagógica?',
    categoria: 'turma',
    tipo: 'sim_nao',
    obrigatoria: true,
    ativa: true,
    ordem: 6,
    criadaEm: '2026-09-20T10:25:00.000Z',
  },
  {
    id: 'p-8',
    enunciado: 'Como você avalia o ritmo de compreensão e assimilação do conteúdo pelos alunos nesta aula?',
    categoria: 'turma',
    tipo: 'escala',
    obrigatoria: true,
    ativa: true,
    ordem: 7,
    criadaEm: '2026-09-25T08:00:00.000Z',
  },
  {
    id: 'p-9',
    enunciado: 'Houve dispersão dos alunos causada por conversas paralelas ou uso indevido de celulares/eletrônicos?',
    categoria: 'turma',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não, os alunos mantiveram foco exemplar',
      'Poucos casos pontuais e rapidamente solucionados',
      'Dispersão moderada em alguns grupos de alunos',
      'Dispersão frequente que prejudicou o andamento da aula',
    ],
    obrigatoria: true,
    ativa: true,
    ordem: 8,
    criadaEm: '2026-09-25T08:05:00.000Z',
  },
  {
    id: 'p-10',
    enunciado: 'Foram identificados alunos com defasagem acentuada ou que necessitam de reforço / apoio pedagógico específico?',
    categoria: 'turma',
    tipo: 'sim_nao',
    obrigatoria: true,
    ativa: true,
    ordem: 9,
    criadaEm: '2026-09-25T08:10:00.000Z',
  },
  {
    id: 'p-14',
    enunciado: 'Cite nomes de alunos que se destacaram positivamente (liderança, empenho) ou que necessitam de apoio individual:',
    categoria: 'turma',
    tipo: 'texto',
    obrigatoria: false,
    ativa: true,
    ordem: 10,
    criadaEm: '2026-09-25T08:30:00.000Z',
  },
  {
    id: 'p-7',
    enunciado: 'Descreva observações adicionais, elogios ou solicitações de melhorias para a direção e coordenação:',
    categoria: 'geral',
    tipo: 'texto',
    obrigatoria: false,
    ativa: true,
    ordem: 11,
    criadaEm: '2026-09-20T10:30:00.000Z',
  },
];

export const INITIAL_RESPOSTAS: RespostaEnvio[] = [
  {
    id: 'resp-1',
    professorNome: 'Prof. Carlos Eduardo (Matemática)',
    salaId: 'sala-101',
    salaNome: 'Sala 101 (Bloco A)',
    turmaId: 'turma-6a',
    turmaNome: '6º Ano A',
    respostas: {
      'p-1': 'Ótimo',
      'p-2': 'Sim',
      'p-3': 'Excelente (todas novas e sem avarias)',
      'p-4': 'Ótimo',
      'p-5': 'Maioria dos alunos (70% a 90%)',
      'p-6': 'Não',
      'p-8': 'Ótimo',
      'p-9': 'Não, os alunos mantiveram foco exemplar',
      'p-10': 'Não',
      'p-14': 'Aluna Beatriz e aluno Lucas com excelente participação e foco nos exercícios de frações.',
      'p-7': 'A turma participou muito bem da atividade com frações. A sala estava limpa e climatizada.',
    },
    criadaEm: '2026-09-24T09:40:00.000Z',
    timestamp: 1790250000000,
  },
  {
    id: 'resp-2',
    professorNome: 'Profª. Mariana Lima (História)',
    salaId: 'sala-204',
    salaNome: 'Sala 204 (Multimídia)',
    turmaId: 'turma-1em',
    turmaNome: '1º Ano Ensino Médio',
    respostas: {
      'p-1': 'Bom',
      'p-2': 'Sim',
      'p-3': 'Bom (pequeno desgaste natural)',
      'p-4': 'Ótimo',
      'p-5': 'Quase a totalidade (acima de 90%)',
      'p-6': 'Não',
      'p-8': 'Bom',
      'p-9': 'Poucos casos pontuais e rapidamente solucionados',
      'p-10': 'Sim',
      'p-14': 'Aluno Gabriel necessita de apoio individual na leitura e interpretação dos textos históricos.',
      'p-7': 'Ótima discussão sobre a era republicana. Cabo HDMI do projetor apresentou leve oscilação, favor verificar.',
    },
    criadaEm: '2026-09-24T11:15:00.000Z',
    timestamp: 1790255700000,
  },
];

class CloudAndLocalSchoolDB {
  private isCloudConnected = false;
  private hasInitialized = false;

  async init(): Promise<boolean> {
    if (this.hasInitialized) return this.isCloudConnected;
    try {
      this.isCloudConnected = await testConnection();
      if (this.isCloudConnected) {
        await this.seedFirestoreIfEmpty();
      } else {
        this.seedLocalStorageIfEmpty();
      }
    } catch (err) {
      console.warn('Fallback to local storage due to init check:', err);
      this.isCloudConnected = false;
      this.seedLocalStorageIfEmpty();
    }
    this.hasInitialized = true;
    return this.isCloudConnected;
  }

  getDatabaseInfo() {
    return {
      isCloud: this.isCloudConnected,
      projectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      statusLabel: this.isCloudConnected ? 'Cloud Firestore Sincronizado' : 'Offline / LocalStorage Ativo',
    };
  }

  // Seed Firestore
  private async seedFirestoreIfEmpty() {
    try {
      const salasSnap = await getDocs(collection(db, 'salas'));
      if (salasSnap.empty) {
        for (const s of INITIAL_SALAS) {
          await setDoc(doc(db, 'salas', s.id), s);
        }
      }

      const turmasSnap = await getDocs(collection(db, 'turmas'));
      if (turmasSnap.empty) {
        for (const t of INITIAL_TURMAS) {
          await setDoc(doc(db, 'turmas', t.id), t);
        }
      }

      const perguntasSnap = await getDocs(collection(db, 'perguntas'));
      if (perguntasSnap.empty) {
        for (const p of INITIAL_PERGUNTAS) {
          await setDoc(doc(db, 'perguntas', p.id), p);
        }
      }

      const respostasSnap = await getDocs(collection(db, 'respostas'));
      if (respostasSnap.empty) {
        for (const r of INITIAL_RESPOSTAS) {
          await setDoc(doc(db, 'respostas', r.id), r);
        }
      }
    } catch (e) {
      console.warn('Notice seeding Firestore:', e);
    }
  }

  private seedLocalStorageIfEmpty() {
    try {
      if (!localStorage.getItem('escola_salas')) {
        localStorage.setItem('escola_salas', JSON.stringify(INITIAL_SALAS));
      }
      if (!localStorage.getItem('escola_turmas')) {
        localStorage.setItem('escola_turmas', JSON.stringify(INITIAL_TURMAS));
      }
      if (!localStorage.getItem('escola_perguntas')) {
        localStorage.setItem('escola_perguntas', JSON.stringify(INITIAL_PERGUNTAS));
      }
      if (!localStorage.getItem('escola_respostas')) {
        localStorage.setItem('escola_respostas', JSON.stringify(INITIAL_RESPOSTAS));
      }
    } catch (e) {
      console.warn('Local storage inaccessible:', e);
    }
  }

  // --- One-off Async Getters ---

  async getSalas(): Promise<Sala[]> {
    if (this.isCloudConnected) {
      try {
        const snap = await getDocs(collection(db, 'salas'));
        if (!snap.empty) {
          const list: Sala[] = [];
          snap.forEach((d) => list.push(d.data() as Sala));
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'salas');
      }
    }
    try {
      const raw = localStorage.getItem('escola_salas');
      return raw ? JSON.parse(raw) : INITIAL_SALAS;
    } catch {
      return INITIAL_SALAS;
    }
  }

  async getTurmas(): Promise<Turma[]> {
    if (this.isCloudConnected) {
      try {
        const snap = await getDocs(collection(db, 'turmas'));
        if (!snap.empty) {
          const list: Turma[] = [];
          snap.forEach((d) => list.push(d.data() as Turma));
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'turmas');
      }
    }
    try {
      const raw = localStorage.getItem('escola_turmas');
      return raw ? JSON.parse(raw) : INITIAL_TURMAS;
    } catch {
      return INITIAL_TURMAS;
    }
  }

  async getPerguntas(): Promise<Pergunta[]> {
    if (this.isCloudConnected) {
      try {
        const snap = await getDocs(collection(db, 'perguntas'));
        if (!snap.empty) {
          const list: Pergunta[] = [];
          snap.forEach((d) => list.push(d.data() as Pergunta));
          list.sort((a, b) => a.ordem - b.ordem);
          return list;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'perguntas');
      }
    }
    try {
      const raw = localStorage.getItem('escola_perguntas');
      const list = raw ? JSON.parse(raw) : INITIAL_PERGUNTAS;
      list.sort((a: Pergunta, b: Pergunta) => a.ordem - b.ordem);
      return list;
    } catch {
      return INITIAL_PERGUNTAS;
    }
  }

  async getRespostas(): Promise<RespostaEnvio[]> {
    if (this.isCloudConnected) {
      try {
        const snap = await getDocs(collection(db, 'respostas'));
        const list: RespostaEnvio[] = [];
        snap.forEach((d) => list.push(d.data() as RespostaEnvio));
        list.sort((a, b) => b.timestamp - a.timestamp);
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'respostas');
      }
    }
    try {
      const raw = localStorage.getItem('escola_respostas');
      const list = raw ? JSON.parse(raw) : INITIAL_RESPOSTAS;
      list.sort((a: RespostaEnvio, b: RespostaEnvio) => b.timestamp - a.timestamp);
      return list;
    } catch {
      return INITIAL_RESPOSTAS;
    }
  }

  async exportarTodosDados() {
    const [salas, turmas, perguntas, respostas] = await Promise.all([
      this.getSalas(),
      this.getTurmas(),
      this.getPerguntas(),
      this.getRespostas(),
    ]);
    return {
      backupDate: new Date().toISOString(),
      databaseMode: this.isCloudConnected ? 'Cloud Firestore' : 'LocalStorage',
      salas,
      turmas,
      perguntas,
      respostas,
    };
  }

  // --- Real-time Listeners with error handlers ---

  subscribeSalas(callback: (salas: Sala[]) => void): () => void {
    if (this.isCloudConnected) {
      const path = 'salas';
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Sala[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Sala);
          });
          callback(list.length > 0 ? list : INITIAL_SALAS);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return unsubscribe;
    } else {
      // Local fallback
      try {
        const raw = localStorage.getItem('escola_salas');
        callback(raw ? JSON.parse(raw) : INITIAL_SALAS);
      } catch {
        callback(INITIAL_SALAS);
      }
      return () => {};
    }
  }

  subscribeTurmas(callback: (turmas: Turma[]) => void): () => void {
    if (this.isCloudConnected) {
      const path = 'turmas';
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Turma[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Turma);
          });
          callback(list.length > 0 ? list : INITIAL_TURMAS);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return unsubscribe;
    } else {
      try {
        const raw = localStorage.getItem('escola_turmas');
        callback(raw ? JSON.parse(raw) : INITIAL_TURMAS);
      } catch {
        callback(INITIAL_TURMAS);
      }
      return () => {};
    }
  }

  subscribePerguntas(callback: (perguntas: Pergunta[]) => void): () => void {
    if (this.isCloudConnected) {
      const path = 'perguntas';
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Pergunta[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Pergunta);
          });
          list.sort((a, b) => a.ordem - b.ordem);
          callback(list.length > 0 ? list : INITIAL_PERGUNTAS);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return unsubscribe;
    } else {
      try {
        const raw = localStorage.getItem('escola_perguntas');
        const list = raw ? JSON.parse(raw) : INITIAL_PERGUNTAS;
        list.sort((a: Pergunta, b: Pergunta) => a.ordem - b.ordem);
        callback(list);
      } catch {
        callback(INITIAL_PERGUNTAS);
      }
      return () => {};
    }
  }

  subscribeRespostas(callback: (respostas: RespostaEnvio[]) => void): () => void {
    if (this.isCloudConnected) {
      const path = 'respostas';
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: RespostaEnvio[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as RespostaEnvio);
          });
          list.sort((a, b) => b.timestamp - a.timestamp);
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return unsubscribe;
    } else {
      try {
        const raw = localStorage.getItem('escola_respostas');
        const list = raw ? JSON.parse(raw) : INITIAL_RESPOSTAS;
        list.sort((a: RespostaEnvio, b: RespostaEnvio) => b.timestamp - a.timestamp);
        callback(list);
      } catch {
        callback(INITIAL_RESPOSTAS);
      }
      return () => {};
    }
  }

  // --- CRUD Operations ---

  async salvarPergunta(pergunta: Pergunta): Promise<void> {
    if (this.isCloudConnected) {
      const path = `perguntas/${pergunta.id}`;
      try {
        await setDoc(doc(db, 'perguntas', pergunta.id), pergunta);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    // Also sync to local
    this.updateLocalList('escola_perguntas', pergunta);
  }

  async excluirPergunta(id: string): Promise<void> {
    if (this.isCloudConnected) {
      const path = `perguntas/${id}`;
      try {
        await deleteDoc(doc(db, 'perguntas', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    this.removeFromLocalList('escola_perguntas', id);
  }

  async salvarSala(sala: Sala): Promise<void> {
    if (this.isCloudConnected) {
      const path = `salas/${sala.id}`;
      try {
        await setDoc(doc(db, 'salas', sala.id), sala);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    this.updateLocalList('escola_salas', sala);
  }

  async excluirSala(id: string): Promise<void> {
    if (this.isCloudConnected) {
      const path = `salas/${id}`;
      try {
        await deleteDoc(doc(db, 'salas', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    this.removeFromLocalList('escola_salas', id);
  }

  async salvarTurma(turma: Turma): Promise<void> {
    if (this.isCloudConnected) {
      const path = `turmas/${turma.id}`;
      try {
        await setDoc(doc(db, 'turmas', turma.id), turma);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    this.updateLocalList('escola_turmas', turma);
  }

  async excluirTurma(id: string): Promise<void> {
    if (this.isCloudConnected) {
      const path = `turmas/${id}`;
      try {
        await deleteDoc(doc(db, 'turmas', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    this.removeFromLocalList('escola_turmas', id);
  }

  async salvarResposta(resposta: RespostaEnvio): Promise<void> {
    if (this.isCloudConnected) {
      const path = `respostas/${resposta.id}`;
      try {
        await setDoc(doc(db, 'respostas', resposta.id), resposta);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    this.updateLocalList('escola_respostas', resposta);
  }

  async excluirResposta(id: string): Promise<void> {
    if (this.isCloudConnected) {
      const path = `respostas/${id}`;
      try {
        await deleteDoc(doc(db, 'respostas', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    this.removeFromLocalList('escola_respostas', id);
  }

  // --- Reset to Default Seed ---
  async restaurarPadrao(): Promise<void> {
    if (this.isCloudConnected) {
      try {
        for (const p of INITIAL_PERGUNTAS) {
          await setDoc(doc(db, 'perguntas', p.id), p);
        }
        for (const s of INITIAL_SALAS) {
          await setDoc(doc(db, 'salas', s.id), s);
        }
        for (const t of INITIAL_TURMAS) {
          await setDoc(doc(db, 'turmas', t.id), t);
        }
        for (const r of INITIAL_RESPOSTAS) {
          await setDoc(doc(db, 'respostas', r.id), r);
        }
      } catch (error) {
        console.warn('Error resetting defaults in cloud:', error);
      }
    }

    localStorage.setItem('escola_salas', JSON.stringify(INITIAL_SALAS));
    localStorage.setItem('escola_turmas', JSON.stringify(INITIAL_TURMAS));
    localStorage.setItem('escola_perguntas', JSON.stringify(INITIAL_PERGUNTAS));
    localStorage.setItem('escola_respostas', JSON.stringify(INITIAL_RESPOSTAS));
  }

  // Helper local storage utils
  private updateLocalList<T extends { id: string }>(key: string, item: T) {
    try {
      const raw = localStorage.getItem(key);
      const list: T[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.push(item);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }

  private removeFromLocalList(key: string, id: string) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const list = JSON.parse(raw).filter((x: { id: string }) => x.id !== id);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }
}

export const dbService = new CloudAndLocalSchoolDB();
