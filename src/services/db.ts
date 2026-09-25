import { Pergunta, RespostaEnvio, Sala, Turma } from '../types';

const DB_NAME = 'EscolaQuestionarioDB';
const DB_VERSION = 1;

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
    opcoes: ['Excelente (todas novas e sem avarias)', 'Bom (pequeno desgaste natural)', 'Regular (algumas com folga ou pichadas)', 'Ruim (necessita reparo imediato)'],
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
    enunciado: 'Os alunos trouxeram os materiais pedagógicos (livros, cadernos) e entregaram as atividades/deveres solicitados?',
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
    id: 'p-11',
    enunciado: 'Como você avalia a colaboração, espírito de equipe e o respeito mútuo demonstrado entre os alunos?',
    categoria: 'turma',
    tipo: 'escala',
    obrigatoria: true,
    ativa: true,
    ordem: 10,
    criadaEm: '2026-09-25T08:15:00.000Z',
  },
  {
    id: 'p-12',
    enunciado: 'Qual foi o nível de pontualidade e assiduidade dos alunos para o início e permanência na aula?',
    categoria: 'turma',
    tipo: 'multipla_escolha',
    opcoes: [
      'Turma pontual e presente (acima de 95%)',
      'Poucos atrasos pontuais e justificados',
      'Muitos alunos entraram após o sinal ou saíram antes',
      'Número elevado de ausências/faltas na data',
    ],
    obrigatoria: true,
    ativa: true,
    ordem: 11,
    criadaEm: '2026-09-25T08:20:00.000Z',
  },
  {
    id: 'p-13',
    enunciado: 'Os alunos demonstraram zelo pelo patrimônio escolar (organização das carteiras, lousa e descarte de lixo)?',
    categoria: 'turma',
    tipo: 'sim_nao',
    obrigatoria: true,
    ativa: true,
    ordem: 12,
    criadaEm: '2026-09-25T08:25:00.000Z',
  },
  {
    id: 'p-14',
    enunciado: 'Cite nomes de alunos que se destacaram positivamente (liderança, empenho) ou que necessitam de apoio individual:',
    categoria: 'turma',
    tipo: 'texto',
    obrigatoria: false,
    ativa: true,
    ordem: 13,
    criadaEm: '2026-09-25T08:30:00.000Z',
  },
  {
    id: 'p-7',
    enunciado: 'Descreva observações adicionais, elogios ou solicitações de melhorias para a direção e coordenação:',
    categoria: 'geral',
    tipo: 'texto',
    obrigatoria: false,
    ativa: true,
    ordem: 14,
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
      'p-1': 5,
      'p-2': 'Sim',
      'p-3': 'Excelente (todas novas e sem avarias)',
      'p-4': 4,
      'p-5': 'Maioria dos alunos (70% a 90%)',
      'p-6': 'Não',
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
      'p-1': 4,
      'p-2': 'Sim',
      'p-3': 'Bom (pequeno desgaste natural)',
      'p-4': 5,
      'p-5': 'Quase a totalidade (acima de 90%)',
      'p-6': 'Não',
      'p-7': 'Ótima discussão sobre a era republicana. Cabo HDMI do projetor apresentou leve oscilação, favor verificar.',
    },
    criadaEm: '2026-09-24T11:15:00.000Z',
    timestamp: 1790255700000,
  },
  {
    id: 'resp-3',
    professorNome: 'Prof. Roberto Silva (Ciências)',
    salaId: 'sala-lab',
    salaNome: 'Laboratório de Ciências',
    turmaId: 'turma-8a',
    turmaNome: '8º Ano A',
    respostas: {
      'p-1': 4,
      'p-2': 'Sim',
      'p-3': 'Bom (pequeno desgaste natural)',
      'p-4': 3,
      'p-5': 'Maioria dos alunos (70% a 90%)',
      'p-6': 'Sim',
      'p-7': 'Dois alunos se distraíram com reagentes no fundo do laboratório. Conversei com ambos após a aula.',
    },
    criadaEm: '2026-09-24T14:30:00.000Z',
    timestamp: 1790267400000,
  },
];

