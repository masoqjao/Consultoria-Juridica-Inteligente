export type LegalArea = 'geral' | 'trabalhista' | 'civil' | 'penal' | 'tributario' | 'empresarial';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type LiveCaseStatus = 'preliminary' | 'ongoing' | 'suspended' | 'resolved-won' | 'resolved-lost';

export interface LegalCase {
  id: string;
  title: string;
  category: LegalArea;
  description: string;
  caseNumber: string;
  status: LiveCaseStatus;
  updatedDate: string;
  clientNotes?: string;
  aiAnalysis?: string;
}

export interface Consultation {
  id: string;
  clientName: string;
  area: LegalArea;
  date: string;
  time: string;
  issue: string;
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
}

export interface Settings {
  activeLawyerName: string;
  lawyerSpec: LegalArea;
  autoAnalysis: boolean;
  language: 'pt-BR' | 'en';
}