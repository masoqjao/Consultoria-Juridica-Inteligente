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
  { value: 'geral',       label: 'Geral (Todos os Temas)' },
  { value: 'trabalhista', label: 'Trabalhista (Rescisões, CLT, Direitos)' },
  { value: 'civil',       label: 'Civil e de Família (Casamento, Divórcio, Herança)' },
  { value: 'penal',       label: 'Criminal / Penal (Inquéritos, Ampla Defesa)' },
  { value: 'tributario',  label: 'Tributário / Fiscal (Receita Federal, Alíquotas)' },
  { value: 'empresarial', label: 'Empresarial / Startups (INPI, Contratos de Sócios)' },
];

const inputCls = "w-full bg-[#070c18] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl p-2.5 text-sm text-slate-100 placeholder-slate-600 transition-all outline-none input-dark";
const labelCls = "flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5";

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
    if (window.confirm("ATENÇÃO: Isso irá apagar todos os processos, o histórico de conversas e os agendamentos salvos localmente. Esta ação é irreversível. Deseja continuar?")) {
      setChatHistory([]);
      setCases([]);
      setConsultations([]);
      localStorage.removeItem('law_app_chat');
      localStorage.removeItem('law_app_cases');
      localStorage.removeItem('law_app_meetings');
      alert("Todos os dados armazenados localmente foram limpos com sucesso.");
    }
  };

  return (
    <div id="settings-tab" className="space-y-6 max-w-3xl mx-auto animate-fade-in">

      {/* ─── Page header ─────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-white">Configurações</h2>
        <p className="text-xs text-slate-500 mt-0.5">Personalize o comportamento do seu assistente jurídico.</p>
      </div>

      {/* ─── Success Toast ──────────────────────── */}
      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-emerald-300">Configurações Atualizadas!</span>
            <span className="text-emerald-400/60">As preferências do assistente foram salvas com sucesso.</span>
          </div>
        </div>
      )}

      {/* ─── Main Settings Card ─────────────────── */}
      <form onSubmit={handleSaveSettings} className="bg-[#0d1424] border border-white/[0.05] rounded-2xl overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Scale className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Perfil e Especialidade da IA</h3>
            <p className="text-[11px] text-slate-500">Dimensione o escopo e o nome adotado pelo consultor.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Nome do Consultor Jurídico
              </label>
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={30}
                className={inputCls}
                placeholder="Ex: Dr. Advogado"
              />
              <span className="text-[10px] text-slate-700 mt-1 block">
                O nome que aparecerá no chat e no painel lateral.
              </span>
            </div>

            <div>
              <label className={labelCls}>
                <Globe className="w-4 h-4 text-emerald-500" />
                Especialidade da IA
              </label>
              <select
                value={tempSpec}
                onChange={(e) => setTempSpec(e.target.value as LegalArea)}
                className={inputCls + " cursor-pointer"}
              >
                {AREAS.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-700 mt-1 block">
                Instrui a IA a priorizar esta área legal nas respostas.
              </span>
            </div>
          </div>

          {/* Interface behavior section */}
          <div className="pt-5 border-t border-white/[0.05] space-y-5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-500" />
              Comportamento da Interface
            </h4>

            {/* Auto save toggle */}
            <label className="flex items-start gap-3.5 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={tempAuto}
                  onChange={(e) => setTempAuto(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-10 h-5.5 rounded-full border transition-all duration-200 ${
                  tempAuto
                    ? 'bg-emerald-500/80 border-emerald-500'
                    : 'bg-white/[0.04] border-white/[0.10] group-hover:border-white/20'
                }`}>
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    tempAuto ? 'left-[21px]' : 'left-0.5'
                  }`} />
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-200 text-xs block leading-none mb-1">Backup Local Automático</span>
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  Manter alterações e histórico persistidos de forma segura no cache local do navegador.
                </span>
              </div>
            </label>

            {/* Language selector */}
            <div>
              <label className={labelCls}>Idioma das Respostas</label>
              <div className="flex gap-2">
                {[
                  { value: 'pt-BR', label: 'Português (Brasil)' },
                  { value: 'en',    label: 'English'             },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTempLang(value as 'pt-BR' | 'en')}
                    className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                      tempLang === value
                        ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                        : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Model info */}
          <div className="pt-5 border-t border-white/[0.05]">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300 mb-1">Modelo de IA Ativo</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  O sistema utiliza o <span className="text-emerald-400 font-semibold">Gemini 2.5 Flash</span> com fallback automático para o Gemini 2.0 Flash em caso de alta demanda. Retry automático de até 2 tentativas com delay adaptativo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.05] flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>
      </form>

      {/* ─── Danger Zone ────────────────────────── */}
      <div className="bg-red-500/[0.04] border border-red-500/15 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <Database className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-300">Zona Crítica · Manutenção de Dados</h4>
            <p className="text-[11px] text-slate-600">Ação irreversível</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Para reiniciar a plataforma a partir do zero ou apagar vestígios de testes em computadores públicos, utilize o comando de limpeza abaixo. Isso removerá todos os processos, chats e agendamentos do cache local do navegador.
        </p>

        <button
          type="button"
          onClick={resetAllData}
          className="bg-red-600/80 hover:bg-red-600 text-white border border-red-500/30 text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Limpar Todo Armazenamento Local
        </button>
      </div>

    </div>
  );
}