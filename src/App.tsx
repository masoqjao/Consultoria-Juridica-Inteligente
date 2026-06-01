import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  MessageSquare, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  User, 
  ChevronRight, 
  Menu, 
  X, 
  Scale, 
  ShieldAlert,
  Home
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

function MainAppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'processes' | 'consultations' | 'settings'>('dashboard');
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

  // Sync to localStorage on every state delta change if autoAnalysis/persist is true
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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'JD';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-emerald-250 selection:text-emerald-900">
      
      {/* Dynamic TopAppBar Header (Responsive) */}
      <header className="fixed top-0 w-full z-40 bg-white border-b border-slate-200/80 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg hidden sm:flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Consultoria Jurídica Inteligente
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-pulse"></span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 font-mono font-bold">
                {userInitials}
              </div>
              <span className="hidden md:inline select-none text-slate-650 pr-1">{user.email || ''}</span>
            </div>
          </div>

        </div>
      </header>

      <div className="flex flex-1 pt-16">

        {/* 1. SideNavBar Navigation Drawer (Desktop Only) */}
        <nav className="h-[calc(100vh-4rem)] w-64 fixed left-0 top-16 hidden md:flex flex-col py-6 px-3 bg-white border-r border-slate-200/80 space-y-1.5 select-none shrink-0">
          
          {/* Active Lawyer Mini Card Profile */}
          <div className="px-3 mb-6">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Gavel className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-900 truncate" title={settings.activeLawyerName}>
                  {settings.activeLawyerName}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-emerald-650 font-bold font-mono">
                  {settings.lawyerSpec === 'geral' ? 'Consultor Premium' : settings.lawyerSpec}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-50 text-emerald-750 font-extrabold stroke-[2.5px]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5 shrink-0" />
            <span>Painel</span>
          </button>

          <button
            onClick={() => setActiveTab('processes')}
            className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'processes' 
                ? 'bg-emerald-50 text-emerald-750 font-extrabold stroke-[2.5px]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Gavel className="w-4.5 h-4.5 shrink-0" />
            <span>Processos</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'consultations' 
                ? 'bg-emerald-50 text-emerald-750 font-extrabold stroke-[2.5px]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4.5 h-4.5 shrink-0" />
            <span>Consultas</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'settings' 
                ? 'bg-emerald-50 text-emerald-750 font-extrabold stroke-[2.5px]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5 shrink-0" />
            <span>Configurações</span>
          </button>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full text-xs font-bold text-slate-550 hover:text-red-650 hover:bg-red-50/50 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors shrink-0"
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </nav>

        {/* 2. Mobile Responsive Nav Menu (Slide overlay drawer) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            />
            {/* Drawer Panel */}
            <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col space-y-6 z-50 animate-slide-right">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Opções de Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 px-1.5 bg-slate-100 text-slate-550 rounded-lg font-bold"
                >
                  Fechar
                </button>
              </div>

              {/* Sidebar Active Lawyer Name box */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <Gavel className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-slate-900 truncate">{settings.activeLawyerName}</p>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-650 font-bold">{settings.lawyerSpec === 'geral' ? 'Consultor Premium' : settings.lawyerSpec}</p>
                </div>
              </div>

              <div className="flex-grow flex flex-col gap-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-750 font-extrabold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4.5 h-4.5 shrink-0" />
                  <span>Painel</span>
                </button>

                <button
                  onClick={() => { setActiveTab('processes'); setMobileMenuOpen(false); }}
                  className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    activeTab === 'processes' ? 'bg-emerald-50 text-emerald-750 font-extrabold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Gavel className="w-4.5 h-4.5 shrink-0" />
                  <span>Processos</span>
                </button>

                <button
                  onClick={() => { setActiveTab('consultations'); setMobileMenuOpen(false); }}
                  className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    activeTab === 'consultations' ? 'bg-emerald-50 text-emerald-750 font-extrabold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4.5 h-4.5 shrink-0" />
                  <span>Consultas</span>
                </button>

                <button
                  onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                  className={`w-full text-xs font-bold tracking-wider px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    activeTab === 'settings' ? 'bg-emerald-50 text-emerald-750 font-extrabold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <SettingsIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>Configurações</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-xs font-bold text-slate-550 hover:text-red-750 py-3 rounded-xl flex items-center gap-3"
                >
                  <LogOut className="w-4.5 h-4.5 shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Dynamic Content Frame (Responsive offset) */}
        <main className="flex-grow md:pl-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
            
            {/* Dynamic Content Switching router representation */}
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

      {/* 4. Bottom Tab Bar Navigation (Touch and Mobile Optimized) */}
      <nav className="fixed bottom-0 w-full z-40 md:hidden bg-white border-t border-slate-200 shadow-xl h-16 flex justify-around items-center px-2 select-none rounded-t-2xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-extrabold scale-102' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Início</span>
        </button>

        <button 
          onClick={() => setActiveTab('processes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'processes' ? 'text-emerald-600 font-extrabold scale-102' : 'text-slate-400'
          }`}
        >
          <Gavel className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Processos</span>
        </button>

        <button 
          onClick={() => setActiveTab('consultations')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'consultations' ? 'text-emerald-600 font-extrabold scale-102' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Consultas</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'settings' ? 'text-emerald-600 font-extrabold scale-102' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Ajustes</span>
        </button>
      </nav>

      {/* 5. Sleek Confirmation Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowLogoutModal(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-sm w-full space-y-4 z-50 animate-fade-in/95">
            <div className="flex gap-3 items-start">
              <div className="p-3 bg-red-50 text-red-650 rounded-xl shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Pretende sair do Painel?</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Sua sessão atual de consultas será fechada e você precisará logar de novo para simular atendimentos juridicos.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm cursor-pointer"
              >
                Desconectar
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