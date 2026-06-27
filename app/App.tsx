import { useEffect, useState } from 'react';
import { LayoutGrid, LogOut } from 'lucide-react';
import { Study, Session } from './data/mockData';
import { LoginView } from './components/LoginView';
import { StudiesView } from './components/StudiesView';
import { ExecutionView } from './components/ExecutionView';
import { DashboardView } from './components/DashboardView';
import { api, AuthUser, ParticipantProfile, StudyDraft } from './services/api';

type Screen = 'studies' | 'execute' | 'dashboard';

const urlParams = new URLSearchParams(window.location.search);
const urlStudyId = urlParams.get('study');
const urlToken = urlParams.get('token') || '';
const urlCode = urlParams.get('code') || '';
const isParticipantLink = urlParams.get('role') === 'participant' && Boolean((urlStudyId && urlToken) || urlCode);

export default function App() {
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [studyList, setStudyList] = useState<Study[]>([]);
  const [activeStudy, setActiveStudy] = useState<Study | null>(null);
  const [screen, setScreen] = useState<Screen>('studies');
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState('');
  const [participantReady, setParticipantReady] = useState(false);
  const [participantSessionId, setParticipantSessionId] = useState<string | null>(null);
  const [participantDraft, setParticipantDraft] = useState<{ placements?: Record<string, string>; categories?: Study['categories'] }>({});
  const [participantStartedAt, setParticipantStartedAt] = useState<string>();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (isParticipantLink) {
          const invitedStudy = urlStudyId
            ? await api.publicStudy(urlStudyId, urlToken)
            : await api.publicStudyByCode(urlCode);
          const savedSessionId = localStorage.getItem(`cardsort-active-${invitedStudy.id}`);
          if (savedSessionId) {
            try {
              const resumed = await api.resumeSession(savedSessionId, urlToken, urlCode);
              setActiveStudy(resumed.study);
              setParticipantSessionId(resumed.sessionId);
              setParticipantDraft(resumed.draft || {});
              setParticipantStartedAt(resumed.startedAt);
              setParticipantReady(true);
              setScreen('execute');
              return;
            } catch {
              localStorage.removeItem(`cardsort-active-${invitedStudy.id}`);
            }
          }
          setActiveStudy(invitedStudy);
          setScreen('execute');
          return;
        }
        const user = await api.me();
        setAuth(user);
        setStudyList(await api.studies());
      } catch {
        if (isParticipantLink) setAppError('O link deste estudo é inválido ou não está mais disponível.');
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const refreshStudies = async () => setStudyList(await api.studies());

  const handleLogin = async (email: string, password: string) => {
    const user = await api.login(email, password);
    setAuth(user);
    setStudyList(await api.studies());
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const user = await api.register(name, email, password);
    setAuth(user);
    setStudyList([]);
  };

  const handleLogout = async () => {
    await api.logout();
    setAuth(null);
    setStudyList([]);
    setActiveStudy(null);
    setScreen('studies');
  };

  const handleAddStudy = async (study: Study) => {
    const payload: StudyDraft = {
      name: study.name,
      description: study.description,
      type: study.type,
      instructions: study.instructions,
      cards: study.cards,
      categories: study.categories,
      dashboardPrivate: study.isPrivate,
      accessMode: study.accessMode || 'link',
      allowUncertainCategory: study.allowUncertainCategory,
      timerEnabled: study.timerEnabled,
    };
    const created = await api.createStudy(payload);
    setStudyList(previous => [created, ...previous]);
  };

  const handleDeleteStudy = async (id: string) => {
    if (!window.confirm('Excluir este estudo e todas as suas sessões? Esta ação não pode ser desfeita.')) return;
    await api.deleteStudy(id);
    setStudyList(previous => previous.filter(study => study.id !== id));
  };

  const handleTogglePrivacy = async (id: string) => {
    const study = studyList.find(item => item.id === id);
    if (!study) return;
    const updated = await api.setPrivacy(id, !study.isPrivate);
    setStudyList(previous => previous.map(item => item.id === id ? updated : item));
  };

  const handleExecute = async (study: Study) => {
    const started = await api.startSession(study.id, study.shareToken || '', auth?.name || 'Pesquisador', undefined, undefined, {
      area: 'Prévia interna',
      experience: 'Pesquisador',
      familiarity: 'Alta',
    }, true);
    setParticipantSessionId(started.sessionId);
    setActiveStudy(started.study);
    setParticipantStartedAt(started.startedAt);
    setParticipantReady(true);
    setScreen('execute');
  };

  const handleSessionComplete = async (session: Session) => {
    if (!participantSessionId) throw new Error('Sessão de participação não iniciada.');
    const saved = await api.completeSession(participantSessionId, session.groups, session.timeSpent);
    if (activeStudy) localStorage.removeItem(`cardsort-active-${activeStudy.id}`);
    setActiveStudy(previous => previous ? { ...previous, sessions: [...previous.sessions, saved] } : previous);
    if (!isParticipantLink) {
      setStudyList(previous => previous.map(study =>
        study.id === activeStudy?.id ? { ...study, sessions: [...study.sessions, saved] } : study,
      ));
    }
  };

  if (loading) return <LoadingScreen />;

  if (isParticipantLink) {
    if (appError || !activeStudy) return <MessageScreen title="Estudo indisponível" message={appError} />;
    if (!participantReady) {
      return (
        <ParticipantWelcome
          study={activeStudy}
          onStart={async (name, email, profile, consentAccepted) => {
            const started = await api.startSession(activeStudy.id, urlToken, name, email, urlCode, profile, consentAccepted);
            setParticipantSessionId(started.sessionId);
            setActiveStudy(started.study);
            setParticipantStartedAt(started.startedAt);
            localStorage.setItem(`cardsort-active-${activeStudy.id}`, started.sessionId);
            setParticipantReady(true);
          }}
        />
      );
    }
    return (
      <AppShell authName="Participante" participant onLogout={() => window.location.assign(window.location.pathname)}>
        {screen === 'execute' && (
          <ExecutionView
            study={activeStudy}
            onComplete={handleSessionComplete}
            sessionId={participantSessionId || undefined}
            initialDraft={participantDraft}
            startedAt={participantStartedAt}
            onSaveProgress={(placements, categories) =>
              participantSessionId ? api.saveDraft(participantSessionId, placements, categories) : Promise.resolve()
            }
            isParticipant
            onViewDashboard={!activeStudy.isPrivate ? () => setScreen('dashboard') : undefined}
          />
        )}
        {screen === 'dashboard' && <DashboardView study={activeStudy} onBack={() => setScreen('execute')} />}
      </AppShell>
    );
  }

  if (!auth) return (
    <LoginView
      onLogin={handleLogin}
      onRegister={handleRegister}
      onParticipantCode={code => window.location.assign(`${window.location.pathname}?role=participant&code=${encodeURIComponent(code)}`)}
    />
  );

  const currentStudy = activeStudy
    ? studyList.find(study => study.id === activeStudy.id) || activeStudy
    : null;

  return (
    <AppShell authName={auth.name} onLogout={handleLogout}>
      {screen === 'studies' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <StudiesView
            onExecute={handleExecute}
            onDashboard={study => { setActiveStudy(study); setScreen('dashboard'); }}
            studyList={studyList}
            onAddStudy={handleAddStudy}
            onDeleteStudy={handleDeleteStudy}
            onToggleDashboardVisibility={handleTogglePrivacy}
            isAdmin
          />
        </div>
      )}
      {screen === 'execute' && currentStudy && (
        <ExecutionView
          study={currentStudy}
          onBack={() => { setScreen('studies'); setActiveStudy(null); void refreshStudies(); }}
          onComplete={handleSessionComplete}
          sessionId={participantSessionId || undefined}
          startedAt={participantStartedAt}
          onSaveProgress={(placements, categories) =>
            participantSessionId ? api.saveDraft(participantSessionId, placements, categories) : Promise.resolve()
          }
        />
      )}
      {screen === 'dashboard' && currentStudy && (
        <DashboardView study={currentStudy} onBack={() => { setScreen('studies'); setActiveStudy(null); }} />
      )}
    </AppShell>
  );
}

