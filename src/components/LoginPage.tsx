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
    <>
      {/* 
        This style block fixes the ugly white browser autofill 
        by overriding the internal shadow and text color.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover, 
        .login-input:-webkit-autofill:focus, 
        .login-input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #06150c inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white !important;
            border-color: rgba(255,255,255,0.1) !important;
        }
      `}} />

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #05100a 0%, #0a1a10 40%, #061208 100%)',
          fontFamily: '"Inter", system-ui, sans-serif'
        }}
      >
        {/* Atmospheric glow orbs */}
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: '-10%',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Main Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            position: 'relative',
            zIndex: 10,
            background: 'rgba(17, 27, 20, 0.92)',
            border: '1px solid rgba(16,185,129,0.18)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Top accent line */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)', width: '100%' }} />

          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Logo and Title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ 
                width: '68px', height: '68px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', 
                boxShadow: '0 0 30px rgba(16,185,129,0.25)' 
              }}>
                <Scale size={32} color="#10B981" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>Consultoria Jurídica</h1>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>Inteligente</h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0 0' }}>Seu assistente legal inteligente de elite</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '4px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => toggleTab(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none',
                  transition: 'all 0.3s',
                  background: !isSignUp ? '#10B981' : 'transparent',
                  color: !isSignUp ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: !isSignUp ? '0 4px 15px rgba(16,185,129,0.35)' : 'none'
                }}
              >
                <LogIn size={16} /> Entrar
              </button>
              <button
                onClick={() => toggleTab(true)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none',
                  transition: 'all 0.3s',
                  background: isSignUp ? '#10B981' : 'transparent',
                  color: isSignUp ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: isSignUp ? '0 4px 15px rgba(16,185,129,0.35)' : 'none'
                }}
              >
                <UserPlus size={16} /> Criar Conta
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, display: 'block', color: '#f87171', marginBottom: '4px' }}>Falha no acesso</span>
                  {errorMsg}
                </div>
              </div>
            )}
            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#6ee7b7', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, display: 'block', color: '#34D399', marginBottom: '4px' }}>Sucesso!</span>
                  {successMsg}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.45)' }}>
                  Endereço de E-mail
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <Mail size={18} color="rgba(255,255,255,0.4)" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className="login-input"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      padding: '14px 16px 14px 46px',
                      fontSize: '14px', color: '#fff',
                      outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.45)' }}>
                  Senha de Acesso
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <Lock size={18} color="rgba(255,255,255,0.4)" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Mínimo 6 caracteres' : '••••••••'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    className="login-input"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      padding: '14px 46px 14px 46px',
                      fontSize: '14px', color: '#fff',
                      outline: 'none', transition: 'all 0.2s',
                      letterSpacing: !showPassword && password ? '2px' : 'normal'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                style={{
                  width: '100%', padding: '16px', marginTop: '12px',
                  borderRadius: '14px',
                  background: (loading || !email.trim() || !password.trim())
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #059669, #10B981)',
                  color: (loading || !email.trim() || !password.trim()) ? 'rgba(255,255,255,0.25)' : '#fff',
                  border: 'none', cursor: (loading || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: (loading || !email.trim() || !password.trim()) ? 'none' : '0 8px 25px rgba(16,185,129,0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', height: '18px', width: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Autenticando...
                  </>
                ) : (
                  <>
                    {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                    {isSignUp ? 'Criar Minha Conta' : 'Acessar o Painel'}
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
              <ShieldCheck size={18} color="rgba(16,185,129,0.6)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Painel Administrativo Protegido
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '2px 0 0 0' }}>
                  Seus dados estão protegidos com segurança empresarial.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
