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
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent, customText?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (customText || inputText).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user', content: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...chatHistory, newUserMsg];
    setChatHistory(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })), persona: settings.lawyerSpec })
      });
      if (!resp.ok) { const d = await resp.json().catch(() => ({})); throw new Error(d.error || 'Erro no servidor.'); }
      const data = await resp.json();
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant', content: data.message,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
      setShowToast(true); setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Deseja limpar toda a conversa atual?')) { setChatHistory([]); setErrorMessage(null); }
  };

  const suggestions = SUGGESTIONS[settings.lawyerSpec] || SUGGESTIONS.geral;
  const areaLabel = settings.lawyerSpec === 'geral' ? 'Direito Geral' : `Direito ${settings.lawyerSpec}`;

  return (
    <div id="dashboard-tab" className="space-y-5 animate-fade-in">

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-5 right-4 md:right-5 flex items-center gap-3 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-lg z-50 animate-fade-in">
          <div className="bg-emerald-50 text-emerald-600 rounded-full p-1.5 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900 block">Análise pronta!</span>
            <span className="text-[11px] text-gray-500">Resposta recebida com sucesso</span>
          </div>
        </div>
      )}

      {/* Main chat card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Inicie uma <span className="text-emerald-600">Consulta Jurídica Gratuita</span>
              </h3>
              <p className="text-[11px] text-gray-500">Tire dúvidas legais baseadas nos códigos brasileiros atualizados em tempo real.</p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <button onClick={handleClear}
              className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
              <RefreshCw className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {/* Messages / Empty state */}
        <div className="h-[380px] overflow-y-auto bg-gray-50/50">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col h-full p-4">
              {/* Suggestions list */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600">Dúvidas comuns em {areaLabel}</span>
                </div>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={(e) => handleSubmit(e, s)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-gray-100 last:border-b-0 transition-all text-left group cursor-pointer">
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                      <span className="font-medium">{s}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-400 shrink-0 ml-2 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'
                  }`}>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'} flex justify-between gap-3`}>
                      <span>{msg.role === 'user' ? 'Você' : settings.activeLawyerName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="prose">
                      {msg.content.split('\n').map((line, lIdx) => {
                        const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        if (line.startsWith('* ') || line.startsWith('- '))
                          return <ul key={lIdx} className="list-disc ml-4 my-1"><li dangerouslySetInnerHTML={{ __html: sanitizeHtml(html.substring(2)) }} /></ul>;
                        return <p key={lIdx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} className="my-1" />;
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1.5">
                  <span className="font-bold block">Falha na consulta:</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              {isLoading && (
                <div className="flex gap-3" id="typing-indicator">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-1" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-2" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full dot-3" />
                    <span className="text-[10px] text-gray-400 font-semibold ml-2 uppercase tracking-wider">Analisando...</span>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              id="user-input"
              type="text"
              autoComplete="off"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Digite sua dúvida ou problema jurídico completo aqui..."
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
            <button type="submit" disabled={!inputText.trim() || isLoading}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                inputText.trim() && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center gap-1.5 mt-2.5">
            <Shield className="w-3 h-3 text-gray-400 shrink-0" />
            <p className="text-[10px] text-gray-400 leading-none">
              AVISO: As respostas prestadas pela IA são para fins exclusivamente informativos e educacionais e não substituem de forma alguma o aconselhamento jurídico formal e personalizado.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { Icon: Shield,    color: 'text-emerald-600 bg-emerald-50 border-emerald-100', title: 'Privacidade Total',            text: 'Seus relatos de casos e consultas são altamente criptografados para resguardar sigilo absoluto.' },
          { Icon: FileCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', title: 'Jurisprudência em Tempo Real', text: 'Integração profunda para extrair fundamentos jurídicos, CLT, Súmulas TST e leis federais consolidadas.' },
          { Icon: Zap,       color: 'text-emerald-600 bg-emerald-50 border-emerald-100', title: 'Agilidade Analítica',          text: 'Respostas complexas minuciosamente estruturadas em segundos para otimizar seu tempo legal de ação.' },
        ].map(({ Icon, color, title, text }) => (
          <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-2xl ${color} border flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
            <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

    </div>
  );
}