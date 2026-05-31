import React, { useState } from 'react';
import { Calendar, Clock, FilePlus2, User, HelpCircle, CheckCircle, Trash2, Library, ClipboardList } from 'lucide-react';
import { Consultation, LegalArea } from '../types';

interface ConsultationsProps {
  consultations: Consultation[];
  setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'civil', label: 'Civil e Contratos' },
  { value: 'penal', label: 'Criminal / Penal' },
  { value: 'tributario', label: 'Tributário / Fiscal' },
  { value: 'empresarial', label: 'Empresarial / Startups' }
];

const RECOMMENDED_DOCUMENTS: Record<LegalArea, { docs: string[]; prep: string }> = {
  geral: {
    docs: ["Documento de Identidade com foto (RG / CNH)", "Comprovante de residência recente", "Contratos ou termos envolvidos diretamente no problema"],
    prep: "Anote uma cronologia básica de como os acontecimentos se desdobraram para recontar de forma eficiente ao advogado."
  },
  trabalhista: {
    docs: ["Carteira de Trabalho (CTPS física ou PDF digital)", "Termo de Rescisão de Contrato de Trabalho (TRCT)", "Holerites ou Recibos de Pagamento dos últimos 12 meses", "Extrato analítico do FGTS atualizado"],
    prep: "Reúna correspondências eletrônicas, mensagens de WhatsApp ou e-mails que comprovem horas extras, coação ou assédios alegados."
  },
  civil: {
    docs: ["Certidão de Nascimento, Casamento ou União Estável", "Documentos de propriedade caso envolva imóveis/automóveis (Escritura, CRLV)", "Contrato assinado objeto do questionamento", "Comprovante de rendas tributáveis para comprovar carência se pretender benefícios de justiça gratuita"],
    prep: "Escreva uma lista das pessoas que participaram ou presenciaram os acordos verbais envolvidos."
  },
  penal: {
    docs: ["Cópia completa do boletim de ocorrência (B.O.) se existente", "Intimações oficiais ou mandados judiciais entregues", "Acesso aos telefones ou mídias se contiverem gravações relevantes"],
    prep: "Lembre-se do direito fundamental de permanecer em silêncio antes de falar com seus patronos constituídos. Guarde todas as provas sem modificações físicas."
  },
  tributario: {
    docs: ["Contrato Social atualizado com as últimas resoluções CNPJ", "NOTAS fiscais, faturas e guias de recolhimento tributário (DARF, DAS)", "Notificações de Auto de Infração fiscal ou autos de lançamento da Receita Federal/Estadual", "Extrato simples nacional emitido do portal e-CAC"],
    prep: "Solicite um balancete simplificado preliminar de faturamento junto ao seu contador de confiança."
  },
  empresarial: {
    docs: ["Contrato Social Consolidado ou Estatuto Social com atos registrados", "Acordo de Acionistas vigente se cadastrado", "Contratos de prestação de serviços com fornecedores parceiros ou colaboradores", "Certificado de registro da marca INPI se possuir"],
    prep: "Organize em um sumário quais cláusulas contratuais ou operacionais estão causando atrito com sócios ou terceiros."
  }
};

