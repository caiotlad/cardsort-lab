import { useState } from 'react';
import { Study, SortingType } from '../data/mockData';
import {
  PlusCircle, Users, Calendar, Layers, Play, BarChart2,
  Trash2, X, Link2, Lock, Globe, Check, Eye, EyeOff,
} from 'lucide-react';

const TYPE_LABELS: Record<SortingType, { label: string; color: string; bg: string }> = {
  open:   { label: 'Aberto',  color: '#22c88a', bg: 'rgba(34,200,138,0.12)' },
  closed: { label: 'Fechado', color: '#5a7cf8', bg: 'rgba(90,124,248,0.12)' },
  hybrid: { label: 'Híbrido', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

interface StudiesViewProps {
  onExecute: (study: Study) => void;
  onDashboard: (study: Study) => void;
  studyList: Study[];
  onAddStudy: (study: Study) => Promise<void>;
  onDeleteStudy: (id: string) => Promise<void>;
  onToggleDashboardVisibility: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const defaultCards = [
  'Página Inicial', 'Sobre Nós', 'Produtos', 'Contato', 'Blog',
  'FAQ', 'Carrinho', 'Conta', 'Busca', 'Promoções',
];

function buildParticipantLink(studyId: string, shareToken?: string) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?study=${studyId}&role=participant&token=${encodeURIComponent(shareToken || '')}`;
}

function ShareButton({ studyId, shareToken }: { studyId: string; shareToken?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(buildParticipantLink(studyId, shareToken));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      onClick={copy}
      style={{
        background: copied ? 'rgba(34,200,138,0.12)' : 'rgba(99,120,175,0.08)',
        color: copied ? '#22c88a' : '#8892b0',
        border: `1px solid ${copied ? 'rgba(34,200,138,0.28)' : 'rgba(99,120,175,0.18)'}`,
        borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.2s',
      }}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      {copied ? 'Link copiado!' : 'Copiar link participante'}
    </button>
  );
}

export function StudiesView({
  onExecute, onDashboard, studyList, onAddStudy, onDeleteStudy,
  onToggleDashboardVisibility, isAdmin,
}: StudiesViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', type: 'open' as SortingType,
    instructions: '', cardsText: defaultCards.join('\n'),
    categoriesText: '', isPrivate: false,
  });

  const handleCreate = async () => {
    const colors = ['#5a7cf8', '#22c88a', '#f59e0b', '#a78bfa', '#fb7185'];
    const cards = form.cardsText.split('\n').filter(l => l.trim())
      .map((text, i) => ({ id: `new-${Date.now()}-${i}`, text: text.trim() }));
    const categories = form.categoriesText.split('\n').filter(l => l.trim())
      .map((name, i) => ({ id: `cat-${Date.now()}-${i}`, name: name.trim(), fixed: true, color: colors[i % colors.length] }));

    if (cards.length < 2) { setFormError('Adicione pelo menos dois cards.'); return; }
    if (form.type !== 'open' && categories.length === 0) {
      setFormError('Estudos fechados e híbridos precisam de ao menos uma categoria.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onAddStudy({
      id: `study-${Date.now()}`,
      name: form.name || 'Novo Estudo',
      description: form.description,
      type: form.type,
      instructions: form.instructions || 'Organize os cartões da forma que fizer mais sentido para você.',
      createdAt: new Date().toISOString().split('T')[0],
      cards, categories, sessions: [], isPrivate: form.isPrivate,
      accessMode: 'link', timerEnabled: true, allowUncertainCategory: false,
      });
      setShowCreate(false);
      setForm({ name: '', description: '', type: 'open', instructions: '', cardsText: defaultCards.join('\n'), categoriesText: '', isPrivate: false });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar o estudo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1050, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.02em', color: '#e2e8f0', margin: 0 }}>
            Meus Estudos
          </h1>
          <p style={{ color: '#8892b0', marginTop: 4, fontSize: '0.85rem' }}>
            {studyList.length} estudo{studyList.length !== 1 ? 's' : ''} configurado{studyList.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: '#5a7cf8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}
          >
            <PlusCircle size={16} /> Novo Estudo
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {studyList.map(study => {
          const typeInfo = TYPE_LABELS[study.type];
          return (
            <div key={study.id} style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: typeInfo.bg, color: typeInfo.color, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      {typeInfo.label}
                    </span>
                    <span style={{
                      background: study.isPrivate ? 'rgba(251,113,133,0.1)' : 'rgba(34,200,138,0.1)',
                      color: study.isPrivate ? '#fb7185' : '#22c88a',
                      border: `1px solid ${study.isPrivate ? 'rgba(251,113,133,0.22)' : 'rgba(34,200,138,0.22)'}`,
                      borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)',
                    }}>
                      {study.isPrivate ? <Lock size={9} /> : <Globe size={9} />}
                      {study.isPrivate ? 'Dashboard privado' : 'Dashboard público'}
                    </span>
                  </div>
                  <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {study.name}
                  </h3>
                  <p style={{ color: '#8892b0', margin: '4px 0 0', fontSize: '0.8rem', lineHeight: 1.4 }}>{study.description}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => onDeleteStudy(study.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 4, marginLeft: 8, flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { icon: <Layers size={12} />, label: 'Cards', value: study.cards.length },
                  { icon: <Users size={12} />, label: 'Participantes', value: study.sessions.length },
                  { icon: <Calendar size={12} />, label: 'Criado', value: study.createdAt },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#0d1117', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ color: '#8892b0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2, fontSize: 10 }}>
                      {stat.icon} {stat.label}
                    </div>
                    <div style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Share + privacy toggle (admin only) */}
              {isAdmin && (
                <div style={{ background: '#0d1117', borderRadius: 7, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <ShareButton studyId={study.id} shareToken={study.shareToken} />
                    {study.accessCode && (
                      <span title="Código de participação" style={{ color: '#a8b5d0', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        Código: {study.accessCode}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleDashboardVisibility(study.id)}
                    title={study.isPrivate ? 'Tornar dashboard público' : 'Tornar dashboard privado'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', padding: '2px 4px', flexShrink: 0 }}
                  >
                    {study.isPrivate ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onExecute(study)}
                  style={{ flex: 1, background: 'rgba(90,124,248,0.15)', color: '#5a7cf8', border: '1px solid rgba(90,124,248,0.3)', borderRadius: 7, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  <Play size={13} /> Executar
                </button>
                {study.sessions.length > 0 && isAdmin && (
                  <button
                    onClick={() => onDashboard(study)}
                    style={{ flex: 1, background: 'rgba(34,200,138,0.12)', color: '#22c88a', border: '1px solid rgba(34,200,138,0.25)', borderRadius: 7, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                  >
                    <BarChart2 size={13} /> Dashboard
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.2)', borderRadius: 14, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#e2e8f0', margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Novo Estudo</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Nome do Estudo *">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Navegação do Portal" style={inputStyle} />
              </Field>

              <Field label="Descrição">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Objetivo do estudo..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>

              {formError && (
                <div role="alert" style={{ color: '#fb7185', fontSize: '0.8rem', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 7, padding: '9px 12px' }}>
                  {formError}
                </div>
              )}

              <Field label="Tipo de Card Sorting">
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['open', 'closed', 'hybrid'] as SortingType[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: `1px solid ${form.type === t ? TYPE_LABELS[t].color : 'rgba(99,120,175,0.2)'}`, background: form.type === t ? TYPE_LABELS[t].bg : 'transparent', color: form.type === t ? TYPE_LABELS[t].color : '#8892b0', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                      {TYPE_LABELS[t].label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`Cards (um por linha) — ${form.cardsText.split('\n').filter(l => l.trim()).length} cards`}>
                <textarea value={form.cardsText} onChange={e => setForm(f => ({ ...f, cardsText: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              </Field>

              {(form.type === 'closed' || form.type === 'hybrid') && (
                <Field label="Categorias Pré-definidas (uma por linha)">
                  <textarea value={form.categoriesText} onChange={e => setForm(f => ({ ...f, categoriesText: e.target.value }))} placeholder={'Ex:\nNavegação\nCompras\nSuporte'} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                </Field>
              )}

              <Field label="Instruções ao Participante">
                <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Organize os cartões da forma que fizer mais sentido para você..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>

              {/* Dashboard visibility toggle */}
              <div style={{ background: '#0d1117', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {form.isPrivate ? <Lock size={13} color="#fb7185" /> : <Globe size={13} color="#22c88a" />}
                    Dashboard {form.isPrivate ? 'privado' : 'público'}
                  </div>
                  <p style={{ color: '#8892b0', fontSize: '0.73rem', margin: '3px 0 0' }}>
                    {form.isPrivate
                      ? 'Participantes não verão o dashboard — só o administrador tem acesso.'
                      : 'Participantes poderão ver o dashboard após concluir o teste.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                  style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.isPrivate ? '#fb7185' : '#22c88a', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <span style={{ position: 'absolute', top: 3, left: form.isPrivate ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: '1px solid rgba(99,120,175,0.25)', borderRadius: 7, padding: '9px 20px', color: '#8892b0', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.name || !form.description || !form.cardsText.trim()}
                  style={{ background: '#5a7cf8', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 24px', cursor: 'pointer', fontWeight: 600, opacity: (!form.name || !form.cardsText.trim()) ? 0.5 : 1 }}
                >
                  {saving ? 'Criando…' : 'Criar Estudo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d1117', border: '1px solid rgba(99,120,175,0.2)',
  borderRadius: 7, padding: '9px 12px', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#8892b0', fontSize: '0.78rem', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}
