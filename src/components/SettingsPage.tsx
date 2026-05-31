import React from 'react';
import { Settings, LegalArea, ChatMessage, LegalCase, Consultation } from '../types';
import { ShieldAlert, UserCheck, Scale, Globe, BellRing, Database, Save, CheckCircle2 } from 'lucide-react';

interface SettingsPageProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
  setConsultations: React.Dispatch<React.SetStateAction<Consultation[]>>;
}

const AREAS: { value: LegalArea; label: string }[] = [
  { value: 'geral', label: 'Geral (Todos os Temas)' },
  { value: 'trabalhista', label: 'Trabalhista (Recisões, CLT, Direitos)' },
  { value: 'civil', label: 'Civil e de Família (Casamento, Divórcio, Herança)' },
  { value: 'penal', label: 'Criminal / Penal (Inquéritos, Ampla Defesa)' },
  { value: 'tributario', label: 'Tributário / Fiscal (Receita Federal, Alíquotas)' },
  { value: 'empresarial', label: 'Empresarial / Startups (INPI, Contratos de Sócios)' }
];

export default function SettingsPage({ 
  settings, 
  setSettings, 
  setChatHistory, 
  setCases, 
  setConsultations 
}: SettingsPageProps) {
  
  const [tempName, setTempName] = React.useState(settings.activeLawyerName);
  const [tempSpec, setTempSpec] = React.useState<LegalArea>(settings.lawyerSpec);
  const [tempAuto, setTempAuto] = React.useState(settings.autoAnalysis);
  const [tempLang, setTempLang] = React.useState<'pt-BR' | 'en'>(settings.language);

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      activeLawyerName: tempName.trim() || 'Dr. Advogado',
      lawyerSpec: tempSpec,
      autoAnalysis: tempAuto,
      language: tempLang
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const resetAllData = () => {
    if (window.confirm("ATENÇÃO: Isso irá apagar todos os processos cadastrados, o histórico de conversas do chat e os agendamentos salvos localmente. Esta ação é irreversível. Deseja continuar?")) {
      setChatHistory([]);
      setCases([]);
      setConsultations([]);
      localStorage.removeItem('law_app_chat');
      localStorage.removeItem('law_app_cases');
      localStorage.removeItem('law_app_meetings');
      alert("Todos os dados armazenados localmente foram limpos com sucesso. O sistema foi redefinido.");
    }
  };

  return (
    <div id="settings-tab" className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      
      {/* Toast Saved Alert */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-md animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Configurações Atualizadas!</span>
            <span>As preferências do seu assistente de inteligência jurídica foram redefinidas e guardadas com sucesso.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header of settings bar */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Diretrizes da IA e Perfil de Especialidade</h3>
            <p className="text-[11px] text-slate-400">Dimensione o escopo e o apelido adotado pelo robô consultor.</p>
          </div>
        </div>

        {/* Settings Body Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Nome do Consultor Jurídico
              </label>
              <input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={30}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm"
                placeholder="Ex: Dr. Advogado"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">O nome que aparecerá no chat e no painel consultor da lateral.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                Doutrina e Especialidade da IA
              </label>
              <select
                value={tempSpec}
                onChange={(e) => setTempSpec(e.target.value as LegalArea)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-lg p-2.5 text-sm cursor-pointer"
              >
                {AREAS.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Instrui a IA a priorizar esta especialidade legal nas respostas padrão.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-600" /> Comportamento da Interface
            </h4>

            <div className="space-y-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={tempAuto}
                  onChange={(e) => setTempAuto(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-850 block">Backup Local Automático</span>
                  <span className="text-slate-400">Manter alterações e histórico persistidos de forma segura no cache local do navegador.</span>
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-755 uppercase tracking-wider mb-1.5">Idioma das Respostas</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTempLang('pt-BR')}
                      className={`flex-grow text-xs font-bold py-2 px-3 rounded-lg border transition-all cursor-pointer ${
                        tempLang === 'pt-BR' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Português (Brasil)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempLang('en')}
                      className={`flex-grow text-xs font-bold py-2 px-3 rounded-lg border transition-all cursor-pointer ${
                        tempLang === 'en' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer save block */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>

      </form>

      {/* Dangerous/Database reset area */}
      <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-red-800 font-bold text-sm flex items-center gap-1.5">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          Zona Crítica: Manutenção de Dados
        </h4>
        <p className="text-slate-600 text-xs leading-relaxed">
          Para reiniciar a plataforma de consultoria jurídica inteligente a partir do zero ou apagar vestígios de testes em computadores públicos, utilize o comando de limpeza abaixo. Isso liberará o cache de processos salvos e do histórico operacional.
        </p>
        <div>
          <button 
            type="button"
            onClick={resetAllData}
            className="bg-red-650 hover:bg-red-700 text-white border border-red-200 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Limpar Todo Armazenamento Local
          </button>
        </div>
      </div>

    </div>
  );
}