import { useState, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  Cell,
} from 'recharts';
import {
  Study, Session, computeSimilarityMatrix, computeAgreementIndex,
  computeCategoryNameFrequency, computeCategoryAllocation,
  buildDendrogram, formatTime,
} from '../data/mockData';
import { SimilarityMatrixViz } from './SimilarityMatrixViz';
import { DendrogramChart } from './DendrogramViz';
import { Users, LayoutGrid, Clock, TrendingUp, AlertCircle, CheckCircle2, Download, Filter, ChevronDown } from 'lucide-react';

// ── Export helpers ─────────────────────────────────────────────────────────

// BOM (U+FEFF) tells Excel to interpret the file as UTF-8 with semicolons (pt-BR locale)
const CSV_BOM = '﻿';
const SEP = ';';

function escapeCell(value: string): string {
  // Wrap in quotes; double any internal quotes; replace semicolons inside text
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCSV(rows: string[][]): string {
  return CSV_BOM + rows.map(r => r.map(escapeCell).join(SEP)).join('\r\n');
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportSessionsCSV(study: Study) {
  const rows: string[][] = [
    ['ID Sessão', 'Participante', 'Data/Hora', 'Tempo (s)', 'Nº Grupos', 'Categoria', 'Cards no Grupo'],
  ];

  for (const s of study.sessions) {
    for (const g of s.groups) {
      const cardNames = g.cardIds
        .map(id => study.cards.find(c => c.id === id)?.text ?? id)
        .join(' | ');
      rows.push([
        s.id,
        s.participantName,
        new Date(s.completedAt).toLocaleString('pt-BR'),
        String(s.timeSpent),
        String(s.groups.length),
        g.categoryName,
        cardNames,
      ]);
    }
  }

  downloadFile(buildCSV(rows), `${study.name.replace(/\s+/g, '_')}_sessoes.csv`, 'text/csv');
}

function exportMatrixCSV(study: Study, matrix: number[][]) {
  const headers = ['Card', ...study.cards.map(c => c.text)];
  const rows: string[][] = [
    headers,
    ...study.cards.map((card, i) => [
      card.text,
      ...matrix[i].map(v => `${Math.round(v * 100)}%`),
    ]),
  ];

  downloadFile(buildCSV(rows), `${study.name.replace(/\s+/g, '_')}_matriz_similaridade.csv`, 'text/csv');
}

function exportStudySummaryCSV(study: Study) {
  const rows = [
    ['Campo', 'Valor'],
    ['Nome', study.name],
    ['Descrição', study.description],
    ['Tipo', study.type === 'open' ? 'Aberto' : study.type === 'closed' ? 'Fechado' : 'Híbrido'],
    ['Criado em', study.createdAt],
    ['Total de Cards', study.cards.length],
    ['Total de Participantes', study.sessions.length],
    ['Tempo Médio (s)', study.sessions.length > 0
      ? Math.round(study.sessions.reduce((a, s) => a + s.timeSpent, 0) / study.sessions.length)
      : 0],
    ['Instruções', study.instructions],
  ];
  downloadFile(buildCSV(rows.map(row => row.map(String))), `${study.name.replace(/\s+/g, '_')}_resumo.csv`, 'text/csv');
}

const CHART_COLORS = ['#5a7cf8', '#22c88a', '#f59e0b', '#a78bfa', '#fb7185', '#38bdf8', '#f97316', '#84cc16'];

interface DashboardViewProps {
  study: Study;
  onBack: () => void;
}

export function DashboardView({ study: sourceStudy, onBack }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'dendrogram' | 'allocation' | 'insights'>('overview');
  const [exportOpen, setExportOpen] = useState(false);
  const [participantFilter, setParticipantFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const exportRef = useRef<HTMLDivElement>(null);
  const study = useMemo<Study>(() => ({
    ...sourceStudy,
    sessions: sourceStudy.sessions.filter(session => {
      const participantMatches = participantFilter === 'all' || session.id === participantFilter;
      const completedDate = new Date(session.completedAt);
      const fromMatches = !dateFrom || completedDate >= new Date(`${dateFrom}T00:00:00`);
      const toMatches = !dateTo || completedDate <= new Date(`${dateTo}T23:59:59`);
      return participantMatches && fromMatches && toMatches;
    }),
  }), [sourceStudy, participantFilter, dateFrom, dateTo]);

  const matrix = useMemo(() => computeSimilarityMatrix(study), [study]);
  const agreementIndex = useMemo(() => computeAgreementIndex(matrix), [matrix]);
  const categoryFreq = useMemo(() => computeCategoryNameFrequency(study), [study]);
  const alloc = useMemo(() => computeCategoryAllocation(study), [study]);
  const dendrogram = useMemo(() => buildDendrogram(study.cards, matrix), [study.cards, matrix]);

  const avgTime = study.sessions.length > 0
    ? Math.round(study.sessions.reduce((a, s) => a + s.timeSpent, 0) / study.sessions.length)
    : 0;

  const avgGroups = study.sessions.length > 0
    ? +(study.sessions.reduce((a, s) => a + s.groups.length, 0) / study.sessions.length).toFixed(1)
    : 0;

  // Card ambiguity: cards with lowest max similarity to any other
  const cardAmbiguity = useMemo(() => {
    return study.cards.map((card, i) => {
      const maxSim = Math.max(...matrix[i].filter((_, j) => j !== i));
      return { card, ambiguity: 1 - maxSim };
    }).sort((a, b) => b.ambiguity - a.ambiguity);
  }, [study.cards, matrix]);

  // Category allocation bar data (for closed/hybrid)
  const allocationBarData = useMemo(() => {
    if (study.type === 'open') return [];
    return study.cards.map(card => {
      const allocData = alloc[card.id] || {};
      const row: Record<string, number | string> = { name: card.text.length > 14 ? card.text.slice(0, 14) + '…' : card.text };
      study.categories.forEach(cat => {
        row[cat.name] = Math.round((allocData[cat.id] || 0) * 100);
      });
      return row;
    });
  }, [study, alloc]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'matrix', label: 'Matriz de Similaridade' },
    { id: 'dendrogram', label: 'Dendrograma' },
    ...(study.type !== 'open' ? [{ id: 'allocation', label: 'Alocação' }] : []),
    { id: 'insights', label: 'Insights' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid rgba(99,120,175,0.15)', padding: '14px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0' }}>←</button>
            <div>
              <div style={{ color: '#e2e8f0', fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.03em' }}>{study.name}</div>
              <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>
                {study.sessions.length} sessões · {study.cards.length} cards · Card Sorting {study.type === 'open' ? 'Aberto' : study.type === 'closed' ? 'Fechado' : 'Híbrido'}
              </div>
            </div>
          </div>
          {/* Export dropdown */}
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setExportOpen(o => !o)}
              style={{ background: 'rgba(90,124,248,0.12)', color: '#5a7cf8', border: '1px solid rgba(90,124,248,0.3)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            >
              <Download size={13} /> Exportar <ChevronDown size={12} style={{ marginLeft: 2 }} />
            </button>
            {exportOpen && (
              <div
                style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#1e2a42', border: '1px solid rgba(99,120,175,0.25)', borderRadius: 8, minWidth: 210, zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                onMouseLeave={() => setExportOpen(false)}
              >
                {[
                  { label: 'Resumo do estudo — CSV', desc: 'Indicadores gerais prontos para abrir no Excel', action: () => exportStudySummaryCSV(study) },
                  { label: 'Sessões — CSV', desc: 'Agrupamentos detalhados por participante', action: () => exportSessionsCSV(study) },
                  { label: 'Matriz de Similaridade — CSV', desc: 'Pares de cards e % co-agrupamento', action: () => exportMatrixCSV(study, matrix) },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setExportOpen(false); }}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '11px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2, borderBottom: '1px solid rgba(99,120,175,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(90,124,248,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: '#8892b0', fontSize: '0.72rem' }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <Filter size={13} color="#8892b0" />
          <select value={participantFilter} onChange={event => setParticipantFilter(event.target.value)} aria-label="Filtrar participante" style={filterStyle}>
            <option value="all">Todos os participantes</option>
            {sourceStudy.sessions.map(session => (
              <option key={session.id} value={session.id}>{session.participantName}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} aria-label="Data inicial" style={filterStyle} />
          <span style={{ color: '#8892b0', fontSize: '0.72rem' }}>até</span>
          <input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} aria-label="Data final" style={filterStyle} />
          {(participantFilter !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setParticipantFilter('all'); setDateFrom(''); setDateTo(''); }} style={{ ...filterStyle, cursor: 'pointer' }}>
              Limpar filtros
            </button>
          )}
          <span style={{ color: '#8892b0', fontSize: '0.72rem', marginLeft: 'auto' }}>{study.sessions.length} sessão(ões) na análise</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(90,124,248,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#5a7cf8' : '#8892b0',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #5a7cf8' : '2px solid transparent',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.id ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: 24, maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              {[
                { icon: <Users size={18} color="#5a7cf8" />, label: 'Participantes', value: study.sessions.length, unit: '' },
                { icon: <LayoutGrid size={18} color="#22c88a" />, label: 'Cards', value: study.cards.length, unit: '' },
                { icon: <Clock size={18} color="#f59e0b" />, label: 'Tempo Médio', value: formatTime(avgTime), unit: '' },
                { icon: <TrendingUp size={18} color="#a78bfa" />, label: 'Concordância', value: Math.round(agreementIndex * 100), unit: '%' },
                ...(study.categories.length > 0 ? [{ icon: <Filter size={18} color="#fb7185" />, label: 'Categorias', value: study.categories.length, unit: '' }] : []),
              ].map(stat => (
                <div key={stat.label} style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {stat.icon}
                    <span style={{ color: '#8892b0', fontSize: '0.78rem' }}>{stat.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#e2e8f0', letterSpacing: '0.02em' }}>
                    {stat.value}{stat.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Session charts — two separate panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Tempo por participante */}
              <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Tempo por Participante</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, borderTop: '2px dashed #f59e0b' }} />
                    <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>média {avgTime}s</span>
                  </div>
                </div>
                <div style={{ color: '#8892b0', fontSize: '0.75rem', marginBottom: 14 }}>Duração da sessão em segundos</div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={study.sessions.map(s => ({ name: s.participantName.split(' ')[0], tempo: s.timeSpent }))}>
                    <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} unit="s" />
                    <Tooltip
                      contentStyle={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                      formatter={(v: number) => [`${v}s`, 'Tempo']}
                    />
                    <ReferenceLine y={avgTime} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `${avgTime}s`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                    <Bar dataKey="tempo" name="Tempo (s)" fill="#5a7cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Grupos por participante (open/hybrid only) */}
              {(study.type === 'open' || study.type === 'hybrid') ? (
                <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Grupos por Participante</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 18, borderTop: '2px dashed #f59e0b' }} />
                      <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>média {avgGroups}</span>
                    </div>
                  </div>
                  <div style={{ color: '#8892b0', fontSize: '0.75rem', marginBottom: 14 }}>Número de grupos criados por sessão</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={study.sessions.map(s => ({ name: s.participantName.split(' ')[0], grupos: s.groups.length }))}>
                      <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                        formatter={(v: number) => [v, 'Grupos']}
                      />
                      <ReferenceLine y={avgGroups} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `${avgGroups}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                      <Bar dataKey="grupos" name="Grupos" fill="#22c88a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                /* For closed sorting: show cards per category instead */
                <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>Cards por Categoria</div>
                  <div style={{ color: '#8892b0', fontSize: '0.75rem', marginBottom: 14 }}>Média de cards alocados em cada categoria</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart
                      data={study.categories.map(cat => {
                        const total = study.sessions.reduce((sum, s) => {
                          const grp = s.groups.find(g => g.categoryId === cat.id);
                          return sum + (grp ? grp.cardIds.length : 0);
                        }, 0);
                        return { name: cat.name.length > 12 ? cat.name.slice(0, 12) + '…' : cat.name, média: +(total / Math.max(1, study.sessions.length)).toFixed(1) };
                      })}
                    >
                      <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                        formatter={(v: number) => [v, 'Média de cards']}
                      />
                      <Bar dataKey="média" name="Média de cards" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Name Frequency (Open) */}
            {study.type === 'open' && categoryFreq.length > 0 && (
              <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Nomes de Categorias Mais Frequentes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categoryFreq.slice(0, 20).map((item, i) => (
                    <span
                      key={item.name}
                      style={{
                        background: `rgba(90,124,248,${0.1 + 0.05 * item.count})`,
                        color: '#a8b5d0',
                        border: '1px solid rgba(90,124,248,0.25)',
                        borderRadius: 6,
                        padding: `${4 + item.count}px ${8 + item.count * 2}px`,
                        fontSize: `${0.75 + item.count * 0.04}rem`,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.name} <span style={{ color: '#5a7cf8' }}>×{item.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MATRIX TAB */}
        {activeTab === 'matrix' && (
          <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 24 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>Matriz de Similaridade</div>
            <SimilarityMatrixViz study={study} matrix={matrix} />
          </div>
        )}

        {/* DENDROGRAM TAB */}
        {activeTab === 'dendrogram' && (
          <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 24 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>Dendrograma de Agrupamentos</div>
            <DendrogramChart node={dendrogram} cards={study.cards} />
          </div>
        )}

        {/* ALLOCATION TAB (closed/hybrid) */}
        {activeTab === 'allocation' && study.type !== 'open' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 24 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>Alocação de Cards por Categoria</div>
              <p style={{ color: '#8892b0', fontSize: '0.78rem', marginBottom: 20 }}>Percentual de participantes que alocou cada card em cada categoria.</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: '#8892b0', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '6px 10px', borderBottom: '1px solid rgba(99,120,175,0.15)' }}>Card</th>
                      {study.categories.map(cat => (
                        <th key={cat.id} style={{ textAlign: 'center', color: cat.color, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '6px 10px', borderBottom: '1px solid rgba(99,120,175,0.15)' }}>
                          {cat.name.length > 14 ? cat.name.slice(0, 14) + '…' : cat.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {study.cards.map((card, i) => {
                      const allocData = alloc[card.id] || {};
                      const maxCatId = study.categories.reduce((best, cat) =>
                        (allocData[cat.id] || 0) > (allocData[best] || 0) ? cat.id : best,
                        study.categories[0]?.id || ''
                      );
                      return (
                        <tr key={card.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(30,42,66,0.3)' }}>
                          <td style={{ padding: '7px 10px', color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{card.text}</td>
                          {study.categories.map(cat => {
                            const pct = Math.round((allocData[cat.id] || 0) * 100);
                            return (
                              <td key={cat.id} style={{ textAlign: 'center', padding: '7px 10px' }}>
                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 50 }}>
                                  <div style={{ width: 44, height: 8, borderRadius: 4, background: 'rgba(99,120,175,0.15)', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: cat.id === maxCatId ? cat.color : `${cat.color}60`, borderRadius: 4, transition: 'width 0.3s' }} />
                                  </div>
                                  <span style={{ color: cat.id === maxCatId ? cat.color : '#8892b0', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: cat.id === maxCatId ? 700 : 400 }}>
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 24 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Distribuição por Categoria</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={allocationBarData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8892b0', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#8892b0', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                  {study.categories.map((cat, i) => (
                    <Bar key={cat.id} dataKey={cat.name} name={cat.name} fill={cat.color} stackId="a" radius={i === study.categories.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Insights Automáticos</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InsightCard
                  icon={<TrendingUp size={16} color="#22c88a" />}
                  color="#22c88a"
                  title="Concordância Geral"
                  text={
                    agreementIndex > 0.6
                      ? `Alto nível de concordância (${Math.round(agreementIndex * 100)}%) entre participantes. A estrutura conceitual dos cards é clara e consistente.`
                      : agreementIndex > 0.35
                      ? `Concordância moderada (${Math.round(agreementIndex * 100)}%). Há padrões emergentes, mas alguns cards causam divergência.`
                      : `Baixa concordância (${Math.round(agreementIndex * 100)}%). Os participantes têm modelos mentais bastante diferentes para os cards.`
                  }
                />

                <InsightCard
                  icon={<AlertCircle size={16} color="#f59e0b" />}
                  color="#f59e0b"
                  title="Cards Mais Ambíguos"
                  text={`Os cards com maior ambiguidade são: ${cardAmbiguity.slice(0, 3).map(c => `"${c.card.text}"`).join(', ')}. Estes foram agrupados de formas muito diversas pelos participantes — considere revisar seu conteúdo ou nomenclatura.`}
                />

                <InsightCard
                  icon={<CheckCircle2 size={16} color="#5a7cf8" />}
                  color="#5a7cf8"
                  title="Cards Mais Coesos"
                  text={`Os cards mais frequentemente agrupados juntos são: ${cardAmbiguity.slice(-3).reverse().map(c => `"${c.card.text}"`).join(', ')}. Estes têm relação semântica clara para a maioria dos participantes.`}
                />

                {study.type === 'open' && categoryFreq.length > 0 && (
                  <InsightCard
                    icon={<LayoutGrid size={16} color="#a78bfa" />}
                    color="#a78bfa"
                    title="Categorias Emergentes"
                    text={`Os nomes de grupo mais frequentes foram "${categoryFreq[0]?.name}" (${categoryFreq[0]?.count}×) e "${categoryFreq[1]?.name}" (${categoryFreq[1]?.count}×). Estes revelam os modelos mentais dominantes dos participantes.`}
                  />
                )}

                {study.type !== 'open' && study.categories.length > 0 && (
                  <InsightCard
                    icon={<LayoutGrid size={16} color="#a78bfa" />}
                    color="#a78bfa"
                    title="Aderência às Categorias"
                    text={`A categoria "${study.categories[0]?.name}" apresentou maior aderência, enquanto cards como "${cardAmbiguity[0]?.card.text}" foram frequentemente alocados em categorias diferentes entre participantes, indicando possível ambiguidade.`}
                  />
                )}

                <InsightCard
                  icon={<Clock size={16} color="#fb7185" />}
                  color="#fb7185"
                  title="Tempo de Execução"
                  text={`Tempo médio de ${formatTime(avgTime)} por sessão. ${avgTime > 360 ? 'Isso sugere que o estudo pode ser longo ou que alguns cards foram difíceis de categorizar.' : 'Um tempo adequado para um estudo de card sorting, sem sinais de fadiga excessiva.'}`}
                />
              </div>
            </div>

            {/* Ambiguity Chart */}
            <div style={{ background: '#161c2d', border: '1px solid rgba(99,120,175,0.15)', borderRadius: 10, padding: 20 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Índice de Ambiguidade por Card</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cardAmbiguity.map(a => ({ name: a.card.text.length > 12 ? a.card.text.slice(0, 12) + '…' : a.card.text, ambiguidade: Math.round(a.ambiguity * 100) }))} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8892b0', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#8892b0', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e2a42', border: '1px solid rgba(99,120,175,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                  <Bar dataKey="ambiguidade" name="Ambiguidade" radius={[0, 4, 4, 0]}>
                    {cardAmbiguity.map((entry, index) => (
                      <Cell key={index} fill={entry.ambiguity > 0.6 ? '#f59e0b' : entry.ambiguity > 0.35 ? '#5a7cf8' : '#22c88a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  background: '#0d1117',
  color: '#a8b5d0',
  border: '1px solid rgba(99,120,175,0.2)',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: '0.72rem',
};

function InsightCard({ icon, color, title, text }: { icon: React.ReactNode; color: string; title: string; text: string }) {
  return (
    <div style={{ background: '#0d1117', border: `1px solid rgba(99,120,175,0.15)`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 12 }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{title}</div>
        <p style={{ color: '#8892b0', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}
