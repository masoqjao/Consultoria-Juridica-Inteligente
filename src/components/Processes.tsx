import React, { useState } from 'react';
import { Gavel, FolderPlus, Search, Sparkles, FileText, ChevronDown, ChevronUp, Clock, Trash2, X } from 'lucide-react';
import { LegalCase, LegalArea, LiveCaseStatus } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface ProcessesProps {
  cases: LegalCase[];
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral',       label: 'Geral'                   },
  { value: 'trabalhista', label: 'Trabalhista (CLT)'       },
  { value: 'civil',       label: 'Civil e Contratos'       },
  { value: 'penal',       label: 'Criminal / Penal'        },
  { value: 'tributario',  label: 'Tributário / Fiscal'     },
  { value: 'empresarial', label: 'Empresarial / Startups'  },
];

const STATUS_CONFIGS: Record<LiveCaseStatus, { dot: string; badge: string; label: string }> = {
  preliminary:    { dot: 'bg-slate-400',   badge: 'bg-slate-500/15 text-slate-300 border-slate-500/20',           label: 'Petição Inicial'           },
  ongoing:        { dot: 'bg-blue-400',    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20',               label: 'Em Andamento'              },
  suspended:      { dot: 'bg-amber-400',   badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',            label: 'Recurso / Suspenso'        },
  'resolved-won': { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',      label: 'Vitória / Resolvido'       },
  'resolved-lost':{ dot: 'bg-red-400',     badge: 'bg-red-500/15 text-red-300 border-red-500/20',                  label: 'Improcedente / Encerrado'  },
};

// Form input class reuse
const inputCls = "w-full bg-[#070c18] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl p-2.5 text-sm text-slate-100 placeholder-slate-600 transition-all outline-none focus:ring-2 focus:ring-emerald-500/10 input-dark";
const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5";

export default function Processes({ cases, setCases }: ProcessesProps) {
  const [searchTerm, setSearchTerm]     = useState("");
  const [showAddForm, setShowAddForm]   = useState(false);
  const [analyzingCaseId, setAnalyzingCaseId] = useState<string | null>(null);

  // Form state
  const [title, setTitle]           = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [category, setCategory]     = useState<LegalArea>('trabalhista');
  const [description, setDescription] = useState("");
  const [status, setStatus]         = useState<LiveCaseStatus>('preliminary');
  const [clientNotes, setClientNotes] = useState("");

  // Accordion
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
    setTitle(""); setCaseNumber(""); setCategory('trabalhista');
    setDescription(""); setStatus('preliminary'); setClientNotes("");
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

      if (!resp.ok) throw new Error("Não foi possível gerar análise jurídica do processo.");

      const data = await resp.json();
      setCases(prev => prev.map(item =>
        item.id === cItem.id ? { ...item, aiAnalysis: data.analysis } : item
      ));
      setVisibleReportId(cItem.id);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um problema ao conectar com o serviço de parecer jurídico da IA.");
    } finally {
      setAnalyzingCaseId(null);
    }
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente remover este processo do seu painel?")) {
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

      {/* ─── Page header ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão de Processos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {cases.length} processo{cases.length !== 1 ? 's' : ''} cadastrado{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ─── Control bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1424] border border-white/[0.06] focus:border-emerald-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all input-dark"
            placeholder="Pesquisar por processo, número ou descrição..."
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all ${
            showAddForm
              ? 'bg-white/5 border border-white/[0.08] text-slate-400 hover:text-slate-200'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Cadastrar Processo'}
        </button>
      </div>

      {/* ─── Add Case Form ────────────────────────── */}
      {showAddForm && (
        <div className="bg-[#0d1424] border border-white/[0.06] p-6 rounded-2xl shadow-2xl shadow-black/20 animate-slide-down">
          {/* Form header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.05]">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Gavel className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Inserir Novo Processo Judicial</h3>
              <p className="text-[11px] text-slate-500">Preencha as informações principais do caso</p>
            </div>
          </div>

          <form onSubmit={handleAddCase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Título / Reclamação Principal</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  className={inputCls} placeholder="Ex: Ação de Reconhecimento de Vínculo Trabalhista" />
              </div>
              <div>
                <label className={labelCls}>Número do Processo (Opcional)</label>
                <input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)}
                  className={inputCls} placeholder="Ex: 5013098-45.2023.8.09.0051" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Área Jurídica</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as LegalArea)}
                  className={inputCls + " cursor-pointer"}>
                  {AREAS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fase Legal do Caso</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as LiveCaseStatus)}
                  className={inputCls + " cursor-pointer"}>
                  <option value="preliminary">Petição Inicial / Em Construção</option>
                  <option value="ongoing">Ajuizado / Em Julgamento</option>
                  <option value="suspended">Suspenso por Recurso</option>
                  <option value="resolved-won">Resolvido (Vitória)</option>
                  <option value="resolved-lost">Julgado Improcedente</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Alegações Fáticas (Descrição do Problema)</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} className={inputCls + " resize-none"}
                placeholder="Descreva detalhadamente o caso, datas, verbas devidas, valores..." />
            </div>

            <div>
              <label className={labelCls}>Anotações Internas (Opcional)</label>
              <textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)}
                rows={2} className={inputCls + " resize-none"}
                placeholder="Provas disponíveis, testemunhas, prazos importantes..." />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="bg-white/5 hover:bg-white/10 border border-white/[0.08] text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">
                Voltar
              </button>
              <button type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all">
                Salvar Processo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Cases List ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.length === 0 ? (
          <div className="bg-[#0d1424] border border-white/[0.05] rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <Gavel className="w-6 h-6 text-slate-700" />
            </div>
            <p className="font-semibold text-slate-400 mb-1">Nenhum processo localizado</p>
            <p className="text-xs text-slate-600 max-w-sm">
              {searchTerm
                ? 'Limpe o filtro de busca para visualizar os processos cadastrados.'
                : 'Cadastre seu primeiro processo usando o botão acima.'}
            </p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const isAnalyzing = analyzingCaseId === c.id;
            const isReportVisible = visibleReportId === c.id;
            const stateCfg = STATUS_CONFIGS[c.status];
            const areaLabel = AREAS.find(a => a.value === c.category)?.label || 'Geral';

            return (
              <div key={c.id} className="bg-[#0d1424] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-all duration-200 group">

                {/* Top accent by status */}
                <div className={`h-0.5 w-full ${
                  c.status === 'resolved-won' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  c.status === 'resolved-lost' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                  c.status === 'ongoing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  c.status === 'suspended' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-slate-600 to-slate-500'
                }`} />

                <div className="p-5 md:p-6 space-y-4">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-lg text-slate-400 font-mono tracking-wide">
                          {areaLabel}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${stateCfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stateCfg.dot}`} />
                          {stateCfg.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 leading-snug">{c.title}</h4>
                      <p className="text-[11px] text-slate-600 font-mono">Nº {c.caseNumber}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleTriggerAnalysis(e, c)}
                        disabled={isAnalyzing}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                          c.aiAnalysis
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${c.aiAnalysis ? 'text-emerald-400' : 'text-slate-500'} ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? 'Gerando...' : c.aiAnalysis ? 'Atualizar Parecer' : 'Parecer da IA'}
                      </button>

                      <button
                        onClick={(e) => handleDeleteCase(c.id, e)}
                        className="p-1.5 rounded-xl text-slate-700 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all"
                        title="Remover processo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Fatos / Relato do Caso</span>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{c.description}</p>
                    </div>

                    {c.clientNotes && (
                      <div className="bg-white/[0.02] p-3 rounded-xl border-l-2 border-emerald-500/30 border border-white/[0.04]">
                        <span className="font-bold text-slate-600 uppercase tracking-widest text-[9px] block mb-1">Notas Internas</span>
                        <span className="text-slate-500 text-xs italic">{c.clientNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* AI Report accordion */}
                  {c.aiAnalysis && (
                    <div className="border-t border-white/[0.05] pt-3">
                      <button
                        onClick={() => setVisibleReportId(isReportVisible ? null : c.id)}
                        className="w-full flex items-center justify-between text-xs text-emerald-400 font-bold hover:text-emerald-300 transition-colors py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 shrink-0" />
                          Estudo Consultivo da Inteligência Artificial
                        </span>
                        {isReportVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isReportVisible && (
                        <div className="mt-3 bg-emerald-500/[0.04] border border-emerald-500/15 p-5 rounded-2xl text-xs space-y-2 leading-relaxed animate-slide-down">
                          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            Laudo Técnico Automatizado
                          </div>
                          <div id="ai-report-content" className="prose-dark">
                            {c.aiAnalysis.split('\n').map((line, lIdx) => {
                              const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              if (line.startsWith('* ') || line.startsWith('- ')) {
                                return (
                                  <ul key={lIdx} className="list-disc ml-5 my-1">
                                    <li dangerouslySetInnerHTML={{ __html: sanitizeHtml(boldLine.substring(2)) }} />
                                  </ul>
                                );
                              }
                              return <p key={lIdx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(boldLine) }} className="my-1.5" />;
                            })}
                          </div>
                          <p className="text-[9px] text-slate-700 uppercase tracking-wide italic border-t border-white/[0.05] pt-3 mt-4">
                            Relatório consultivo gerado pela IA com base nas alegações fáticas fornecidas. Não substitui petição formal.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analyzing skeleton */}
                  {isAnalyzing && (
                    <div className="bg-emerald-500/[0.04] p-5 rounded-2xl border border-dashed border-emerald-500/20 space-y-3 mt-3 animate-pulse">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <Clock className="w-4 h-4 animate-spin" />
                        IA consultando jurisprudências em tempo real...
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 bg-white/[0.04] rounded-full w-11/12" />
                        <div className="h-2.5 bg-white/[0.04] rounded-full w-10/12" />
                        <div className="h-2.5 bg-white/[0.04] rounded-full w-8/12" />
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-700 text-right font-mono">
                    Atualizado em: {c.updatedDate}
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