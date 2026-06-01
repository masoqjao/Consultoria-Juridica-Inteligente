import React from 'react';
import { Settings, LegalArea, ChatMessage, LegalCase, Consultation } from '../types';
import { ShieldAlert, UserCheck, Scale, Globe, Database, Save, CheckCircle2, Cpu } from 'lucide-react';

interface SettingsPageProps {
  settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
  setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral (Todos os Temas)' },
  { value: 'trabalhista', label: 'Trabalhista (CLT e Rescisões)' },
  { value: 'civil', label: 'Civil e de Família' },
  { value: 'penal', label: 'Criminal / Penal' },
  { value: 'tributario', label: 'Tributário / Fiscal' },
  { value: 'empresarial', label: 'Empresarial / Startups' },
];

const INP = "w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all";
const LBL = "flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mb-1.5";

export default function SettingsPage({ settings, setSettings, setChatHistory, setCases, setConsultations }: SettingsPageProps) {
  const [name, setName]       = React.useState(settings.activeLawyerName);
  const [spec, setSpec]       = React.useState<LegalArea>(settings.lawyerSpec);
  const [auto, setAuto]       = React.useState(settings.autoAnalysis);
  const [lang, setLang]       = React.useState<'pt-BR' | 'en'>(settings.language);
  const [saved, setSaved]     = React.useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({ activeLawyerName: name.trim() || 'Dr. Advogado', lawyerSpec: spec, autoAnalysis: auto, language: lang });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const resetData = () => {
    if (window.confirm('ATENÇÃO: Isso irá apagar todos os processos, conversas e agendamentos. Irreversível. Continuar?')) {
      setChatHistory([]); setCases([]); setConsultations([]);
      localStorage.removeItem('law_app_chat'); localStorage.removeItem('law_app_cases'); localStorage.removeItem('law_app_meetings');
      alert('Dados locais limpos com sucesso.');
    }
  };

  return (
    <div id="settings-tab" className="space-y-5 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Configurações</h2>
        <p className="text-xs text-gray-500 mt-0.5">Personalize o comportamento do seu assistente jurídico.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="text-xs font-semibold">Configurações salvas com sucesso!</div>
        </div>
      )}

      <form onSubmit={save} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Perfil e Especialidade da IA</h3>
            <p className="text-xs text-gray-500">Defina o escopo e o nome do consultor.</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LBL}><UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Nome do Consultor</label>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className={INP} placeholder="Ex: Dr. Advogado" />
              <p className="text-[11px] text-gray-400 mt-1">Nome exibido no chat e na barra lateral.</p>
            </div>
            <div>
              <label className={LBL}><Globe className="w-3.5 h-3.5 text-emerald-500" /> Especialidade da IA</label>
              <select value={spec} onChange={(e) => setSpec(e.target.value as LegalArea)} className={INP + " cursor-pointer"}>
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Instrui a IA a priorizar esta área.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Preferências de Interface</h4>

            {/* Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative shrink-0" onClick={() => setAuto(!auto)}>
                <div className={`w-10 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer ${auto ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-200 border-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${auto ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800 block">Backup Local Automático</span>
                <span className="text-xs text-gray-500">Salva alterações e histórico no cache local do navegador.</span>
              </div>
            </label>

            {/* Language */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-2">Idioma das Respostas</label>
              <div className="flex gap-2">
                {[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setLang(value as 'pt-BR' | 'en')}
                    className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${lang === value ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 mb-0.5">Modelo de IA Ativo</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Usando <span className="text-emerald-600 font-semibold">Gemini 2.5 Flash</span> com fallback para Gemini 2.0 Flash em alta demanda. Retry automático até 2 tentativas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100">
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center">
            <Database className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-800">Zona Crítica · Dados Locais</h4>
            <p className="text-xs text-red-600">Ação irreversível</p>
          </div>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">
          Remove permanentemente todos os processos, histórico de chat e agendamentos salvos no cache local do navegador.
        </p>
        <button type="button" onClick={resetData}
          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-red-200">
          <ShieldAlert className="w-4 h-4 shrink-0" /> Limpar Todos os Dados Locais
        </button>
      </div>
    </div>
  );
}