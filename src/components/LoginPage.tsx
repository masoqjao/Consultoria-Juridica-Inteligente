import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Scale, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
        const { error, data } = await signUp(email, password);
        if (error) throw error;
        if (data?.user && data.session === null) {
          setSuccessMsg('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de acessar.');
        } else {
          setSuccessMsg('Conta criada e autenticada com sucesso!');
        }
        setPassword('');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials'))      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      else if (msg.includes('User already registered'))   setErrorMsg('Este e-mail já está cadastrado. Acesse pelo menu "Entrar".');
      else if (msg.includes('Password should be at least')) setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      else if (msg.includes('Email format is invalid'))   setErrorMsg('Por favor, insira um e-mail válido.');
      else setErrorMsg(msg || 'Ocorreu um erro ao processar sua solicitação.');
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #05100a 0%, #0a1a10 40%, #061208 100%)' }}
    >
      {/* Atmospheric glow orbs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '20%', left: '-10%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card */}
      <div
        className="w-full max-w-sm relative z-10 animate-fade-in"
        style={{
          background: 'rgba(17, 27, 20, 0.92)',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: '24px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}
      >
        {/* Top accent line */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)', borderRadius: '24px 24px 0 0' }} />

        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', boxShadow: '0 0 30px rgba(16,185,129,0.25)' }}>
              <Scale className="w-7 h-7" style={{ color: '#10B981' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Consultoria Jurídica</h1>
              <p className="text-2xl font-black tracking-tight" style={{ color: '#10B981' }}>Inteligente</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Seu assistente legal inteligente de elite</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => toggleTab(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              style={!isSignUp
                ? { background: '#10B981', color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }
                : { color: 'rgba(255,255,255,0.4)' }}
            >
              <LogIn className="w-3.5 h-3.5" /> Entrar
            </button>
            <button
              onClick={() => toggleTab(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              style={isSignUp
                ? { background: '#10B981', color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }
                : { color: 'rgba(255,255,255,0.4)' }}
            >
              <UserPlus className="w-3.5 h-3.5" /> Criar Conta
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
              <div className="text-xs" style={{ color: '#fca5a5' }}>
                <span className="font-bold block mb-0.5" style={{ color: '#f87171' }}>Falha no acesso</span>
                {errorMsg}
              </div>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#10B981' }} />
              <div className="text-xs" style={{ color: '#6ee7b7' }}>
                <span className="font-bold block mb-0.5" style={{ color: '#34D399' }}>Sucesso!</span>
                {successMsg}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    paddingLeft: '44px', paddingRight: '16px',
                    paddingTop: '12px', paddingBottom: '12px',
                    fontSize: '14px', color: '#fff',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Mínimo 6 caracteres' : '••••••••'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    paddingLeft: '44px', paddingRight: '44px',
                    paddingTop: '12px', paddingBottom: '12px',
                    fontSize: '14px', color: '#fff',
                    outline: 'none'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '14px',
                background: (loading || !email.trim() || !password.trim())
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, #059669, #10B981)',
                color: (loading || !email.trim() || !password.trim()) ? 'rgba(255,255,255,0.25)' : '#fff',
                border: 'none', cursor: (loading || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: (loading || !email.trim() || !password.trim()) ? 'none' : '0 8px 25px rgba(16,185,129,0.4)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Autenticando...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isSignUp ? 'Criar Minha Conta' : 'Acessar o Painel'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'rgba(16,185,129,0.6)' }} />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Painel Administrativo Protegido</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Seus dados estão protegidos com segurança de nível empresarial.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