function AppShell({ authName, participant = false, onLogout, children }: {
  authName: string;
  participant?: boolean;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="app-bg" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', color: '#e2e8f0', fontFamily: 'var(--font-sans)' }}>
      <nav style={{ background: 'rgba(17,24,39,0.82)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(148,163,184,0.14)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="primary-gradient" style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(90,124,248,0.34)' }}>
            <LayoutGrid size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', letterSpacing: '0.04em' }}>
            CardSort<span style={{ color: '#5a7cf8' }}>Lab</span>
          </span>
          {participant && <span className="muted-pill" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>Sessão de participante</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#a8b5d0', fontSize: '0.78rem' }}>{authName}</span>
          <button onClick={onLogout} title="Sair" style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 8, cursor: 'pointer', color: '#8892b0', display: 'flex', padding: 7 }}>
            <LogOut size={14} />
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</main>
    </div>
  );
}

function ParticipantWelcome({ study, onStart }: { study: Study; onStart: (name: string, email: string | undefined, profile: ParticipantProfile, consentAccepted: boolean) => Promise<void> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<ParticipantProfile>({ area: '', experience: '', familiarity: '', notes: '' });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-bg" style={{ minHeight: '100%', color: '#e2e8f0', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form
        onSubmit={async event => {
          event.preventDefault();
          if (!name.trim()) { setError('Informe seu nome para começar.'); return; }
          if (!consentAccepted) { setError('Para iniciar, é necessário aceitar o termo de consentimento.'); return; }
          setLoading(true);
          try { await onStart(name.trim(), email.trim() || undefined, profile, consentAccepted); }
          catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível iniciar.'); }
          finally { setLoading(false); }
        }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: 560, borderRadius: 22, padding: 34 }}
      >
        <span className="muted-pill" style={{ color: '#a8b5d0', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', textTransform: 'uppercase', padding: '5px 10px' }}>Convite para participar</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', margin: '18px 0 8px', letterSpacing: '0.02em' }}>{study.name}</h1>
        <p style={{ color: '#a8b5d0', lineHeight: 1.6 }}>{study.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 22 }}>
          {[
            ['Tipo', study.type === 'open' ? 'Aberto' : study.type === 'closed' ? 'Fechado' : 'Híbrido'],
            ['Cards', String(study.cards.length)],
            ['Tempo', study.timerEnabled === false ? 'Livre' : 'Cronometrado'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ color: '#8892b0', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 24 }}>Seu nome *</label>
        <input value={name} onChange={event => setName(event.target.value)} style={welcomeInput} autoFocus />
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 14 }}>E-mail (opcional)</label>
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} style={welcomeInput} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div>
            <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem' }}>Curso/área</label>
            <input value={profile.area || ''} onChange={event => setProfile(previous => ({ ...previous, area: event.target.value }))} placeholder="Ex: Design, Computação..." style={welcomeInput} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem' }}>Experiência</label>
            <select value={profile.experience || ''} onChange={event => setProfile(previous => ({ ...previous, experience: event.target.value }))} style={welcomeInput}>
              <option value="">Selecione</option>
              <option>Iniciante</option>
              <option>Intermediário</option>
              <option>Avançado</option>
            </select>
          </div>
        </div>
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 14 }}>Familiaridade com o tema</label>
        <select value={profile.familiarity || ''} onChange={event => setProfile(previous => ({ ...previous, familiarity: event.target.value }))} style={welcomeInput}>
          <option value="">Selecione</option>
          <option>Baixa</option>
          <option>Média</option>
          <option>Alta</option>
        </select>
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 14 }}>Observações de perfil (opcional)</label>
        <textarea value={profile.notes || ''} onChange={event => setProfile(previous => ({ ...previous, notes: event.target.value }))} rows={2} style={{ ...welcomeInput, resize: 'vertical' }} />
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 18, color: '#a8b5d0', fontSize: '0.78rem', lineHeight: 1.5, background: 'rgba(13,17,23,0.68)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, padding: 12 }}>
          <input type="checkbox" checked={consentAccepted} onChange={event => setConsentAccepted(event.target.checked)} style={{ marginTop: 3 }} />
          <span>
            Li e aceito participar voluntariamente deste estudo. Entendo que minhas respostas poderão ser analisadas de forma anonimizada para fins acadêmicos.
          </span>
        </label>
        {error && <p role="alert" style={{ color: '#fb7185', fontSize: '0.8rem' }}>{error}</p>}
        <button disabled={loading || !consentAccepted} className="primary-gradient" style={{ width: '100%', marginTop: 20, padding: 13, border: 0, borderRadius: 10, color: '#fff', fontWeight: 700, cursor: consentAccepted ? 'pointer' : 'not-allowed', opacity: consentAccepted ? 1 : 0.55, boxShadow: '0 14px 34px rgba(90,124,248,0.24)' }}>
          {loading ? 'Preparando sessão…' : 'Começar atividade'}
        </button>
      </form>
    </div>
  );
}

const welcomeInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', marginTop: 6, padding: '11px 12px',
  borderRadius: 8, border: '1px solid rgba(99,120,175,0.25)', background: '#0d1117', color: '#e2e8f0',
};

function LoadingScreen() {
  return <MessageScreen title="CardSort Lab" message="Carregando seu ambiente…" />;
}

function MessageScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="app-bg" style={{ height: '100%', color: '#e2e8f0', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div className="glass-panel" style={{ borderRadius: 20, padding: 32 }}><h1 style={{ fontFamily: 'var(--font-display)' }}>{title}</h1><p style={{ color: '#8892b0' }}>{message}</p></div>
    </div>
  );
}
