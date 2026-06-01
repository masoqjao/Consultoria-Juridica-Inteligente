import React, { useState } from 'react';
import { Calendar, Clock, FilePlus2, User, HelpCircle, CheckCircle, Trash2, Library, ClipboardList, X } from 'lucide-react';
import { Consultation, LegalArea } from '../types';

interface ConsultationsProps { consultations: Consultation[]; setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>; }

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral' }, { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'civil', label: 'Civil e Contratos' }, { value: 'penal', label: 'Criminal / Penal' },
  { value: 'tributario', label: 'Tributário / Fiscal' }, { value: 'empresarial', label: 'Empresarial / Startups' },
];

const DOCS: Record<LegalArea, { docs: string[]; prep: string }> = {
  geral:       { docs: ['Documento de Identidade com foto (RG / CNH)', 'Comprovante de residência recente', 'Contratos ou termos envolvidos'], prep: 'Anote uma cronologia básica de como os acontecimentos se desdobraram.' },
  trabalhista: { docs: ['Carteira de Trabalho (CTPS)', 'Termo de Rescisão (TRCT)', 'Holerites dos últimos 12 meses', 'Extrato do FGTS'], prep: 'Reúna e-mails ou mensagens que comprovem horas extras, coação ou assédios.' },
  civil:       { docs: ['Certidão de Nascimento/Casamento', 'Documentos de propriedade de imóveis/automóveis', 'Contrato objeto do questionamento', 'Comprovante de rendas'], prep: 'Escreva uma lista de pessoas que presenciaram os acordos verbais envolvidos.' },
  penal:       { docs: ['Boletim de Ocorrência (B.O.) se existente', 'Intimações ou mandados judiciais', 'Gravações ou mídias relevantes'], prep: 'Lembre-se do direito de permanecer em silêncio. Preserve provas sem modificações.' },
  tributario:  { docs: ['Contrato Social atualizado', 'Notas fiscais e guias (DARF, DAS)', 'Notificações de Auto de Infração', 'Extrato do portal e-CAC'], prep: 'Solicite um balancete de faturamento junto ao seu contador.' },
  empresarial: { docs: ['Contrato Social Consolidado', 'Acordo de Acionistas vigente', 'Contratos de prestação de serviços', 'Certificado de marca INPI se possuir'], prep: 'Organize as cláusulas que causam atrito com sócios ou terceiros.' },
};

const INP = "w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all";
const LBL = "block text-[11px] font-semibold text-gray-600 mb-1.5";

export default function Consultations({ consultations, setConsultations }: ConsultationsProps) {
  const [showForm, setShowForm]       = useState(false);
  const [prepArea, setPrepArea]       = useState<LegalArea | null>(null);
  const [clientName, setClientName]   = useState('');
  const [area, setArea]               = useState<LegalArea>('trabalhista');
  const [date, setDate]               = useState('');
  const [time, setTime]               = useState('');
  const [issue, setIssue]             = useState('');

  const addConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !date || !time || !issue) return;
    setConsultations([{ id: Date.now().toString(), clientName, area, date, time, issue, status: 'scheduled' }, ...consultations]);
    setClientName(''); setArea('trabalhista'); setDate(''); setTime(''); setIssue('');
    setShowForm(false);
  };

  const cancel   = (id: string) => { if (window.confirm('Cancelar este agendamento?')) setConsultations(p => p.map(m => m.id === id ? { ...m, status: 'canceled' } : m)); };
  const complete = (id: string) => setConsultations(p => p.map(m => m.id === id ? { ...m, status: 'completed' } : m));
  const remove   = (id: string) => { if (window.confirm('Excluir este registro?')) setConsultations(p => p.filter(c => c.id !== id)); };

  return (
    <div id="consultations-tab" className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Painel de Consultas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gerencie suas sessões de assessoria jurídica.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm ${showForm ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-100'}`}>
          {showForm ? <X className="w-4 h-4" /> : <FilePlus2 className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Agendar Nova Consulta'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-slide-down">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Agendar Nova Consulta</h4>
              <p className="text-xs text-gray-500">Preencha os dados do cliente</p>
            </div>
          </div>
          <form onSubmit={addConsultation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={LBL}>Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className={INP + " pl-9"} placeholder="Ex: João da Silva Santos" />
                </div>
              </div>
              <div><label className={LBL}>Especialidade</label>
                <select value={area} onChange={(e) => setArea(e.target.value as LegalArea)} className={INP + " cursor-pointer"}>
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={LBL}>Data</label><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INP} /></div>
              <div><label className={LBL}>Horário</label><input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={INP} /></div>
            </div>
            <div><label className={LBL}>Assunto / Objetivo</label>
              <textarea required value={issue} onChange={(e) => setIssue(e.target.value)} rows={3} className={INP + " resize-none"} placeholder="Descreva sobre o que pretende se aconselhar..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">Cancelar</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer transition-all">Confirmar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sessions list */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-gray-900 text-sm">Minhas Sessões</h4>
            <span className="ml-auto text-xs text-gray-400">{consultations.length} registro{consultations.length !== 1 ? 's' : ''}</span>
          </div>
          {consultations.length === 0 ? (
            <div className="text-center p-10">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">Nenhuma consulta agendada.</p>
              <p className="text-xs text-gray-400 mt-1">Use o botão acima para agendar a primeira sessão.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {consultations.map((item) => {
                const ss: Record<string, string> = {
                  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
                  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  canceled:  'bg-red-50 text-red-700 border-red-200'
                };
                const sl: Record<string, string> = { scheduled: 'Agendada', completed: 'Concluída', canceled: 'Cancelada' };
                return (
                  <div key={item.id} className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{item.clientName}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded font-bold">{AREAS.find(a => a.value === item.area)?.label || 'Geral'}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${ss[item.status]}`}>{sl[item.status]}</span>
                        </div>
                        <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Assunto:</span> {item.issue}</p>
                        <div className="flex gap-4 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.status === 'scheduled' && (
                          <>
                            <button onClick={() => complete(item.id)} className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Concluir</button>
                            <button onClick={() => cancel(item.id)} className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg cursor-pointer">Cancelar</button>
                          </>
                        )}
                        <button onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setPrepArea(item.area)} className="text-[10px] font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"><Library className="w-3 h-3 text-emerald-500" /> Docs</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prep checklist */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-gray-900 text-sm">Guia de Documentos</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">Selecione a especialidade para ver os documentos necessários:</p>
            <div className="flex flex-wrap gap-1.5">
              {AREAS.map(a => (
                <button key={a.value} onClick={() => setPrepArea(a.value)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${prepArea === a.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                  {a.label}
                </button>
              ))}
            </div>
            {prepArea ? (
              <div className="space-y-3 animate-slide-down">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-2">Documentos:</span>
                  <ul className="space-y-1.5">
                    {DOCS[prepArea].docs.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />{doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="font-bold text-[10px] text-emerald-700 flex items-center gap-1 mb-1.5 uppercase tracking-widest">
                    <HelpCircle className="w-3.5 h-3.5" /> Orientação:
                  </span>
                  <p className="text-xs text-emerald-800 italic leading-relaxed">{DOCS[prepArea].prep}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-5 bg-gray-50 rounded-xl text-xs text-gray-400 border border-dashed border-gray-200">
                Selecione uma especialidade acima.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}