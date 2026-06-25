import { useEffect, useState } from 'react';
import { LayoutGrid, LogOut } from 'lucide-react';
import { Study, Session } from './data/mockData';
import { LoginView } from './components/LoginView';
import { StudiesView } from './components/StudiesView';
import { ExecutionView } from './components/ExecutionView';
import { DashboardView } from './components/DashboardView';
import { api, AuthUser, StudyDraft } from './services/api';

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
    const started = await api.startSession(study.id, study.shareToken || '', auth?.name || 'Pesquisador');
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
          onStart={async (name, email) => {
            const started = await api.startSession(activeStudy.id, urlToken, name, email, urlCode);
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
    <div style={{ width: '100%', height: '100%', background: '#0d1117', display: 'flex', flexDirection: 'column', color: '#e2e8f0', fontFamily: 'var(--font-sans)' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid rgba(99,120,175,0.15)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#5a7cf8', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutGrid size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', letterSpacing: '0.04em' }}>
            CardSort<span style={{ color: '#5a7cf8' }}>Lab</span>
          </span>
          {participant && <span style={{ color: '#8892b0', fontSize: '0.72rem' }}>Sessão de participante</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#a8b5d0', fontSize: '0.78rem' }}>{authName}</span>
          <button onClick={onLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', display: 'flex' }}>
            <LogOut size={14} />
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</main>
    </div>
  );
}

function ParticipantWelcome({ study, onStart }: { study: Study; onStart: (name: string, email?: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight: '100%', background: '#0d1117', color: '#e2e8f0', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form
        onSubmit={async event => {
          event.preventDefault();
          if (!name.trim()) { setError('Informe seu nome para começar.'); return; }
          setLoading(true);
          try { await onStart(name.trim(), email.trim() || undefined); }
          catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível iniciar.'); }
          finally { setLoading(false); }
        }}
        style={{ width: '100%', maxWidth: 520, background: '#161c2d', border: '1px solid rgba(99,120,175,0.18)', borderRadius: 16, padding: 32 }}
      >
        <span style={{ color: '#5a7cf8', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Convite para participar</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '8px 0' }}>{study.name}</h1>
        <p style={{ color: '#a8b5d0', lineHeight: 1.6 }}>{study.description}</p>
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 24 }}>Seu nome *</label>
        <input value={name} onChange={event => setName(event.target.value)} style={welcomeInput} autoFocus />
        <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginTop: 14 }}>E-mail (opcional)</label>
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} style={welcomeInput} />
        {error && <p role="alert" style={{ color: '#fb7185', fontSize: '0.8rem' }}>{error}</p>}
        <button disabled={loading} style={{ width: '100%', marginTop: 20, padding: 12, border: 0, borderRadius: 8, background: '#5a7cf8', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
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
    <div style={{ height: '100%', background: '#0d1117', color: '#e2e8f0', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div><h1 style={{ fontFamily: 'var(--font-display)' }}>{title}</h1><p style={{ color: '#8892b0' }}>{message}</p></div>
    </div>
  );
}
