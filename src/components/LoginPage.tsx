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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-emerald-250 selection:text-emerald-900 font-sans">
      
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in/95">
        
        {/* Banner de Cabeçalho Visual */}
        <div className="bg-emerald-600 p-6 text-white text-center space-y-2 relative overflow-hidden">
          {/* Efeitos de Fundo Decorativos */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-700 rounded-full blur-xl opacity-40 -ml-8 -mb-8"></div>
          
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mx-auto shadow-sm animate-pulse relative z-10">
            <Scale className="w-6 h-6" />
          </div>
          
          <div className="space-y-1 relative z-10">
            <h2 className="text-xl font-extrabold tracking-tight">Consultoria Jurídica</h2>
            <p className="text-xs text-emerald-100 font-medium">Seu assistente legal inteligente de elite</p>
          </div>
        </div>

        {/* Abas Alternadoras de Ação */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 select-none">
          <button
            onClick={() => toggleTab(false)}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isSignUp
                ? 'border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Entrar
          </button>
          
          <button
            onClick={() => toggleTab(true)}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isSignUp
                ? 'border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Conta
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 shadow-xs animate-slide-down">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <span className="font-bold block">Falha no processamento</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl flex items-start gap-2.5 shadow-xs animate-slide-down">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <span className="font-bold block">Excelente</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo E-mail */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: seu-nome@empresa.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-sm transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Escolha uma senha robusta" : "Digite sua senha secreta"}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-sm transition-all"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading || !email.trim() || !password.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 shadow-emerald-500/10 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isSignUp ? 'Criar Minha Conta' : 'Acessar o Painel'}</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Rodapé Informativo */}
        <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Painel Administrativo Protegido
          </p>
        </div>

      </div>

    </div>
  );
}
