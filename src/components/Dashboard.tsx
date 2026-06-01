import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shield, FileCheck, Zap, HelpCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
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
      
      // Trigger success toast
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
    <div id="dashboard-tab" className="space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {showToast && (
        <div 
          id="success-toast" 
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce"
        >
          <div className="bg-emerald-500 text-white rounded-full p-1.5 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">Análise pronta!</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">Resposta Recebida</span>
          </div>
        </div>
      )}

      {/* Main AI Chatbot Box */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header and IA Active Indicator */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pergunte ao nosso especialista</h2>
              <p className="text-xs text-slate-550 capitalize">Área ativa: {settings.lawyerSpec === 'geral' ? 'Geral' : settings.lawyerSpec}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {chatHistory.length > 0 && (
              <button 
                onClick={handleClearChat}
                className="text-xs text-slate-550 hover:text-red-650 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all font-medium flex items-center gap-1"
                title="Limpar histórico da conversa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Limpar Chat
              </button>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-705 text-xs font-semibold rounded-full border border-emerald-100/50">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              IA ATIVA
            </span>
          </div>
        </div>

        {/* Message Panel Area */}
        <div className="h-[430px] overflow-y-auto p-6 space-y-6 bg-slate-50/30 flex flex-col">
          {chatHistory.length === 0 ? (
            /* Elegant Empty State */
            <div className="flex-grow flex flex-col items-center justify-center text-center py-6 px-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100/50">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-2">Inicie uma Consulta Jurídica Gratuita</h3>
              <p className="text-slate-550 text-sm max-w-md mb-6 leading-relaxed">
                Tire suas dúvidas legais e receba análises precisas baseadas nos códigos civis, penais, trabalhistas e fiscais brasileiros atualizados em tempo real.
              </p>
              
              {/* Sugestões de Perguntas Rápidas */}
              <div className="w-full max-w-2xl bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-xs uppercase tracking-wider mb-3">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Dúvidas comuns em {settings.lawyerSpec === 'geral' ? 'Direito Geral' : `Direito ${settings.lawyerSpec}`}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSubmit(e, suggestion)}
                      className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-100 text-slate-600 p-3 rounded-lg transition-all duration-200 flex items-start gap-2 group cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-2">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Populated Conversation Log */
            <div className="space-y-5 flex-grow">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-700/10' 
                        : 'bg-white text-slate-800 rounded-tl-none border-slate-200/60'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">
                      <span>{msg.role === 'user' ? 'Você' : `${settings.activeLawyerName}`}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    {/* Render message as simple HTML styling or newline breaks */}
                    <div className="text-sm font-sans leading-relaxed prose select-text">
                      {msg.content.split('\n').map((line, lIdx) => {
                        // Very basic markdown formatting for bold lines
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

              {/* Error Message display */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex flex-col gap-1 shadow-sm">
                  <span className="font-bold">❌ Falha na Consulta:</span>
                  <span>{errorMessage}</span>
                  <button 
                    onClick={() => {
                      if (chatHistory.length > 0) {
                        const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
                        if (lastUserMsg) handleSubmit(undefined as any, lastUserMsg.content);
                      }
                    }} 
                    className="mt-2 text-left text-red-750 underline font-semibold flex items-center gap-1 hover:text-red-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                    Tentar reenviar última pergunta
                  </button>
                </div>
              )}

              {/* Bot Loading/Thinking Indicator */}
              {isLoading && (
                <div className="flex justify-start items-center space-x-3" id="typing-indicator">
                  <div className="bg-slate-100 border border-slate-200/50 px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">IA Analisando Leis</span>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar and Form */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form className="flex gap-3" onSubmit={(e) => handleSubmit(e)}>
            <input 
              id="user-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-grow bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 text-sm text-slate-800"
              placeholder="Digite sua dúvida ou problema jurídico completo aqui..." 
              type="text"
              autoComplete="off"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center active:scale-95 text-white ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-3 uppercase tracking-wider font-medium leading-normal max-w-xl mx-auto">
            AVISO: As respostas prestadas pela IA são para fins exclusivamente informativos e educacionais e não substituem de forma alguma o aconselhamento jurídico formal e personalizado.
          </p>
        </div>
      </section>

      {/* Rhythmic Bottom Informational Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-all hover:border-emerald-200/50 group duration-200">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5 text-base">Privacidade Total</h3>
          <p className="text-slate-550 text-sm leading-relaxed">
            Seus relatos de casos e consultas são altamente criptografados para resguardar sigilo absoluto.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-all hover:border-emerald-200/50 group duration-200">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5 text-base">Jurisprudência em Tempo Real</h3>
          <p className="text-slate-550 text-sm leading-relaxed">
            Integração profunda para extrair fundamentos jurídicos, CLT, Súmulas TST e leis federais consolidadas.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-all hover:border-emerald-200/50 group duration-200">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5 text-base">Agilidade Analítica</h3>
          <p className="text-slate-550 text-sm leading-relaxed">
            Respostas complexas minuciosamente estruturadas em segundos para otimizar seu tempo legal de ação.
          </p>
        </div>
      </div>

    </div>
  );
}