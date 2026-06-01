import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shield, FileCheck, Zap, HelpCircle, ArrowRight, CheckCircle2, RefreshCw, Bot } from 'lucide-react';
import { ChatMessage, Settings } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface DashboardProps {
  settings: Settings;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const SUGGESTIONS: Record<string, string[]> = {
  geral: [
    "Quais as diferenças entre casamento e união estável?",
    "Como funciona a proteção de patentes no Brasil?",
    "O que constitui dano moral e como comprovar?",
    "Quais são os direitos básicos do consumidor ao devolver um produto?"
  ],
  trabalhista: [
    "Como funciona o aviso prévio proporcional ao tempo de serviço?",
    "Horas extras: qual o limite diário e o cálculo básico?",
    "Fui demitido sem justa causa. Quais as minhas verbas rescisórias?",
    "O que caracteriza o assédio moral no ambiente corporativo?"
  ],
  civil: [
    "Como fazer um divórcio consensual em cartório passo a passo?",
    "Quais são os herdeiros necessários no inventário?",
    "Aluguel atrasado: quanto tempo até o proprietário pedir despejo?",
    "Como fixar o valor ideal para pensão alimentícia de um filho?"
  ],
  penal: [
    "O que significa o direito ao silêncio e quando ele se aplica?",
    "Diferença prática entre dolo e culpa no homicídio de trânsito?",
    "Quais são as fases de um inquérito policial no Brasil?",
    "O que é legítima defesa em termos jurídicos estritos?"
  ],
  tributario: [
    "Quem tem direito à isenção de Imposto de Renda por doença grave?",
    "Incentivos fiscais do Simples Nacional vs Lucro Presumido?",
    "Reforma Tributária: o que muda com o novo IVA nacional?",
    "Como recorrer de uma autuação de sonegação fiscal indevida?"
  ],
  empresarial: [
    "Quais as etapas essenciais para registrar uma marca no INPI?",
    "O que deve constar em um acordo de sócios protetivo?",
    "Como adequar minha pequena empresa às exigências da LGPD?",
    "Diferenças entre Sociedade Limitada (LTDA) e S.A. fechada?"
  ]
};

export default function Dashboard({ settings, chatHistory, setChatHistory }: DashboardProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const activePersona = settings.lawyerSpec;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText || inputText).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          persona: activePersona
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "O servidor não pôde responder à consulta.");
      }

      const data = await response.json();

      const newAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, newAssistantMessage]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro de conexão com o consultor de inteligência artificial.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Deseja realmente limpar toda a sua conversa atual? Isso não afetará outros dados.")) {
      setChatHistory([]);
      setErrorMessage(null);
    }
  };

  const currentSuggestions = SUGGESTIONS[activePersona] || SUGGESTIONS.geral;

  return (
    <div id="dashboard-tab" className="space-y-6 animate-fade-in">

      {/* ─── Success Toast ─────────────────────────────────── */}
      {showToast && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 flex items-center gap-3 bg-slate-900 border border-emerald-500/20 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-black/40 z-50 animate-fade-in">
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-1.5">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-100 block leading-none">Análise pronta!</span>
            <span className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-widest">Resposta recebida</span>
          </div>
        </div>
      )}

      {/* ─── Page header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Consultor Jurídico IA</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Área ativa: <span className="text-emerald-400 font-semibold capitalize">
              {settings.lawyerSpec === 'geral' ? 'Direito Geral' : `Direito ${settings.lawyerSpec}`}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">IA Ativa</span>
        </div>
      </div>

      {/* ─── Main Chat Card ───────────────────────────────── */}
      <section className="bg-[#0d1424] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/30">

        {/* Chat header */}
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md" />
              <div className="relative p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Pergunte ao Especialista</h3>
              <p className="text-[10px] text-slate-500">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>

          {chatHistory.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-[11px] text-slate-600 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-all font-medium flex items-center gap-1.5 border border-transparent hover:border-red-500/10"
              title="Limpar histórico"
            >
              <RefreshCw className="w-3 h-3" />
              Limpar Chat
            </button>
          )}
        </div>

        {/* Message panel */}
        <div className="h-[440px] overflow-y-auto p-5 space-y-5 flex flex-col bg-[#070c18]/40">
          {chatHistory.length === 0 ? (
            /* Empty state */
            <div className="flex-grow flex flex-col items-center justify-center text-center py-6 px-4">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                <div className="relative w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-slate-100 font-bold text-lg mb-2">Inicie uma Consulta Jurídica</h3>
              <p className="text-slate-500 text-sm max-w-md mb-7 leading-relaxed">
                Tire suas dúvidas legais e receba análises baseadas nos códigos civis, penais, trabalhistas e fiscais brasileiros.
              </p>

              {/* Suggestions grid */}
              <div className="w-full max-w-2xl bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl text-left">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-3">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Dúvidas comuns em {settings.lawyerSpec === 'geral' ? 'Direito Geral' : `Direito ${settings.lawyerSpec}`}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSubmit(e, suggestion)}
                      className="text-left text-xs bg-white/[0.03] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20 border border-white/[0.05] text-slate-400 p-3 rounded-xl transition-all duration-200 flex items-start gap-2.5 group cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors" />
                      <span className="font-medium line-clamp-2 leading-relaxed">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className="space-y-5 flex-grow">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600/90 text-white rounded-tr-none border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/60 text-slate-200 rounded-tl-none border border-white/[0.06]'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                      msg.role === 'user' ? 'text-emerald-200/70' : 'text-slate-500'
                    } flex items-center justify-between gap-3`}>
                      <span>{msg.role === 'user' ? 'Você' : settings.activeLawyerName}</span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>
                    <div className={`font-sans select-text ${msg.role === 'assistant' ? 'prose-dark' : ''}`}>
                      {msg.content.split('\n').map((line, lIdx) => {
                        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return (
                            <ul key={lIdx} className="list-disc ml-5 my-1 text-inherit">
                              <li dangerouslySetInnerHTML={{ __html: sanitizeHtml(formattedLine.substring(2)) }} />
                            </ul>
                          );
                        }
                        return <p key={lIdx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formattedLine) }} className="my-1" />;
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Error message */}
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex flex-col gap-2">
                  <span className="font-bold text-red-400">❌ Falha na Consulta:</span>
                  <span>{errorMessage}</span>
                  <button
                    onClick={() => {
                      if (chatHistory.length > 0) {
                        const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
                        if (lastUserMsg) handleSubmit(undefined as any, lastUserMsg.content);
                      }
                    }}
                    className="mt-1 text-left text-red-400/80 hover:text-red-300 underline font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Tentar reenviar última pergunta
                  </button>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start items-center gap-3" id="typing-indicator">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="bg-slate-800/60 border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-1" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-2" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-3" />
                    <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">IA Analisando...</span>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-white/[0.05] bg-[#0a1020]/60">
          <form className="flex gap-3" onSubmit={(e) => handleSubmit(e)}>
            <input
              id="user-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="input-dark flex-grow bg-[#070c18] border border-white/[0.08] hover:border-white/[0.12] focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200"
              placeholder="Digite sua dúvida ou problema jurídico..."
              type="text"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center active:scale-95 ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
          <p className="text-[10px] text-slate-700 text-center mt-2.5 uppercase tracking-wider font-medium">
            Respostas da IA são informativas e não substituem assessoria jurídica formal.
          </p>
        </div>
      </section>

      {/* ─── Info cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            Icon: Shield,
            title: 'Privacidade Total',
            text: 'Seus relatos de casos são protegidos com criptografia de ponta e não são compartilhados.',
          },
          {
            Icon: FileCheck,
            title: 'Jurisprudência em Tempo Real',
            text: 'Integração profunda com CLT, Súmulas TST e leis federais brasileiras consolidadas.',
          },
          {
            Icon: Zap,
            title: 'Agilidade Analítica',
            text: 'Respostas estruturadas e fundamentadas em segundos para otimizar seu tempo legal.',
          },
        ].map(({ Icon, title, text }) => (
          <div
            key={title}
            className="group bg-[#0d1424] border border-white/[0.05] p-5 rounded-2xl flex flex-col items-start hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-300"
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-200">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-100 mb-1.5 text-sm">{title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

    </div>
  );
}