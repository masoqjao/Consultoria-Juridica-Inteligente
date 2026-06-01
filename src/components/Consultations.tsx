import React, { useState } from 'react';
import { Calendar, Clock, FilePlus2, User, HelpCircle, CheckCircle, Trash2, Library, ClipboardList, X } from 'lucide-react';
import { Consultation, LegalArea } from '../types';

interface ConsultationsProps {
  consultations: Consultation[];
  setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral',       label: 'Geral'                  },
  { value: 'trabalhista', label: 'Trabalhista'             },
  { value: 'civil',       label: 'Civil e Contratos'      },
  { value: 'penal',       label: 'Criminal / Penal'       },
  { value: 'tributario',  label: 'Tributário / Fiscal'    },
  { value: 'empresarial', label: 'Empresarial / Startups' },
];

const RECOMMENDED_DOCUMENTS: Record<LegalArea, { docs: string[]; prep: string }> = {
  geral: {
    docs: ["Documento de Identidade com foto (RG / CNH)", "Comprovante de residência recente", "Contratos ou termos envolvidos diretamente no problema"],
    prep: "Anote uma cronologia básica de como os acontecimentos se desdobraram para recontar de forma eficiente ao advogado."
  },
  trabalhista: {
    docs: ["Carteira de Trabalho (CTPS física ou PDF digital)", "Termo de Rescisão de Contrato de Trabalho (TRCT)", "Holerites ou Recibos de Pagamento dos últimos 12 meses", "Extrato analítico do FGTS atualizado"],
    prep: "Reúna correspondências eletrônicas ou e-mails que comprovem horas extras, coação ou assédios alegados."
  },
  civil: {
    docs: ["Certidão de Nascimento, Casamento ou União Estável", "Documentos de propriedade caso envolva imóveis/automóveis", "Contrato assinado objeto do questionamento", "Comprovante de rendas tributáveis"],
    prep: "Escreva uma lista das pessoas que participaram ou presenciaram os acordos verbais envolvidos."
  },
  penal: {
    docs: ["Cópia completa do boletim de ocorrência (B.O.) se existente", "Intimações oficiais ou mandados judiciais entregues", "Acesso aos telefones ou mídias com gravações relevantes"],
    prep: "Lembre-se do direito fundamental de permanecer em silêncio. Guarde todas as provas sem modificações."
  },
  tributario: {
    docs: ["Contrato Social atualizado com as últimas resoluções CNPJ", "Notas fiscais, faturas e guias de recolhimento (DARF, DAS)", "Notificações de Auto de Infração fiscal", "Extrato Simples Nacional do portal e-CAC"],
    prep: "Solicite um balancete simplificado preliminar de faturamento junto ao seu contador."
  },
  empresarial: {
    docs: ["Contrato Social Consolidado ou Estatuto Social com atos registrados", "Acordo de Acionistas vigente se cadastrado", "Contratos de prestação de serviços com fornecedores", "Certificado de registro da marca INPI se possuir"],
    prep: "Organize em um sumário quais cláusulas contratuais estão causando atrito com sócios ou terceiros."
  }
};

