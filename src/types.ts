export type Role = 'diretor' | 'professor';

export type QuestionType = 'escala' | 'multipla_escolha' | 'sim_nao' | 'texto';

export type QuestionCategory = 'sala' | 'turma' | 'geral';

export interface Pergunta {
  id: string;
  enunciado: string;
  categoria: QuestionCategory;
  tipo: QuestionType;
  opcoes?: string[]; // Para múltipla escolha
  obrigatoria: boolean;
  ativa: boolean;
  ordem: number;
  criadaEm: string;
}

export interface Sala {
  id: string;
  nome: string;
  bloco?: string;
  capacidade?: number;
}

export interface Turma {
  id: string;
  nome: string;
  turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
}

export interface RespostaItem {
  perguntaId: string;
  enunciado: string;
  tipo: QuestionType;
  valor: string | number;
}

export interface RespostaEnvio {
  id: string;
  professorNome: string;
  salaId: string;
  salaNome: string;
  turmaId: string;
  turmaNome: string;
  respostas: Record<string, string | number>; // perguntaId -> resposta
  observacoesGerais?: string;
  criadaEm: string;
  timestamp: number;
}

export interface UserSession {
  role: Role;
  nome: string;
  // Para professor:
  salaId?: string;
  salaNome?: string;
  turmaId?: string;
  turmaNome?: string;
}