export default function Consultations({ consultations, setConsultations }: ConsultationsProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activePrepArea, setActivePrepArea] = useState<LegalArea | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [area, setArea] = useState<LegalArea>('trabalhista');
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [issue, setIssue] = useState("");

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !date || !time || !issue) return;

    const newMeeting: Consultation = {
      id: Date.now().toString(),
      clientName,
      area,
      date,
      time,
      issue,
      status: 'scheduled'
    };

    setConsultations([newMeeting, ...consultations]);
    
    // reset form
    setClientName("");
    setArea('trabalhista');
    setDate("");
    setTime("");
    setIssue("");
    setShowScheduleForm(false);
  };

  const cancelConsultation = (id: string) => {
    if (window.confirm("Deseja realmente cancelar este agendamento?")) {
      setConsultations(prev => prev.map(m => {
        if (m.id === id) return { ...m, status: 'canceled' };
        return m;
      }));
    }
  };

  const completeConsultation = (id: string) => {
    setConsultations(prev => prev.map(m => {
      if (m.id === id) return { ...m, status: 'completed' };
      return m;
    }));
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Deseja expurgar permanentemente este registro do histórico?")) {
      setConsultations(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div id="consultations-tab" className="space-y-6 animate-fade-in">
      
      {/* Control Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Painel de Agendamentos</h3>
          <p className="text-xs text-slate-400">Gerencie e planeje as consultas de assessoria jurídica.</p>
        </div>

        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FilePlus2 className="w-4 h-4" />
          {showScheduleForm ? "Ver Minhas Consultas" : "Agendar Nova Consulta"}
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 ">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Marcar Nova Consulta / Orientação
          </h4>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome do Cliente Consultante</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg pl-9 pr-4 py-2 text-sm"
                    placeholder="Ex: João da Silva Santos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider mb-1">Especialidade Conselheira</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as LegalArea)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm cursor-pointer"
                >
                  {AREAS.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data Desejada</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2 text-sm cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Horário Marcado</label>
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2 text-sm cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sumário do Conflito / Objetivo</label>
              <textarea
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                placeholder="Descreva sobre o que pretende se aconselhar (ex: Cálculo de FGTS atrasado, partilha de inventário consensual, etc.)"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm cursor-pointer"
              >
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two Columns: Agendados log + Checklist Preparatória de documentação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled list column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-250/70 shadow-sm">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Minhas Sessões</h4>
            
            {consultations.length === 0 ? (
              <div className="text-center p-8 text-slate-400">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-semibold">Nenhuma consulta agendada ou registrada.</p>
                <p className="text-[10px] text-slate-400 mt-1">Utilize o botão acima para programar e se preparar.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {consultations.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 md:max-w-[70%]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{item.clientName}</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-bold capitalize">
                            {AREAS.find(a => a.value === item.area)?.label || 'Geral'}
                          </span>
                          
                          {item.status === 'scheduled' && (
                            <span className="text-[9px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">Agendada</span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-[9px] text-emerald-800 bg-emerald-105 px-2 py-0.5 rounded-full font-semibold">Concluída</span>
                          )}
                          {item.status === 'canceled' && (
                            <span className="text-[9px] text-red-800 bg-red-100 px-2 py-0.5 rounded-full font-semibold">Cancelada</span>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-600 leading-normal font-sans"><span className="font-medium text-slate-800">Assunto:</span> {item.issue}</p>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono font-medium pt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(item.date).toLocaleDateString('pt-BR')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}</span>
                        </div>
                      </div>

                      {/* Action buttons on rows */}
                      <div className="flex items-center gap-1.5 justify-end w-full md:w-auto mt-2 md:mt-0 pt-2 border-t border-slate-150 md:border-t-0 md:pt-0 shrink-0">
                        {item.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => completeConsultation(item.id)}
                              className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => cancelConsultation(item.id)}
                              className="text-[10px] font-bold hover:bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteRecord(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          title="Excluir do Histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActivePrepArea(item.area)}
                          className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                          title="Ver Guia de Documentos"
                        >
                          <Library className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Ver Checklist
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic AI checklist helper panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs leading-relaxed space-y-4">
            <h4 className="font-bold text-slate-900 border-b border-indigo-50 pb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Preparatório do Cliente (AI Advise)
            </h4>

            <div>
              <p className="text-slate-500 mb-2">Selecione uma especialidade abaixo para conferir a documentação legal indispensável exigida por juizados brasileiros:</p>
              
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {AREAS.map(ar => (
                  <button
                    key={ar.value}
                    onClick={() => setActivePrepArea(ar.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider transition-colors cursor-pointer ${
                      activePrepArea === ar.value 
                        ? 'bg-emerald-600 text-white border border-emerald-700' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {activePrepArea ? (
              <div className="space-y-3.5 animate-slide-down">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="font-extrabold uppercase text-[9px] text-emerald-700 block mb-1">Documentos Obrigatórios:</span>
                  <ul className="list-disc ml-4 space-y-1 text-[11px] text-slate-600">
                    {RECOMMENDED_DOCUMENTS[activePrepArea].docs.map((doc, dIdx) => (
                      <li key={dIdx}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/20 p-3.5 rounded-lg border border-emerald-100">
                  <span className="font-extrabold uppercase text-[9px] text-emerald-800 flex items-center gap-1 mb-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Directivas do Dr. Advogado:
                  </span>
                  <p className="text-[11px] text-slate-600 italic leading-relaxed">
                    {RECOMMENDED_DOCUMENTS[activePrepArea].prep}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-xl text-slate-400 text-[11px]">
                Escolha uma das abas acima para revelar o guia preliminar automático de papéis e provas recomendadas pela inteligência para agilizar sua assessoria.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}