const inputCls = "input-dark w-full rounded-xl p-2.5 text-sm";
const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function Consultations({ consultations, setConsultations }: ConsultationsProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activePrepArea, setActivePrepArea] = useState<LegalArea | null>(null);
  const [clientName, setClientName] = useState("");
  const [area, setArea] = useState<LegalArea>('trabalhista');
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [issue, setIssue] = useState("");

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !date || !time || !issue) return;
    setConsultations([{ id: Date.now().toString(), clientName, area, date, time, issue, status: 'scheduled' }, ...consultations]);
    setClientName(""); setArea('trabalhista'); setDate(""); setTime(""); setIssue("");
    setShowScheduleForm(false);
  };

  const cancelConsultation = (id: string) => {
    if (window.confirm("Deseja realmente cancelar este agendamento?")) {
      setConsultations(prev => prev.map(m => m.id === id ? { ...m, status: 'canceled' } : m));
    }
  };
  const completeConsultation = (id: string) => {
    setConsultations(prev => prev.map(m => m.id === id ? { ...m, status: 'completed' } : m));
  };
  const deleteRecord = (id: string) => {
    if (window.confirm("Deseja expurgar permanentemente este registro?")) {
      setConsultations(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div id="consultations-tab" className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Painel de Consultas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie e planeje suas sessões de assessoria jurídica.</p>
        </div>
        <button onClick={() => setShowScheduleForm(!showScheduleForm)}
          className={`flex items-center gap-2 text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all ${
            showScheduleForm ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
          }`}>
          {showScheduleForm ? <X className="w-4 h-4" /> : <FilePlus2 className="w-4 h-4" />}
          {showScheduleForm ? 'Cancelar' : 'Agendar Nova Consulta'}
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl animate-slide-down">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Calendar className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Marcar Nova Consulta</h4>
              <p className="text-[11px] text-slate-400">Preencha os dados do agendamento</p>
            </div>
          </div>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required value={clientName} onChange={(e) => setClientName(e.target.value)}
                    className={inputCls + " pl-10"} placeholder="Ex: João da Silva Santos" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Especialidade</label>
                <select value={area} onChange={(e) => setArea(e.target.value as LegalArea)} className={inputCls + " cursor-pointer"}>
                  {AREAS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data Desejada</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls + " cursor-pointer"} />
              </div>
              <div>
                <label className={labelCls}>Horário</label>
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls + " cursor-pointer"} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Sumário do Conflito / Objetivo</label>
              <textarea required value={issue} onChange={(e) => setIssue(e.target.value)} rows={3}
                className={inputCls + " resize-none"} placeholder="Descreva sobre o que pretende se aconselhar..." />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={() => setShowScheduleForm(false)}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">
                Cancelar
              </button>
              <button type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all">
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-widest">Minhas Sessões</h4>
              <span className="ml-auto text-[10px] font-mono text-slate-500">{consultations.length} registro{consultations.length !== 1 ? 's' : ''}</span>
            </div>
            {consultations.length === 0 ? (
              <div className="text-center p-10">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">Nenhuma consulta agendada.</p>
                <p className="text-xs text-slate-500 mt-1">Use o botão acima para agendar sua primeira sessão.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {consultations.map((item) => {
                  const statusStyles: Record<string, string> = {
                    scheduled: 'bg-blue-900/50 text-blue-300 border-blue-700',
                    completed: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
                    canceled:  'bg-red-900/50 text-red-300 border-red-700',
                  };
                  const statusLabels: Record<string, string> = { scheduled: 'Agendada', completed: 'Concluída', canceled: 'Cancelada' };
                  return (
                    <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-700/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.clientName}</span>
                            <span className="text-[9px] bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded font-bold font-mono">
                              {AREAS.find(a => a.value === item.area)?.label || 'Geral'}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${statusStyles[item.status]}`}>
                              {statusLabels[item.status]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-normal">
                            <span className="font-semibold text-slate-200">Assunto:</span> {item.issue}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-0.5">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('pt-BR')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.status === 'scheduled' && (
                            <>
                              <button onClick={() => completeConsultation(item.id)}
                                className="text-[10px] font-bold bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Concluir
                              </button>
                              <button onClick={() => cancelConsultation(item.id)}
                                className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all">
                                Cancelar
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteRecord(item.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20" title="Excluir">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setActivePrepArea(item.area)}
                            className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer">
                            <Library className="w-3 h-3 text-emerald-400 shrink-0" /> Checklist
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Checklist sidebar */}
        <div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-widest">Guia de Documentos</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-slate-400">Selecione uma especialidade para ver os documentos necessários:</p>
              <div className="flex flex-wrap gap-1.5">
                {AREAS.map(ar => (
                  <button key={ar.value} onClick={() => setActivePrepArea(ar.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                      activePrepArea === ar.value
                        ? 'bg-emerald-600 text-white border border-emerald-500'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                    }`}>
                    {ar.label}
                  </button>
                ))}
              </div>
              {activePrepArea ? (
                <div className="space-y-3 animate-slide-down">
                  <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                    <span className="font-extrabold uppercase text-[9px] text-emerald-400 block mb-2 tracking-widest">Documentos Obrigatórios:</span>
                    <ul className="space-y-1.5">
                      {RECOMMENDED_DOCUMENTS[activePrepArea].docs.map((doc, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-emerald-900/30 border border-emerald-800/60 p-3 rounded-xl">
                    <span className="font-extrabold uppercase text-[9px] text-emerald-400 flex items-center gap-1 mb-1.5 tracking-widest">
                      <HelpCircle className="w-3.5 h-3.5" /> Orientação do Advogado:
                    </span>
                    <p className="text-[11px] text-slate-300 italic leading-relaxed">{RECOMMENDED_DOCUMENTS[activePrepArea].prep}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 bg-slate-700/30 rounded-xl text-slate-500 text-[11px] border border-dashed border-slate-600">
                  Escolha uma especialidade acima para revelar o guia de documentos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}