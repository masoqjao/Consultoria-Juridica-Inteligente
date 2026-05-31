import React, { useState } from 'react';
import { Gavel, FolderPlus, Search, Sparkles, AlertCircle, FileText, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { LegalCase, LegalArea, LiveCaseStatus } from '../types';

interface ProcessesProps {
  cases: LegalCase[];
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral' },
  { value: 'trabalhista', label: 'Trabalhista (CLT)' },
  { value: 'civil', label: 'Civil e Contratos' },
  { value: 'penal', label: 'Criminal / Penal' },
  { value: 'tributario', label: 'Tributário / Fiscal' },
  { value: 'empresarial', label: 'Empresarial / Startups' }
];

const STATUS_CONFIGS: Record<LiveCaseStatus, { bg: string; text: string; label: string }> = {
  preliminary: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Petição Inicial / Preliminar' },
  ongoing: { bg: 'bg-blue-55', text: 'text-blue-700', label: 'Em Andamento Judicial' },
  suspended: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Recurso / Suspenso' },
  'resolved-won': { bg: 'bg-emerald-100 border border-emerald-250', text: 'text-emerald-800', label: 'Vitória Autora / Resolvido' },
  'resolved-lost': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Improcedente / Encerrado' }
};

export default function Processes({ cases, setCases }: ProcessesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [analyzingCaseId, setAnalyzingCaseId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [category, setCategory] = useState<LegalArea>('trabalhista');
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LiveCaseStatus>('preliminary');
  const [clientNotes, setClientNotes] = useState("");

  // Accordion active AI report view
  const [visibleReportId, setVisibleReportId] = useState<string | null>(null);

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newCase: LegalCase = {
      id: Date.now().toString(),
      title,
      caseNumber: caseNumber || "Em confecção de Protocolo",
      category,
      description,
      status,
      clientNotes,
      updatedDate: new Date().toLocaleDateString('pt-BR')
    };

    setCases([newCase, ...cases]);
    
    // Clear forms
    setTitle("");
    setCaseNumber("");
    setCategory('trabalhista');
    setDescription("");
    setStatus('preliminary');
    setClientNotes("");
    setShowAddForm(false);
  };

  const handleTriggerAnalysis = async (e: React.MouseEvent, cItem: LegalCase) => {
    e.stopPropagation();
    if (analyzingCaseId) return;

    setAnalyzingCaseId(cItem.id);
    try {
      const resp = await fetch('/api/legal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: cItem.title,
          caseCategory: cItem.category,
          caseDescription: cItem.description,
          caseNumber: cItem.caseNumber
        })
      });

      if (!resp.ok) {
        throw new Error("Não foi possível gerar análise analítica jurídica do processo.");
      }

      const data = await resp.json();
      
      // Update specific case report
      setCases(prev => prev.map(item => {
        if (item.id === cItem.id) {
          return { ...item, aiAnalysis: data.analysis };
        }
        return item;
      }));
      
      setVisibleReportId(cItem.id);

    } catch (err) {
      console.error(err);
      alert("Ocorreu um problema ao conectar com o serviço de parecer jurídico automatizado da IA.");
    } finally {
      setAnalyzingCaseId(null);
    }
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente remover este processo do seu painel de acompanhamento?")) {
      setCases(prev => prev.filter(c => c.id !== id));
      if (visibleReportId === id) setVisibleReportId(null);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="processes-tab" className="space-y-6 animate-fade-in">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pl-10 pr-4 py-2 text-sm rounded-xl"
            placeholder="Pesquisar por processo, número ou descrição..."
          />
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          {showAddForm ? "Cancelar Cadastro" : "Cadastrar Novo Processo"}
        </button>
      </div>

      {/* Add New Case Form Card */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md animate-slide-down">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Gavel className="w-5 h-5 text-emerald-600" />
            Inserir Novo Processo Judicial
          </h3>
          <form onSubmit={handleAddCase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Título / Reclamação Principal</label>
                <input 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                  placeholder="Ex: Ação de Reconhecimento de Vínculo Trabalhista"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Número do Processo (Opcional)</label>
                <input 
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                  placeholder="Ex: 5013098-45.2023.8.09.0051"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Área Acadêmica/Jurídica</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LegalArea)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm cursor-pointer"
                >
                  {AREAS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fase Legal do Caso</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LiveCaseStatus)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm cursor-pointer"
                >
                  <option value="preliminary">Petição Inicial / Em Construção</option>
                  <option value="ongoing">Ajuizado / Instrução / Em Julgamento</option>
                  <option value="suspended">Suspenso por Recurso</option>
                  <option value="resolved-won">Resolvido (Vitória favorável)</option>
                  <option value="resolved-lost">Julgado Improcedente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Alegações Fáticas (Descrição do Problema)</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                placeholder="Descreva detalhadamente o caso, datas de contratação/demissão se houver, verbas devidas, valores solicitados..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-755 uppercase tracking-wider mb-1.5">Anotações Internas de Controle (Opcional)</label>
              <textarea 
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                placeholder="Adicione anotações extras como provas disponíveis, testemunhas..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Salvar Processo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lawsuits Lists Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Gavel className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">Nenhum processo localizado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">Cadastre um novo caso judicial ou limpe seu filtro de busca para visualizar.</p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const isAnalyzing = analyzingCaseId === c.id;
            const isReportVisible = visibleReportId === c.id;
            const stateCfg = STATUS_CONFIGS[c.status];

            return (
              <div 
                key={c.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Case Card Title Panel */}
                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">
                          {AREAS.find(a => a.value === c.category)?.label || 'Geral'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stateCfg.bg} ${stateCfg.text}`}>
                          {stateCfg.label}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">Processo Nº: {c.caseNumber}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleTriggerAnalysis(e, c)}
                        disabled={isAnalyzing}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                          c.aiAnalysis 
                            ? 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 border-emerald-200' 
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing 
                          ? 'Gerando Estudo...' 
                          : c.aiAnalysis 
                            ? 'Parecer Gerado (Atualizar)' 
                            : 'Parecer Legal da IA'
                        }
                      </button>

                      <button 
                        onClick={(e) => handleDeleteCase(c.id, e)}
                        className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Deletar este processo"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>

                  {/* Body Case Description Text */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fatos/Relato do Caso</span>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{c.description}</p>
                    </div>

                    {c.clientNotes && (
                      <div className="bg-slate-55 p-3 rounded-lg border-l-2 border-slate-300 text-xs">
                        <span className="font-bold text-slate-600 uppercase tracking-widest text-[9px] block mb-1">Notas do Advogado (Interno)</span>
                        <span className="text-slate-600 italic">{c.clientNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* AI Report Dropdown Accordion Controller */}
                  {c.aiAnalysis && (
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setVisibleReportId(isReportVisible ? null : c.id)}
                        className="w-full flex items-center justify-between text-xs text-emerald-700 font-bold hover:text-emerald-800 transition-colors py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          Estudo Consultivo da Inteligência Artificial
                        </span>
                        {isReportVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isReportVisible && (
                        <div className="mt-3 bg-emerald-50/40 p-5 rounded-xl border border-emerald-100 text-xs text-slate-800 space-y-3 leading-relaxed animate-slide-down">
                          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Laudo Técnico Automatizado (Dr. Advogado AI)</span>
                          </div>
                          
                          <div id="ai-report-content" className="prose text-slate-700">
                            {c.aiAnalysis.split('\n').map((line, lIdx) => {
                              const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              
                              if (line.startsWith('* ') || line.startsWith('- ')) {
                                return (
                                  <ul key={lIdx} className="list-disc ml-5 my-1">
                                    <li dangerouslySetInnerHTML={{ __html: boldLine.substring(2) }} />
                                  </ul>
                                );
                              }
                              return <p key={lIdx} dangerouslySetInnerHTML={{ __html: boldLine }} className="my-1.5" />;
                            })}
                          </div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide italic border-t border-emerald-100/60 pt-3 mt-4">
                            Relatório consultivo gerado pela inteligência analítica baseada nas alegações fáticas fornecidas por este usuário. Não tem valor de petição assinada formalmente por patrono legal sem aprovação manual do advogado constituído.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skeletons loader */}
                  {isAnalyzing && (
                    <div className="bg-emerald-50/10 p-5 rounded-xl border border-dashed border-emerald-250 text-xs text-slate-650 space-y-3 py-6 animate-pulse mt-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Clock className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Dr. Advogado AI está consultando as jurisprudências em tempo real...</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                        <div className="h-3 bg-slate-200 rounded w-10/12"></div>
                        <div className="h-3 bg-slate-200 rounded w-8/12"></div>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-right">
                    Última atualização: {c.updatedDate}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}