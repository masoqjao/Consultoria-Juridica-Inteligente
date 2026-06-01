import React from 'react';
import { Settings, LegalArea, ChatMessage, LegalCase, Consultation } from '../types';
import { ShieldAlert, UserCheck, Scale, Globe, BellRing, Database, Save, CheckCircle2, Cpu } from 'lucide-react';

interface SettingsPageProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
  setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral',       label: 'Geral (Todos os Temas)'                             },
  { value: 'trabalhista', label: 'Trabalhista (Rescisões, CLT, Direitos)'              },
  { value: 'civil',       label: 'Civil e de Família (Casamento, Divórcio, Herança)'  },
  { value: 'penal',       label: 'Criminal / Penal (Inquéritos, Ampla Defesa)'        },
  { value: 'tributario',  label: 'Tributário / Fiscal (Receita Federal, Alíquotas)'   },
  { value: 'empresarial', label: 'Empresarial / Startups (INPI, Contratos de Sócios)' },
];

const inputCls = "input-dark w-full rounded-xl p-2.5 text-sm";
const labelCls = "flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

export default function SettingsPage({ settings, setSettings, setChatHistory, setCases, setConsultations }: SettingsPageProps) {

  const [tempName, setTempName] = React.useState(settings.activeLawyerName);
  const [tempSpec, setTempSpec] = React.useState<LegalArea>(settings.lawyerSpec);
  const [tempAuto, setTempAuto] = React.useState(settings.autoAnalysis);
  const [tempLang, setTempLang] = React.useState<'pt-BR' | 'en'>(settings.language);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({ activeLawyerName: tempName.trim() || 'Dr. Advogado', lawyerSpec: tempSpec, autoAnalysis: tempAuto, language: tempLang });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const resetAllData = () => {
    if (window.confirm("ATENÇÃO: Isso irá apagar todos os processos, conversas e agendamentos. Irreversível. Deseja continuar?")) {
      setChatHistory([]); setCases([]); setConsultations([]);
      localStorage.removeItem('law_app_chat');
      localStorage.removeItem('law_app_cases');
      localStorage.removeItem('law_app_meetings');
      alert("Todos os dados armazenados localmente foram limpos com sucesso.");
    }
  };

  return (
    <div id="settings-tab" className="space-y-6 max-w-3xl mx-auto animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Configurações</h2>
        <p className="text-xs text-slate-400 mt-0.5">Personalize o comportamento do seu assistente jurídico.</p>
      </div>

      {/* Success toast */}
      {savedSuccess && (
        <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Configurações Atualizadas!</span>
            <span className="text-emerald-400/70">As preferências do assistente foram salvas com sucesso.</span>
          </div>
        </div>
      )}

      {/* Main settings card */}
      <form onSubmit={handleSaveSettings} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Scale className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Perfil e Especialidade da IA</h3>
            <p className="text-[11px] text-slate-400">Dimensione o escopo e o nome adotado pelo consultor.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Nome do Consultor Jurídico
              </label>
              <input value={tempName} onChange={(e) => setTempName(e.target.value)} maxLength={30}
                className={inputCls} placeholder="Ex: Dr. Advogado" />
              <span className="text-[10px] text-slate-500 mt-1 block">Nome que aparecerá no chat e na barra lateral.</span>
            </div>
            <div>
              <label className={labelCls}>
                <Globe className="w-4 h-4 text-emerald-400" />
                Especialidade da IA
              </label>
              <select value={tempSpec} onChange={(e) => setTempSpec(e.target.value as LegalArea)} className={inputCls + " cursor-pointer"}>
                {AREAS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">Instrui a IA a priorizar esta área legal.</span>
            </div>
          </div>

          {/* Interface behavior */}
          <div className="pt-5 border-t border-slate-700 space-y-5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-400" /> Comportamento da Interface
            </h4>

            {/* Toggle */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={tempAuto} onChange={(e) => setTempAuto(e.target.checked)} className="sr-only peer" />
                <div onClick={() => setTempAuto(!tempAuto)}
                  className={`w-10 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer relative ${
                    tempAuto ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-600 group-hover:border-slate-500'
                  }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${tempAuto ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-100 text-xs block mb-1">Backup Local Automático</span>
                <span className="text-[11px] text-slate-400 leading-relaxed">Mantém alterações e histórico persistidos de forma segura no cache local do navegador.</span>
              </div>
            </label>

            {/* Language */}
            <div>
              <label className={labelCls}>Idioma das Respostas</label>
              <div className="flex gap-2">
                {[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setTempLang(value as 'pt-BR' | 'en')}
                    className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                      tempLang === value
                        ? 'bg-emerald-900/50 border-emerald-700 text-emerald-300'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI model info */}
          <div className="pt-5 border-t border-slate-700">
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shrink-0">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 mb-1">Modelo de IA Ativo</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O sistema utiliza o <span className="text-emerald-400 font-semibold">Gemini 2.5 Flash</span> com fallback automático para o Gemini 2.0 Flash em alta demanda. Retry automático de até 2 tentativas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end">
          <button type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
            <Save className="w-4 h-4" /> Salvar Preferências
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-red-950/30 border border-red-800/60 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 border border-red-700 rounded-xl">
            <Database className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-300">Zona Crítica · Manutenção de Dados</h4>
            <p className="text-[11px] text-slate-500">Ação irreversível</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para reiniciar a plataforma ou apagar vestígios de testes em computadores públicos, utilize o comando abaixo. Remove todos os processos, chats e agendamentos do cache local.
        </p>
        <button type="button" onClick={resetAllData}
          className="bg-red-700 hover:bg-red-600 text-white border border-red-600 text-xs font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-4 h-4 shrink-0" /> Limpar Todo Armazenamento Local
        </button>
      </div>

    </div>
  );
}