class SchoolDB {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isFallback = false;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isFallback = true;
      return Promise.reject(new Error('IndexedDB indisponível'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store Perguntas
        if (!db.objectStoreNames.contains('perguntas')) {
          const store = db.createObjectStore('perguntas', { keyPath: 'id' });
          store.createIndex('categoria', 'categoria', { unique: false });
          store.createIndex('ordem', 'ordem', { unique: false });
        }

        // Store Respostas
        if (!db.objectStoreNames.contains('respostas')) {
          const store = db.createObjectStore('respostas', { keyPath: 'id' });
          store.createIndex('salaId', 'salaId', { unique: false });
          store.createIndex('turmaId', 'turmaId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('professorNome', 'professorNome', { unique: false });
        }

        // Store Salas
        if (!db.objectStoreNames.contains('salas')) {
          db.createObjectStore('salas', { keyPath: 'id' });
        }

        // Store Turmas
        if (!db.objectStoreNames.contains('turmas')) {
          db.createObjectStore('turmas', { keyPath: 'id' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        try {
          await this.seedDefaultsIfEmpty(db);
        } catch (e) {
          console.warn('Erro ao inicializar dados padrão:', e);
        }
        resolve(db);
      };

      request.onerror = () => {
        this.isFallback = true;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async seedDefaultsIfEmpty(db: IDBDatabase): Promise<void> {
    const checkEmpty = (storeName: string): Promise<boolean> => {
      return new Promise((res) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => res(req.result === 0);
        req.onerror = () => res(false);
      });
    };

    const salasEmpty = await checkEmpty('salas');
    if (salasEmpty) {
      const tx = db.transaction('salas', 'readwrite');
      const store = tx.objectStore('salas');
      INITIAL_SALAS.forEach((s) => store.put(s));
    }

    const turmasEmpty = await checkEmpty('turmas');
    if (turmasEmpty) {
      const tx = db.transaction('turmas', 'readwrite');
      const store = tx.objectStore('turmas');
      INITIAL_TURMAS.forEach((t) => store.put(t));
    }

    const perguntasEmpty = await checkEmpty('perguntas');
    if (perguntasEmpty) {
      const tx = db.transaction('perguntas', 'readwrite');
      const store = tx.objectStore('perguntas');
      INITIAL_PERGUNTAS.forEach((p) => store.put(p));
    } else {
      // Sync any newly added default questions (like the new student questions)
      const tx = db.transaction('perguntas', 'readwrite');
      const store = tx.objectStore('perguntas');
      INITIAL_PERGUNTAS.forEach((p) => {
        const getReq = store.get(p.id);
        getReq.onsuccess = () => {
          if (!getReq.result) {
            store.put(p);
          }
        };
      });
    }

    const respostasEmpty = await checkEmpty('respostas');
    if (respostasEmpty) {
      const tx = db.transaction('respostas', 'readwrite');
      const store = tx.objectStore('respostas');
      INITIAL_RESPOSTAS.forEach((r) => store.put(r));
    }
  }

  // Generic helpers
  private async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage
      const raw = localStorage.getItem(`fallback_${storeName}`);
      if (raw) return JSON.parse(raw);
      if (storeName === 'perguntas') return INITIAL_PERGUNTAS as unknown as T[];
      if (storeName === 'salas') return INITIAL_SALAS as unknown as T[];
      if (storeName === 'turmas') return INITIAL_TURMAS as unknown as T[];
      if (storeName === 'respostas') return INITIAL_RESPOSTAS as unknown as T[];
      return [];
    }
  }

  private async putItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAll<T>(storeName);
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.push(item);
      localStorage.setItem(`fallback_${storeName}`, JSON.stringify(list));
    }
  }

  private async deleteItem(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAll<{ id: string }>(storeName);
      const filtered = list.filter((i) => i.id !== id);
      localStorage.setItem(`fallback_${storeName}`, JSON.stringify(filtered));
    }
  }

  // --- PERGUNTAS ---
  async getPerguntas(): Promise<Pergunta[]> {
    const list = await this.getAll<Pergunta>('perguntas');
    return list.sort((a, b) => a.ordem - b.ordem);
  }

  async salvarPergunta(pergunta: Pergunta): Promise<void> {
    await this.putItem('perguntas', pergunta);
  }

  async excluirPergunta(id: string): Promise<void> {
    await this.deleteItem('perguntas', id);
  }

  // --- SALAS ---
  async getSalas(): Promise<Sala[]> {
    return this.getAll<Sala>('salas');
  }

  async salvarSala(sala: Sala): Promise<void> {
    await this.putItem('salas', sala);
  }

  async excluirSala(id: string): Promise<void> {
    await this.deleteItem('salas', id);
  }

  // --- TURMAS ---
  async getTurmas(): Promise<Turma[]> {
    return this.getAll<Turma>('turmas');
  }

  async salvarTurma(turma: Turma): Promise<void> {
    await this.putItem('turmas', turma);
  }

  async excluirTurma(id: string): Promise<void> {
    await this.deleteItem('turmas', id);
  }

  // --- RESPOSTAS ---
  async getRespostas(): Promise<RespostaEnvio[]> {
    const list = await this.getAll<RespostaEnvio>('respostas');
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  async salvarResposta(resposta: RespostaEnvio): Promise<void> {
    await this.putItem('respostas', resposta);
  }

  async excluirResposta(id: string): Promise<void> {
    await this.deleteItem('respostas', id);
  }

  // --- RESTAURAR E EXPORTAR ---
  async restaurarPadrao(): Promise<void> {
    try {
      const db = await this.openDB();
      const stores = ['perguntas', 'salas', 'turmas', 'respostas'];
      for (const st of stores) {
        const tx = db.transaction(st, 'readwrite');
        tx.objectStore(st).clear();
      }
      await this.seedDefaultsIfEmpty(db);
    } catch {
      localStorage.removeItem('fallback_perguntas');
      localStorage.removeItem('fallback_salas');
      localStorage.removeItem('fallback_turmas');
      localStorage.removeItem('fallback_respostas');
    }
  }

  async exportarTodosDados() {
    const perguntas = await this.getPerguntas();
    const salas = await this.getSalas();
    const turmas = await this.getTurmas();
    const respostas = await this.getRespostas();
    return {
      sistema: 'EscolaQuestionarioDB',
      versao: 1,
      exportadoEm: new Date().toISOString(),
      dados: { perguntas, salas, turmas, respostas },
    };
  }

  async importarDados(dadosBackup: any): Promise<boolean> {
    if (!dadosBackup?.dados) return false;
    const { perguntas, salas, turmas, respostas } = dadosBackup.dados;

    if (Array.isArray(perguntas)) {
      for (const p of perguntas) await this.salvarPergunta(p);
    }
    if (Array.isArray(salas)) {
      for (const s of salas) await this.salvarSala(s);
    }
    if (Array.isArray(turmas)) {
      for (const t of turmas) await this.salvarTurma(t);
    }
    if (Array.isArray(respostas)) {
      for (const r of respostas) await this.salvarResposta(r);
    }
    return true;
  }
}

export const dbService = new SchoolDB();
