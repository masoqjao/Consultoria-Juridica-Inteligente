import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  MessageSquare, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Scale, 
  ShieldAlert,
  Home,
  Sparkles,
  ChevronRight
} from 'lucide-react';

import { ChatMessage, LegalCase, Consultation, Settings } from './types';
import Dashboard from './components/Dashboard';
import Processes from './components/Processes';
import Consultations from './components/Consultations';
import SettingsPage from './components/SettingsPage';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';

// Default initial state data for smooth, functional first-use experience
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
    description: "Contratado formalmente como assistente administrative, o reclamante acumulou as funções de caixa operando transações financeiras e gerente geral de filial sem qualquer compensação remuneratória correspondente durante 24 meses. Reivindicação do acréscimo de 40% contratual.",
    status: "ongoing",
    updatedDate: "2026-05-28",
    clientNotes: "Audiência de instrução designada para meados de julho de 2026. Testemunhas presenciais já intimadas.",
    aiAnalysis: `1. **Resumo Preliminar**: Ação trabalhista objetivando diferenças salariais por acúmulo funcional simulado concomitantemente com cobrança de horas adicionais.\n\n2. **Fundamentação Legal Recomendada**: O acúmulo desproporcional sem compensação encontra amparo de correção analógica no Artigo 468 da CLT, sob o princípio da vedação ao enriquecimento sem causa (Art. 884 do Código Civil).\n\n3. **Análise de Riscos**: Risco Médio. A chave de sucesso processual reside inteiramente na prova testemunhal robusta e registros documentais diários provando a concomitância das funções.\n\n4. **Próximos Passos Sugeridos**: Revisar as atas de depoimento e assegurar que as testemunhas confirmem a frequência constante de desvio funcional.`
  },
  {
    id: "case-2",
    title: "Ação de Indenização por Cobrança Abusiva e Danos Morais",
    caseNumber: "1004512-88.2025.8.26.0002",
    category: "civil",
    description: "Inclusão indevida de CPF em cadastro de inadimplentes por empresa aérea de transporte após cancelamento consensual e estorno comprovado de bilhete aéreo. Cobrança indevida continuada gerando abalo de crédito pessoal.",
    status: "resolved-won",
    updatedDate: "2026-05-15",
    clientNotes: "Transitado em julgado. Sentença favorável de danos morais fixados em R$ 8.000,00.",
    aiAnalysis: `1. **Resumo Preliminar**: Demanda indenizatória de danos morais por inscrição e manutenção indevida em cadastro de restrição ao crédito (SPC/SERASA).\n\n2. **Fundamentação Legal Recomendada**: Súmula 385 do STJ e artigos 186 e 927 do Código Civil Brasileiro de 2002 (responsabilidade civil subjetiva).\n\n3. **Análise de Riscos**: Baixo risco. Negativação com débito quitado/inexistente gera o dever de indenizar *in re ipsa* (presumido).\n\n4. **Próximos Passos**: Entrar com requerimento provisório de execução forçada do pagamento de sentença judicial.`
  }
];

const DEFAULT_COON_SOCIATION: Consultation[] = [
  {
    id: "meet-1",
    clientName: "Mariana Almeida Ramos",
    area: "civil",
    date: "2026-06-15",
    time: "14:30",
    issue: "Dúvida sobre partilha de bens em dissolução amigável de união estável extraconjugal.",
    status: "scheduled"
  },
  {
    id: "meet-2",
    clientName: "Roberto Mendes Filho",
    area: "trabalhista",
    date: "2026-05-20",
    time: "10:00",
    issue: "Termo de rescisão imotivadora sob alegações fáticas falsas pelo empregador.",
    status: "completed"
  }
];

// Navigation items definition
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Painel',        Icon: MessageSquare },
  { id: 'processes',     label: 'Processos',      Icon: Gavel         },
  { id: 'consultations', label: 'Consultas',      Icon: Calendar      },
  { id: 'settings',      label: 'Configurações',  Icon: SettingsIcon  },
] as const;

type TabId = typeof NAV_ITEMS[number]['id'];

function MainAppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Core Persisted State Hook declarations
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('law_app_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('law_app_chat');
    return saved ? JSON.parse(saved) : [];
  });

  const [cases, setCases] = useState<LegalCase[]>(() => {
    const saved = localStorage.getItem('law_app_cases');
    return saved ? JSON.parse(saved) : DEFAULT_CASES;
  });

  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('law_app_meetings');
    return saved ? JSON.parse(saved) : DEFAULT_COON_SOCIATION;
  });

  // Sync to localStorage on every state delta change
  useEffect(() => {
    if (settings.autoAnalysis) {
      localStorage.setItem('law_app_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (settings.autoAnalysis) {
      localStorage.setItem('law_app_chat', JSON.stringify(chatHistory));
    }
  }, [chatHistory, settings]);

  useEffect(() => {
    if (settings.autoAnalysis) {
      localStorage.setItem('law_app_cases', JSON.stringify(cases));
    }
  }, [cases, settings]);

  useEffect(() => {
    if (settings.autoAnalysis) {
      localStorage.setItem('law_app_meetings', JSON.stringify(consultations));
    }
  }, [consultations, settings]);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  // ─── Loading Screen ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c18] flex flex-col justify-center items-center p-4 font-sans">
        <div className="text-center space-y-6">
          {/* Animated logo */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full dot-1" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full dot-2" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full dot-3" />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest font-mono">Verificando sessão...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'JD';
  const specLabel = settings.lawyerSpec === 'geral' ? 'Consultor Premium' : settings.lawyerSpec;

  return (
    <div className="min-h-screen bg-[#070c18] font-sans text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">

      {/* ═══ TOP HEADER ══════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-40 bg-[#0a1020]/80 backdrop-blur-xl border-b border-white/[0.06] h-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex justify-between items-center">

          {/* Left: Logo + Mobile menu toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg md:hidden transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative hidden sm:block">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md" />
                <div className="relative p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl">
                  <Scale className="w-4.5 h-4.5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                  Consultoria Jurídica
                </h1>
                <p className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-widest leading-none mt-0.5 hidden sm:block">
                  Inteligente · IA
                </p>
              </div>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-full transition-all relative"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 border border-[#0a1020] rounded-full animate-pulse" />
            </button>

            <div className="h-5 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-mono font-bold text-xs shadow-lg shadow-emerald-500/10">
                {userInitials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[160px]">
                  {user.email || ''}
                </p>
                <p className="text-[10px] text-emerald-400/60 font-mono uppercase tracking-wider mt-0.5">
                  {specLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">

        {/* ═══ DESKTOP SIDEBAR ═════════════════════════════════════ */}
        <nav className="h-[calc(100vh-4rem)] w-64 fixed left-0 top-16 hidden md:flex flex-col py-5 px-3 bg-[#0a1020]/90 backdrop-blur-xl border-r border-white/[0.05] select-none shrink-0">

          {/* Lawyer profile card */}
          <div className="px-2 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Gavel className="w-4.5 h-4.5 text-emerald-400" />
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-100 truncate" title={settings.activeLawyerName}>
                  {settings.activeLawyerName}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-mono mt-0.5">
                  {specLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-1 space-y-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    isActive
                      ? 'nav-active bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-emerald-500/50" />}
                </button>
              );
            })}
          </div>

          {/* AI Status indicator */}
          <div className="px-2 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2.5">
              <div className="relative shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">IA Operacional</p>
                <p className="text-[9px] text-slate-600 font-mono">Gemini 2.5 Flash</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="px-2 border-t border-white/[0.05] pt-3">
            <button
              onClick={handleLogout}
              className="w-full text-xs font-semibold text-slate-600 hover:text-red-400 hover:bg-red-500/5 px-4 py-3 rounded-xl flex items-center gap-3 transition-all border border-transparent hover:border-red-500/10"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </nav>

        {/* ═══ MOBILE DRAWER ═══════════════════════════════════════ */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <div className="relative w-72 max-w-[80vw] bg-[#0d1424] border-r border-white/[0.06] h-full flex flex-col py-6 px-4 z-50 animate-slide-right">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <Scale className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-white/5 text-slate-400 rounded-lg hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-slate-100 truncate">{settings.activeLawyerName}</p>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-400/60 font-mono">{specLabel}</p>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ id, label, Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                      className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/[0.05]">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-xs font-semibold text-slate-600 hover:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MAIN CONTENT ════════════════════════════════════════ */}
        <main className="flex-grow md:pl-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-10">

            {activeTab === 'dashboard' && (
              <Dashboard
                settings={settings}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            )}

            {activeTab === 'processes' && (
              <Processes
                cases={cases}
                setCases={setCases}
              />
            )}

            {activeTab === 'consultations' && (
              <Consultations
                consultations={consultations}
                setConsultations={setConsultations}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                settings={settings}
                setSettings={setSettings}
                setChatHistory={setChatHistory}
                setCases={setCases}
                setConsultations={setConsultations}
              />
            )}

          </div>
        </main>
      </div>

      {/* ═══ MOBILE BOTTOM NAV ═══════════════════════════════════ */}
      <nav className="fixed bottom-0 w-full z-40 md:hidden bg-[#0a1020]/95 backdrop-blur-xl border-t border-white/[0.06] h-[68px] flex justify-around items-center px-2 select-none">
        {[
          { id: 'dashboard', label: 'Início', Icon: Home },
          { id: 'processes', label: 'Processos', Icon: Gavel },
          { id: 'consultations', label: 'Consultas', Icon: Calendar },
          { id: 'settings', label: 'Ajustes', Icon: SettingsIcon },
        ].map(({ id, label, Icon }) => {
          const isActive = activeTab === id as TabId;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabId)}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/15' : ''}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ═══ LOGOUT MODAL ════════════════════════════════════════ */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowLogoutModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-[#0d1424] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/50 max-w-sm w-full z-50 animate-fade-in">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500/60 via-red-400/40 to-transparent rounded-t-2xl" />

            <div className="flex gap-4 items-start mb-5">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-100 text-sm">Encerrar sessão?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sua sessão atual será encerrada. Você precisará autenticar novamente para acessar o painel jurídico.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-white/5 hover:bg-white/10 border border-white/[0.08] text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/20 cursor-pointer transition-all"
              >
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
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}