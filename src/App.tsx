import React, { useState, useEffect } from 'react';
import {
  Gavel, MessageSquare, Calendar, Settings as SettingsIcon,
  LogOut, Bell, Menu, X, Scale, ShieldAlert, History
} from 'lucide-react';
import { ChatMessage, LegalCase, Consultation, Settings } from './types';
import Dashboard from './components/Dashboard';
import Processes from './components/Processes';
import Consultations from './components/Consultations';
import SettingsPage from './components/SettingsPage';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';

const DEFAULT_SETTINGS: Settings = {
  activeLawyerName: "Dr. Advogado",
  lawyerSpec: "geral",
  autoAnalysis: true,
  language: "pt-BR"
};

const DEFAULT_CASES: LegalCase[] = [
  {
    id: "case-1",
    title: "Reclamação Trabalhista por Acúmulo de Função e Horas Extras",
    caseNumber: "5023908-41.2024.5.15.0001",
    category: "trabalhista",
    description: "Contratado formalmente como assistente administrativo, o reclamante acumulou funções de caixa e gerente geral de filial sem qualquer compensação remuneratória durante 24 meses.",
    status: "ongoing",
    updatedDate: "2026-05-28",
    clientNotes: "Audiência de instrução designada para julho de 2026. Testemunhas intimadas.",
    aiAnalysis: `1. **Resumo Preliminar**: Ação trabalhista por acúmulo funcional sem compensação.\n\n2. **Fundamentação Legal**: Artigo 468 da CLT, vedação ao enriquecimento sem causa (Art. 884 do Código Civil).\n\n3. **Análise de Riscos**: Risco Médio. Prova testemunhal é fundamental.\n\n4. **Próximos Passos**: Revisar atas de depoimento e assegurar confirmação do desvio funcional.`
  },
  {
    id: "case-2",
    title: "Ação de Indenização por Cobrança Abusiva e Danos Morais",
    caseNumber: "1004512-88.2025.8.26.0002",
    category: "civil",
    description: "Inclusão indevida de CPF em cadastro de inadimplentes por empresa aérea após cancelamento consensual e estorno comprovado.",
    status: "resolved-won",
    updatedDate: "2026-05-15",
    clientNotes: "Transitado em julgado. Danos morais fixados em R$ 8.000,00.",
    aiAnalysis: `1. **Resumo Preliminar**: Demanda indenizatória por inscrição indevida em cadastro de restrição ao crédito.\n\n2. **Fundamentação Legal**: Súmula 385 do STJ e artigos 186 e 927 do Código Civil.\n\n3. **Análise de Riscos**: Baixo risco. Negativação com débito quitado gera dever de indenizar in re ipsa.\n\n4. **Próximos Passos**: Execução do pagamento da sentença judicial.`
  }
];

const DEFAULT_CONSULTATIONS: Consultation[] = [
  {
    id: "meet-1",
    clientName: "Mariana Almeida Ramos",
    area: "civil",
    date: "2026-06-15",
    time: "14:30",
    issue: "Dúvida sobre partilha de bens em dissolução amigável de união estável.",
    status: "scheduled"
  },
  {
    id: "meet-2",
    clientName: "Roberto Mendes Filho",
    area: "trabalhista",
    date: "2026-05-20",
    time: "10:00",
    issue: "Rescisão imotivadora sob alegações falsas pelo empregador.",
    status: "completed"
  }
];

const MOBILE_NAV = [
  { id: 'processes',     label: 'Processos', Icon: Gavel       },
  { id: 'dashboard',     label: 'Consultas', Icon: MessageSquare},
  { id: 'consultations', label: 'Histórico', Icon: History      },
] as const;

type TabId = 'dashboard' | 'processes' | 'consultations' | 'settings';

function MainAppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [settings, setSettings] = useState<Settings>(() => {
    try { const s = localStorage.getItem('law_app_settings'); return s ? JSON.parse(s) : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try { const s = localStorage.getItem('law_app_chat'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [cases, setCases] = useState<LegalCase[]>(() => {
    try { const s = localStorage.getItem('law_app_cases'); return s ? JSON.parse(s) : DEFAULT_CASES; } catch { return DEFAULT_CASES; }
  });
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    try { const s = localStorage.getItem('law_app_meetings'); return s ? JSON.parse(s) : DEFAULT_CONSULTATIONS; } catch { return DEFAULT_CONSULTATIONS; }
  });

  useEffect(() => { if (settings.autoAnalysis) localStorage.setItem('law_app_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { if (settings.autoAnalysis) localStorage.setItem('law_app_chat', JSON.stringify(chatHistory)); }, [chatHistory, settings]);
  useEffect(() => { if (settings.autoAnalysis) localStorage.setItem('law_app_cases', JSON.stringify(cases)); }, [cases, settings]);
  useEffect(() => { if (settings.autoAnalysis) localStorage.setItem('law_app_meetings', JSON.stringify(consultations)); }, [consultations, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <Scale className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full dot-1" />
            <span className="w-2 h-2 bg-emerald-500 rounded-full dot-2" />
            <span className="w-2 h-2 bg-emerald-500 rounded-full dot-3" />
          </div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'JD';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* ══ HEADER ══════════════════════════════════ */}
      <header className="fixed top-0 w-full z-40 bg-white border-b border-gray-200 h-14 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg md:hidden transition-all">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Consultoria Jurídica Inteligente</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              onClick={() => setActiveTab('settings')} title={user.email || ''}>
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      {/* ══ DESKTOP SIDEBAR ══════════════════════════ */}
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56 hidden md:flex flex-col bg-white border-r border-gray-200 py-5 px-3">
        <nav className="flex-1 space-y-1">
          {[
            { id: 'dashboard' as TabId,     label: 'Consultor IA',  Icon: MessageSquare },
            { id: 'processes' as TabId,     label: 'Processos',     Icon: Gavel         },
            { id: 'consultations' as TabId, label: 'Consultas',     Icon: Calendar      },
            { id: 'settings' as TabId,      label: 'Configurações', Icon: SettingsIcon  },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 pt-3">
          <button onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ══ MOBILE DRAWER ════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/40" />
          <div className="relative w-64 bg-white border-r border-gray-200 h-full flex flex-col py-5 px-3 z-50 animate-slide-right">
            <div className="flex items-center gap-2 px-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center"><Scale className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-bold text-gray-900 text-sm">CJI</span>
              <button onClick={() => setMobileMenuOpen(false)} className="ml-auto p-1 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
            {[
              { id: 'dashboard' as TabId,     label: 'Consultor IA',  Icon: MessageSquare },
              { id: 'processes' as TabId,     label: 'Processos',     Icon: Gavel         },
              { id: 'consultations' as TabId, label: 'Consultas',     Icon: Calendar      },
              { id: 'settings' as TabId,      label: 'Configurações', Icon: SettingsIcon  },
            ].map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {label}
                </button>
              );
            })}
            <div className="mt-auto border-t border-gray-200 pt-3">
              <button onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN ═════════════════════════════════════ */}
      <main className="md:pl-56 pt-14 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-8">
          {activeTab === 'dashboard'     && <Dashboard settings={settings} chatHistory={chatHistory} setChatHistory={setChatHistory} />}
          {activeTab === 'processes'     && <Processes cases={cases} setCases={setCases} />}
          {activeTab === 'consultations' && <Consultations consultations={consultations} setConsultations={setConsultations} />}
          {activeTab === 'settings'      && <SettingsPage settings={settings} setSettings={setSettings} setChatHistory={setChatHistory} setCases={setCases} setConsultations={setConsultations} />}
        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAV ════════════════════════ */}
      <nav className="fixed bottom-0 w-full z-40 md:hidden bg-white border-t border-gray-200 h-16 flex justify-around items-center px-4">
        {MOBILE_NAV.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 flex-1 py-2 transition-all ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`p-1 rounded-xl transition-all ${active ? 'bg-emerald-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══ LOGOUT MODAL ═════════════════════════════ */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowLogoutModal(false)} className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full z-50 border border-gray-200 animate-fade-in">
            <div className="flex gap-4 items-start mb-5">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl shrink-0 border border-red-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Encerrar sessão?</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Você precisará autenticar novamente para acessar o painel.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLogoutModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">
                Cancelar
              </button>
              <button onClick={async () => { await signOut(); setShowLogoutModal(false); }}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all shadow-lg shadow-red-200">
                Sair Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <AuthProvider><MainAppContent /></AuthProvider>;
}