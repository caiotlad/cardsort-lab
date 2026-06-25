import { useState } from 'react';
import { LayoutGrid, Mail, Lock, User, Eye, EyeOff, ChevronRight, ShieldCheck } from 'lucide-react';

export type UserRole = 'admin' | 'student';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onParticipantCode: (code: string) => void;
}

type Tab = 'login' | 'register';

export function LoginView({ onLogin, onRegister, onParticipantCode }: LoginViewProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participantCode, setParticipantCode] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setLoading(true);
    try {
      await onLogin(loginForm.email, loginForm.password);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) { setRegisterError('Nome completo é obrigatório.'); return; }
    if (!registerForm.email.includes('@')) { setRegisterError('Informe um e-mail válido.'); return; }
    if (registerForm.password.length < 8) { setRegisterError('A senha deve ter ao menos 8 caracteres.'); return; }
    if (registerForm.password !== registerForm.confirmPassword) { setRegisterError('As senhas não coincidem.'); return; }
    setRegisterError('');
    setLoading(true);
    try {
      await onRegister(registerForm.name.trim(), registerForm.email, registerForm.password);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: '#0d1117',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', padding: 24, boxSizing: 'border-box',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, background: '#5a7cf8', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LayoutGrid size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#e2e8f0', letterSpacing: '0.04em' }}>
          CardSort<span style={{ color: '#5a7cf8' }}>Lab</span>
        </span>
      </div>

      {/* Card */}
      <div style={{
        background: '#161c2d', border: '1px solid rgba(99,120,175,0.18)',
        borderRadius: 16, width: '100%', maxWidth: 420, padding: 32,
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#0d1117', borderRadius: 8, padding: 3, marginBottom: 28 }}>
          {([['login', 'Entrar'], ['register', 'Criar conta']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => { setTab(t); setRegisterError(''); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                background: tab === t ? '#5a7cf8' : 'transparent',
                color: tab === t ? '#fff' : '#8892b0',
                cursor: 'pointer', fontWeight: tab === t ? 600 : 400, fontSize: '0.88rem',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Access type */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ color: '#8892b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Tipo de acesso
          </p>
          <div style={{ display: 'flex' }}>
            <RoleButton
              icon={<ShieldCheck size={15} />}
              label="Pesquisador"
              sublabel="Cria e gerencia estudos"
              selected
              onClick={() => undefined}
              activeColor="#5a7cf8"
            />
          </div>
          <p style={{ color: '#8892b0', fontSize: '0.73rem', margin: '8px 0 0', lineHeight: 1.45 }}>
            Participantes entram diretamente pelo link ou código enviado pelo pesquisador.
          </p>
          <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
            <input
              aria-label="Código de participação"
              value={participantCode}
              onChange={event => setParticipantCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Código de 6 dígitos"
              inputMode="numeric"
              style={{ flex: 1, minWidth: 0, background: '#0d1117', border: '1px solid rgba(99,120,175,0.2)', borderRadius: 7, padding: '8px 10px', color: '#e2e8f0' }}
            />
            <button
              type="button"
              disabled={participantCode.length !== 6}
              onClick={() => onParticipantCode(participantCode)}
              style={{ background: '#22c88a', color: '#0d1117', border: 0, borderRadius: 7, padding: '0 13px', fontWeight: 600, cursor: 'pointer', opacity: participantCode.length === 6 ? 1 : 0.45 }}
            >
              Acessar
            </button>
          </div>
        </div>

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField
              icon={<Mail size={14} />}
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={loginForm.email}
              onChange={v => setLoginForm(f => ({ ...f, email: v }))}
            />
            <div style={{ position: 'relative' }}>
              <InputField
                icon={<Lock size={14} />}
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={v => setLoginForm(f => ({ ...f, password: v }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 12, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 0 }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {registerError && <ErrorNotice message={registerError} />}

            <button type="submit" disabled={loading} style={{ ...submitBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Entrando…' : 'Entrar'} <ChevronRight size={15} />
            </button>
          </form>
        )}

        {/* Register form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField
              icon={<User size={14} />}
              label="Nome completo"
              type="text"
              placeholder="Maria da Silva"
              value={registerForm.name}
              onChange={v => setRegisterForm(f => ({ ...f, name: v }))}
            />
            <InputField
              icon={<Mail size={14} />}
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={registerForm.email}
              onChange={v => setRegisterForm(f => ({ ...f, email: v }))}
            />
            <div style={{ position: 'relative' }}>
              <InputField
                icon={<Lock size={14} />}
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mín. 8 caracteres"
                value={registerForm.password}
                onChange={v => setRegisterForm(f => ({ ...f, password: v }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 12, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 0 }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <InputField
              icon={<Lock size={14} />}
              label="Confirmar senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={registerForm.confirmPassword}
              onChange={v => setRegisterForm(f => ({ ...f, confirmPassword: v }))}
            />

            {registerError && (
              <p style={{ color: '#fb7185', fontSize: '0.78rem', margin: 0, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                {registerError}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ ...submitBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Criando…' : 'Criar conta'} <ChevronRight size={15} />
            </button>
          </form>
        )}
      </div>

      <p style={{ color: '#8892b0', fontSize: '0.72rem', marginTop: 20, textAlign: 'center', maxWidth: 340, lineHeight: 1.5 }}>
        Ao continuar, você concorda com os termos de uso e política de privacidade do CardSortLab.
      </p>
    </div>
  );
}

function RoleButton({ icon, label, sublabel, selected, onClick, activeColor }: {
  icon: React.ReactNode; label: string; sublabel: string;
  selected: boolean; onClick: () => void; activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
        border: `1.5px solid ${selected ? activeColor : 'rgba(99,120,175,0.2)'}`,
        background: selected ? `${activeColor}18` : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ color: selected ? activeColor : '#8892b0', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        {icon}
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ color: '#8892b0', fontSize: '0.7rem', margin: 0 }}>{sublabel}</p>
    </button>
  );
}

function InputField({ icon, label, type, placeholder, value, onChange }: {
  icon: React.ReactNode; label: string; type: string;
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', color: '#8892b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8892b0' }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#0d1117', border: '1px solid rgba(99,120,175,0.2)',
            borderRadius: 8, padding: '10px 12px 10px 36px',
            color: '#e2e8f0', outline: 'none', fontSize: '0.88rem',
          }}
          onFocus={e => (e.target.style.borderColor = '#5a7cf8')}
          onBlur={e => (e.target.style.borderColor = 'rgba(99,120,175,0.2)')}
        />
      </div>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div style={{
      background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.2)',
      borderRadius: 7, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8,
    }}>
      <span style={{ color: '#fb7185', fontSize: 13, flexShrink: 0, marginTop: 1 }}>!</span>
      <p style={{ color: '#fb7185', fontSize: '0.72rem', margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

const submitBtn: React.CSSProperties = {
  background: '#5a7cf8', color: '#fff', border: 'none',
  borderRadius: 8, padding: '11px 0', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.9rem', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: 6,
  marginTop: 4, transition: 'opacity 0.2s',
};
