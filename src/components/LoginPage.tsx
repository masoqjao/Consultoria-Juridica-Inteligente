import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Scale, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mensagens de Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Fluxo de Cadastro
        const { error, data } = await signUp(email, password);
        if (error) {
          throw error;
        }

        // Caso o usuário precise confirmar e-mail
        if (data?.user && data.session === null) {
          setSuccessMsg(
            'Conta criada com sucesso! Por favor, verifique seu e-mail para confirmar o cadastro antes de acessar.'
          );
        } else {
          setSuccessMsg('Conta criada e autenticada com sucesso!');
        }
        
        // Limpar inputs de senha após cadastro
        setPassword('');
      } else {
        // Fluxo de Login
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }
      }
    } catch (err: any) {
      console.error(err);
      
      // Tradução amigável de erros comuns do Supabase Auth
      let friendlyMessage = 'Ocorreu um erro ao processar sua solicitação.';
      const message = err.message || '';

      if (message.includes('Invalid login credentials')) {
        friendlyMessage = 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
      } else if (message.includes('User already registered')) {
        friendlyMessage = 'Este e-mail já está cadastrado. Tente acessar a conta no menu "Entrar".';
      } else if (message.includes('Password should be at least 6 characters')) {
        friendlyMessage = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (message.includes('Email format is invalid')) {
        friendlyMessage = 'Por favor, insira um endereço de e-mail válido.';
      } else {
        friendlyMessage = message;
      }
      
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-300 font-sans">
      
      {/* Círculos decorativos de glow no fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-emerald-600/5 blur-3xl pointer-events-none z-0"></div>

      {/* Container Principal com Glassmorphism Premium */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl shadow-black/50 overflow-hidden relative z-10 transition-all duration-300 animate-fade-in">
        
        {/* Detalhe decorativo no topo do card */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
        
        {/* Cabeçalho do Card */}
        <div className="p-8 pb-4 text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/20 transition-transform duration-500 hover:rotate-6">
            <Scale className="w-7 h-7" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-300">
              Consultoria Jurídica
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Seu assistente legal inteligente de elite</p>
          </div>
        </div>

        {/* Abas Alternadoras de Ação (Segment Pill Style) */}
        <div className="px-8 pb-4">
          <div className="flex p-1 bg-slate-950/60 border border-slate-800/60 rounded-2xl select-none">
            <button
              onClick={() => toggleTab(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                !isSignUp
                  ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-700/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </button>
            
            <button
              onClick={() => toggleTab(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                isSignUp
                  ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-700/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Criar Conta
            </button>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="px-8 pb-8 space-y-5">
          
          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-200 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <span className="font-bold block text-red-400">Falha no processamento</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-250 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <span className="font-bold block text-emerald-350">Sucesso absoluto</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 transition-colors duration-200" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: seu-nome@empresa.com"
                  className="w-full bg-slate-950/40 border border-slate-800/80 focus:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-300"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500 transition-colors duration-200" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Escolha uma senha robusta" : "Digite sua senha secreta"}
                  className="w-full bg-slate-950/40 border border-slate-800/80 focus:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-300"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                loading || !email.trim() || !password.trim()
                  ? 'bg-slate-850 text-slate-500 cursor-not-allowed shadow-none border border-slate-800/60'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white active:scale-98 shadow-emerald-950/40 hover:shadow-xl hover:shadow-emerald-500/10'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4.5 h-4.5" /> : <LogIn className="w-4.5 h-4.5" />}
                  <span>{isSignUp ? 'Criar Minha Conta' : 'Acessar o Painel'}</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Rodapé Informativo */}
        <div className="bg-slate-950/40 p-5 border-t border-slate-900/60 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
            Painel Administrativo Protegido
          </p>
        </div>

      </div>

    </div>
  );
}
