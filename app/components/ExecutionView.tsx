import { useState, useCallback, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Study, Card, Category, Session } from '../data/mockData';
import { Plus, RotateCcw, Redo2, Send, CheckCircle, Edit3, Trash2, Clock, Info, X, Check, Cloud } from 'lucide-react';

const CARD_TYPE = 'SORT_CARD';

interface DraggableCardProps {
  card: Card;
  small?: boolean;
}

function DraggableCard({ card, small }: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: CARD_TYPE,
    item: { cardId: card.id },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      style={{
        background: isDragging ? 'rgba(90,124,248,0.25)' : '#1e2a42',
        border: `1px solid ${isDragging ? '#5a7cf8' : 'rgba(99,120,175,0.25)'}`,
        borderRadius: 8,
        padding: small ? '7px 12px' : '10px 14px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        color: '#e2e8f0',
        fontSize: small ? '0.8rem' : '0.875rem',
        userSelect: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ color: '#8892b0', fontSize: 10 }}>⠿</span>
      {card.text}
    </div>
  );
}

interface CategoryZoneProps {
  category: { id: string; name: string; color: string; fixed: boolean };
  cards: Card[];
  onDrop: (cardId: string, categoryId: string) => void;
  onRemoveCard: (cardId: string, categoryId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

function CategoryZone({ category, cards, onDrop, onRemoveCard, onRename, onDelete, canDelete }: CategoryZoneProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const [{ isOver }, drop] = useDrop({
    accept: CARD_TYPE,
    drop: (item: { cardId: string }) => onDrop(item.cardId, category.id),
    collect: monitor => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      style={{
        background: isOver ? 'rgba(90,124,248,0.08)' : '#161c2d',
        border: `1.5px solid ${isOver ? category.color : 'rgba(99,120,175,0.18)'}`,
        borderRadius: 10,
        minHeight: 120,
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Category Header */}
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(99,120,175,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => { onRename(category.id, editName); setEditing(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(category.id, editName); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
              style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${category.color}`, outline: 'none', color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, flex: 1, minWidth: 0 }}
            />
          ) : (
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {category.name}
            </span>
          )}
          <span style={{ color: '#8892b0', fontFamily: 'var(--font-mono)', fontSize: 11, background: '#0d1117', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>
            {cards.length}
          </span>
        </div>
        {!category.fixed && (
          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            <button onClick={() => { setEditName(category.name); setEditing(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 2 }}><Edit3 size={13} /></button>
            {canDelete && (
              <button onClick={() => onDelete(category.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 2 }}><Trash2 size={13} /></button>
            )}
          </div>
        )}
      </div>

      {/* Cards in category */}
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 60 }}>
        {cards.length === 0 && (
          <div style={{ color: '#8892b0', fontSize: '0.75rem', textAlign: 'center', padding: '12px 0', opacity: 0.6 }}>
            Arraste cartões aqui
          </div>
        )}
        {cards.map(card => (
          <div
            key={card.id}
            style={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.2)', borderRadius: 6, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.8rem' }}
          >
            <span>{card.text}</span>
            <button
              onClick={() => onRemoveCard(card.id, category.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 2, display: 'flex', alignItems: 'center' }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExecutionViewProps {
  study: Study;
  onBack?: () => void;
  onComplete: (session: Session) => Promise<void>;
  isParticipant?: boolean;
  onViewDashboard?: () => void;
  sessionId?: string;
  onSaveProgress?: (placements: Record<string, string>, categories: Category[]) => Promise<void>;
  initialDraft?: { placements?: Record<string, string>; categories?: Category[] };
  startedAt?: string;
}

export function ExecutionView({ study, onBack, onComplete, onViewDashboard, sessionId, onSaveProgress, initialDraft, startedAt }: ExecutionViewProps) {
  const [placements, setPlacements] = useState<Record<string, string>>(initialDraft?.placements || {});
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string; fixed: boolean }>>(() => {
    if (initialDraft?.categories?.length) return initialDraft.categories;
    const colors = ['#5a7cf8', '#22c88a', '#f59e0b', '#a78bfa', '#fb7185', '#38bdf8', '#f97316', '#84cc16'];
    if (study.type === 'open') {
      return [
        { id: 'cat-default-0', name: 'Grupo 1', fixed: false, color: colors[0] },
      ];
    }
    return study.categories.map((c, i) => ({ ...c, color: c.color || colors[i % colors.length] }));
  });
  const [step, setStep] = useState<'sort' | 'review' | 'done'>('sort');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [elapsed, setElapsed] = useState(0);
  const [finishError, setFinishError] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);
  const startTimeRef = useRef(startedAt ? new Date(startedAt).getTime() : Date.now());
  const undoStack = useRef<Array<{ placements: Record<string, string>; categories: typeof categories }>>([]);
  const redoStack = useRef<Array<{ placements: Record<string, string>; categories: typeof categories }>>([]);

  const unassignedCards = study.cards.filter(c => !placements[c.id]);
  const colors = ['#5a7cf8', '#22c88a', '#f59e0b', '#a78bfa', '#fb7185', '#38bdf8', '#f97316', '#84cc16'];

  const remember = useCallback(() => {
    undoStack.current.push({ placements: { ...placements }, categories: categories.map(category => ({ ...category })) });
    if (undoStack.current.length > 40) undoStack.current.shift();
    redoStack.current = [];
    setHistoryVersion(version => version + 1);
  }, [placements, categories]);

  const handleDrop = useCallback((cardId: string, categoryId: string) => {
    remember();
    setPlacements(prev => ({ ...prev, [cardId]: categoryId }));
  }, [remember]);

  const handleRemoveCard = useCallback((cardId: string, _categoryId: string) => {
    remember();
    setPlacements(prev => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  }, [remember]);

  const handleAddCategory = () => {
    remember();
    const idx = categories.length;
    setCategories(prev => [...prev, {
      id: `cat-new-${Date.now()}`,
      name: `Grupo ${idx + 1}`,
      fixed: false,
      color: colors[idx % colors.length],
    }]);
  };

  const handleRenameCategory = (id: string, name: string) => {
    remember();
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleDeleteCategory = (id: string) => {
    remember();
    setCategories(prev => prev.filter(c => c.id !== id));
    setPlacements(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(cardId => { if (next[cardId] === id) delete next[cardId]; });
      return next;
    });
  };

  const handleUndo = () => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push({ placements: { ...placements }, categories: categories.map(category => ({ ...category })) });
    setPlacements(previous.placements);
    setCategories(previous.categories);
    setHistoryVersion(version => version + 1);
  };

  const handleRedo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push({ placements: { ...placements }, categories: categories.map(category => ({ ...category })) });
    setPlacements(next.placements);
    setCategories(next.categories);
    setHistoryVersion(version => version + 1);
  };

  const handleFinish = async () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const groups = categories.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      cardIds: study.cards.filter(c => placements[c.id] === cat.id).map(c => c.id),
    })).filter(g => g.cardIds.length > 0);

    const session: Session = {
      id: `session-${Date.now()}`,
      participantId: `anon-${Date.now()}`,
      participantName: 'Participante',
      completedAt: new Date().toISOString(),
      timeSpent: elapsed,
      groups,
    };
    setFinishError('');
    try {
      await onComplete(session);
      localStorage.removeItem(`cardsort-draft-${sessionId}`);
      setStep('done');
    } catch (error) {
      setFinishError(error instanceof Error ? error.message : 'Não foi possível finalizar. Tente novamente.');
    }
  };

  const allPlaced = unassignedCards.length === 0;
  const showAddCategory = study.type === 'open' || study.type === 'hybrid';

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sessionId || !onSaveProgress) return;
    localStorage.setItem(`cardsort-draft-${sessionId}`, JSON.stringify({ placements, categories }));
    setSaveState('saving');
    const timeout = window.setTimeout(async () => {
      try {
        await onSaveProgress(placements, categories);
        setSaveState('saved');
      } catch {
        setSaveState('offline');
      }
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [placements, categories, sessionId, onSaveProgress]);

  if (step === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,200,138,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={32} color="#22c88a" />
        </div>
        <h2 style={{ color: '#e2e8f0', margin: 0 }}>Sessão Concluída!</h2>
        <p style={{ color: '#8892b0', textAlign: 'center', maxWidth: 380 }}>
          Seus dados foram registrados com sucesso. Obrigado por participar do estudo.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {onViewDashboard && (
            <button onClick={onViewDashboard} style={{ background: '#22c88a', color: '#0d1117', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>
              Ver Resultados
            </button>
          )}
          {onBack && (
            <button onClick={onBack} style={{ background: '#5a7cf8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 500 }}>
              Voltar aos Estudos
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Bar */}
        <div style={{ background: '#111827', borderBottom: '1px solid rgba(99,120,175,0.15)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', padding: 4, display: 'flex' }}>
                ←
              </button>
            )}
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>{study.name}</div>
              <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>Card Sorting {study.type === 'open' ? 'Aberto' : study.type === 'closed' ? 'Fechado' : 'Híbrido'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div aria-live="polite" style={{ color: saveState === 'offline' ? '#f59e0b' : '#8892b0', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Cloud size={12} />
              {saveState === 'saving' ? 'Salvando…' : saveState === 'offline' ? 'Salvo neste dispositivo' : 'Progresso salvo'}
            </div>
            <button onClick={handleUndo} disabled={undoStack.current.length === 0} title="Desfazer" aria-label="Desfazer última alteração"
              style={{ background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', opacity: undoStack.current.length ? 1 : 0.35, display: 'flex' }}>
              <RotateCcw size={14} />
            </button>
            <button onClick={handleRedo} disabled={redoStack.current.length === 0} title="Refazer" aria-label="Refazer última alteração"
              style={{ background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', opacity: redoStack.current.length ? 1 : 0.35, display: 'flex' }}>
              <Redo2 size={14} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8892b0', fontSize: '0.8rem' }}>
              <Clock size={13} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {study.timerEnabled !== false ? `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')} · ` : ''}
                {unassignedCards.length}/{study.cards.length} restantes
              </span>
            </div>
            {step === 'sort' && (
              <button
                onClick={() => setStep('review')}
                disabled={!allPlaced}
                style={{ background: allPlaced ? '#5a7cf8' : '#1e2a42', color: allPlaced ? '#fff' : '#8892b0', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: allPlaced ? 'pointer' : 'not-allowed', fontWeight: 500, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Revisar <ChevronRight size={14} />
              </button>
            )}
            {step === 'review' && (
              <button
                onClick={handleFinish}
                style={{ background: '#22c88a', color: '#0d1117', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={14} /> Finalizar
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ background: 'rgba(90,124,248,0.07)', borderBottom: '1px solid rgba(90,124,248,0.15)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={14} color="#5a7cf8" />
          <span style={{ color: '#a8b5d0', fontSize: '0.82rem' }}>{study.instructions}</span>
        </div>

        {step === 'review' && (
          <div style={{ background: 'rgba(34,200,138,0.08)', borderBottom: '1px solid rgba(34,200,138,0.2)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={14} color="#22c88a" />
            <span style={{ color: '#22c88a', fontSize: '0.82rem', fontWeight: 500 }}>
              Revisão: confirme a organização antes de enviar. Você ainda pode mover cartões se necessário.
            </span>
          </div>
        )}
        {finishError && (
          <div role="alert" style={{ color: '#fb7185', background: 'rgba(251,113,133,0.08)', padding: '9px 20px', fontSize: '0.8rem' }}>
            {finishError}
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Unassigned Cards */}
          <div style={{ width: 220, flexShrink: 0, background: '#111827', borderRight: '1px solid rgba(99,120,175,0.12)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            <div style={{ color: '#8892b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              Cartões ({unassignedCards.length})
            </div>
            {unassignedCards.map(card => (
              <DraggableCard key={card.id} card={card} small />
            ))}
            {unassignedCards.length === 0 && (
              <div style={{ color: '#22c88a', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={20} />
                <span>Todos organizados!</span>
              </div>
            )}
          </div>

          {/* Right: Categories */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {categories.map(cat => (
                <CategoryZone
                  key={cat.id}
                  category={cat}
                  cards={study.cards.filter(c => placements[c.id] === cat.id)}
                  onDrop={handleDrop}
                  onRemoveCard={handleRemoveCard}
                  onRename={handleRenameCategory}
                  onDelete={handleDeleteCategory}
                  canDelete={categories.length > 1}
                />
              ))}
              {showAddCategory && (
                <button
                  onClick={handleAddCategory}
                  style={{ background: 'transparent', border: '1.5px dashed rgba(99,120,175,0.3)', borderRadius: 10, minHeight: 120, cursor: 'pointer', color: '#8892b0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.82rem', transition: 'border-color 0.15s' }}
                >
                  <Plus size={20} />
                  Novo Grupo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

// Keep ChevronRight inline to avoid extra import
function ChevronRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
