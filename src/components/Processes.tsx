import React, { useState } from 'react';
import { Gavel, FolderPlus, Search, Sparkles, FileText, ChevronDown, ChevronUp, Clock, Trash2, X } from 'lucide-react';
import { LegalCase, LegalArea, LiveCaseStatus } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface ProcessesProps { cases: LegalCase[]; setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>; }

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral' }, { value: 'trabalhista', label: 'Trabalhista (CLT)' },
  { value: 'civil', label: 'Civil e Contratos' }, { value: 'penal', label: 'Criminal / Penal' },
  { value: 'tributario', label: 'Tributário / Fiscal' }, { value: 'empresarial', label: 'Empresarial / Startups' },
];

const STATUS: Record<LiveCaseStatus, { badge: string; dot: string; label: string }> = {
  preliminary:    { badge: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400',   label: 'Petição Inicial'          },
  ongoing:        { badge: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500',   label: 'Em Andamento'             },
  suspended:      { badge: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500',  label: 'Suspenso / Recurso'       },
  'resolved-won': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500',label: 'Vitória / Resolvido'      },
  'resolved-lost':{ badge: 'bg-red-50 text-red-700 border-red-200',              dot: 'bg-red-500',    label: 'Improcedente / Encerrado' },
};

const INP = "w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all";
const LBL = "block text-[11px] font-semibold text-gray-600 mb-1.5";

export default function Processes({ cases, setCases }: ProcessesProps) {
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [visibleReport, setVisibleReport] = useState<string | null>(null);
  const [title, setTitle]           = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [category, setCategory]     = useState<LegalArea>('trabalhista');
  const [description, setDescription] = useState('');
  const [status, setStatus]         = useState<LiveCaseStatus>('preliminary');
  const [notes, setNotes]           = useState('');

  const addCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setCases([{ id: Date.now().toString(), title, caseNumber: caseNumber || 'A protocolar', category, description, status, clientNotes: notes, updatedDate: new Date().toLocaleDateString('pt-BR') }, ...cases]);
    setTitle(''); setCaseNumber(''); setCategory('trabalhista'); setDescription(''); setStatus('preliminary'); setNotes('');
    setShowForm(false);
  };

  const triggerAnalysis = async (e: React.MouseEvent, c: LegalCase) => {
    e.stopPropagation();
    if (analyzingId) return;
    setAnalyzingId(c.id);
    try {
      const r = await fetch('/api/legal-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseTitle: c.title, caseCategory: c.category, caseDescription: c.description, caseNumber: c.caseNumber })
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCases(prev => prev.map(x => x.id === c.id ? { ...x, aiAnalysis: d.analysis } : x));
      setVisibleReport(c.id);
    } catch { alert('Não foi possível gerar o parecer. Tente novamente.'); }
    finally { setAnalyzingId(null); }
  };

  const deleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remover este processo?')) { setCases(p => p.filter(c => c.id !== id)); if (visibleReport === id) setVisibleReport(null); }
  };

  const filtered = cases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="processes-tab" className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestão de Processos</h2>
          <p className="text-xs text-gray-500 mt-0.5">{cases.length} processo{cases.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            placeholder="Pesquisar processos..." />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm ${showForm ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-100'}`}>
          {showForm ? <X className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Cadastrar Processo'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-slide-down">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <Gavel className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Novo Processo Judicial</h3>
              <p className="text-xs text-gray-500">Preencha as informações do caso</p>
            </div>
          </div>
          <form onSubmit={addCase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={LBL}>Título / Reclamação</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className={INP} placeholder="Ex: Ação de Reconhecimento de Vínculo..." /></div>
              <div><label className={LBL}>Número do Processo</label>
                <input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} className={INP} placeholder="Ex: 5013098-45.2023.8.09.0051" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={LBL}>Área Jurídica</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as LegalArea)} className={INP + " cursor-pointer"}>
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
              <div><label className={LBL}>Fase Legal</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as LiveCaseStatus)} className={INP + " cursor-pointer"}>
                  <option value="preliminary">Petição Inicial</option>
                  <option value="ongoing">Em Julgamento</option>
                  <option value="suspended">Suspenso por Recurso</option>
                  <option value="resolved-won">Resolvido (Vitória)</option>
                  <option value="resolved-lost">Julgado Improcedente</option>
                </select></div>
            </div>
            <div><label className={LBL}>Descrição / Alegações</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={INP + " resize-none"} placeholder="Descreva detalhadamente o caso..." /></div>
            <div><label className={LBL}>Notas Internas</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={INP + " resize-none"} placeholder="Provas, testemunhas, prazos importantes..." /></div>
            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">Voltar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all shadow-sm shadow-emerald-100">Salvar Processo</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Gavel className="w-5 h-5 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-500 text-sm">{search ? 'Nenhum processo encontrado.' : 'Nenhum processo cadastrado.'}</p>
            <p className="text-xs text-gray-400 mt-1">{search ? 'Limpe a busca para ver todos.' : 'Clique em "Cadastrar Processo" para começar.'}</p>
          </div>
        ) : filtered.map((c) => {
          const st = STATUS[c.status];
          const area = AREAS.find(a => a.value === c.category)?.label || 'Geral';
          const isAnalyzing = analyzingId === c.id;
          const reportVisible = visibleReport === c.id;

          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
              <div className={`h-1 ${c.status === 'resolved-won' ? 'bg-emerald-500' : c.status === 'resolved-lost' ? 'bg-red-500' : c.status === 'ongoing' ? 'bg-blue-500' : c.status === 'suspended' ? 'bg-amber-500' : 'bg-gray-400'}`} />
              <div className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg">{area}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">{c.title}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">Nº {c.caseNumber}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => triggerAnalysis(e, c)} disabled={!!isAnalyzing}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${c.aiAnalysis ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                      <Sparkles className={`w-3.5 h-3.5 ${c.aiAnalysis ? 'text-emerald-500' : 'text-gray-400'} ${isAnalyzing ? 'animate-spin' : ''}`} />
                      {isAnalyzing ? 'Gerando...' : c.aiAnalysis ? 'Atualizar' : 'Parecer IA'}
                    </button>
                    <button onClick={(e) => deleteCase(c.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
                {c.clientNotes && (
                  <div className="bg-amber-50 border-l-2 border-amber-400 border border-amber-100 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">Notas Internas</span>
                    <span className="text-xs text-amber-800 italic">{c.clientNotes}</span>
                  </div>
                )}

                {c.aiAnalysis && (
                  <div className="border-t border-gray-100 pt-3">
                    <button onClick={() => setVisibleReport(reportVisible ? null : c.id)}
                      className="w-full flex items-center justify-between text-xs text-emerald-700 font-bold hover:text-emerald-800 transition-colors py-1 cursor-pointer">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Parecer Jurídico da IA</span>
                      {reportVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {reportVisible && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs leading-relaxed animate-slide-down">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                          <Sparkles className="w-3 h-3" /> Laudo Técnico Automatizado
                        </div>
                        <div id="ai-report-content" className="prose text-gray-700">
                          {c.aiAnalysis.split('\n').map((line, i) => {
                            const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            if (line.startsWith('* ') || line.startsWith('- '))
                              return <ul key={i} className="list-disc ml-4 my-1"><li dangerouslySetInnerHTML={{ __html: sanitizeHtml(html.substring(2)) }} /></ul>;
                            return <p key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} className="my-1.5" />;
                          })}
                        </div>
                        <p className="text-[9px] text-gray-400 border-t border-emerald-100 pt-2 mt-3 italic">Relatório informativo. Não substitui petição formal.</p>
                      </div>
                    )}
                  </div>
                )}
                {isAnalyzing && (
                  <div className="bg-emerald-50 border border-dashed border-emerald-300 p-4 rounded-xl animate-pulse">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-2">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Consultando jurisprudências em tempo real...
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-emerald-200/60 rounded-full w-10/12" />
                      <div className="h-2 bg-emerald-200/60 rounded-full w-8/12" />
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 text-right font-mono">Atualizado: {c.updatedDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}