import { useState, useMemo } from 'react';
import { Study, buildDendrogram, DendrogramNode } from '../data/mockData';

interface Props {
  study: Study;
  matrix: number[][];
}

function cellColor(value: number): { bg: string; text: string } {
  if (value >= 1) return { bg: '#3b82f6', text: '#fff' };
  if (value === 0) return { bg: '#0d1117', text: 'transparent' };

  const stops = [
    { t: 0,    r: 13,  g: 17,  b: 23  },
    { t: 0.25, r: 30,  g: 42,  b: 100 },
    { t: 0.5,  r: 55,  g: 80,  b: 200 },
    { t: 0.75, r: 34,  g: 160, b: 150 },
    { t: 1,    r: 20,  g: 200, b: 138 },
  ];

  let lo = stops[0], hi = stops[stops.length - 1];
  for (let k = 0; k < stops.length - 1; k++) {
    if (value >= stops[k].t && value <= stops[k + 1].t) { lo = stops[k]; hi = stops[k + 1]; break; }
  }
  const t = (value - lo.t) / (hi.t - lo.t);
  const r = Math.round(lo.r + (hi.r - lo.r) * t);
  const g = Math.round(lo.g + (hi.g - lo.g) * t);
  const b = Math.round(lo.b + (hi.b - lo.b) * t);
  return { bg: `rgb(${r},${g},${b})`, text: value > 0.45 ? '#fff' : '#8892b0' };
}

/** Extract leaf labels in dendrogram traversal order */
function dendrogramLeafOrder(node: DendrogramNode): string[] {
  if (!node.children) return [node.label!];
  return node.children.flatMap(dendrogramLeafOrder);
}

/** Map leaf labels back to card indices for reordering */
function getClusteredIndices(leafOrder: string[], cards: Study['cards']): number[] {
  return leafOrder
    .map(label => cards.findIndex(c => c.text === label))
    .filter(i => i >= 0);
}

export function SimilarityMatrixViz({ study, matrix }: Props) {
  const [hovered, setHovered] = useState<{ i: number; j: number } | null>(null);
  const cards = study.cards;
  const n = cards.length;

  // Cluster ordering via dendrogram
  const orderedIndices = useMemo(() => {
    if (n < 2) return cards.map((_, i) => i);
    const dendro = buildDendrogram(cards, matrix);
    const leafOrder = dendrogramLeafOrder(dendro);
    const indices = getClusteredIndices(leafOrder, cards);
    // Ensure all indices are present (fallback for any mismatch)
    if (indices.length === n) return indices;
    const missing = cards.map((_, i) => i).filter(i => !indices.includes(i));
    return [...indices, ...missing];
  }, [cards, matrix, n]);

  const orderedCards = orderedIndices.map(i => cards[i]);

  // Remap matrix to clustered order
  const orderedMatrix = useMemo(() =>
    orderedIndices.map(ri => orderedIndices.map(ci => matrix[ri][ci])),
    [orderedIndices, matrix]
  );

  const CELL = 38;
  const LABEL_W = 152;
  const HEADER_H = useMemo(() => {
    const longest = Math.max(...orderedCards.map(c => c.text.length));
    return Math.max(110, Math.min(longest * 6.5, 170));
  }, [orderedCards]);

  // For lower triangle: render only j <= i
  // Column headers: all columns except the last (diagonal = self, no column header needed)
  // Row i shows columns j = 0..i (lower triangle incl. diagonal)

  return (
    <div>
      <p style={{ color: '#8892b0', fontSize: '0.78rem', marginBottom: 14, lineHeight: 1.5 }}>
        Cards ordenados por cluster de agrupamento. Cada célula mostra a % de participantes que agrupou os dois cards juntos.
        Apenas o triângulo inferior é exibido (o superior é espelho).
      </p>

      {/* Hover tooltip */}
      <div style={{ height: 30, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        {hovered && hovered.i !== hovered.j ? (
          <div style={{ background: '#1e2a42', border: '1px solid rgba(90,124,248,0.35)', borderRadius: 7, padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
            <span style={{ color: '#a8b5d0' }}>"{orderedCards[hovered.i].text}"</span>
            <span style={{ color: '#8892b0' }}>↔</span>
            <span style={{ color: '#a8b5d0' }}>"{orderedCards[hovered.j].text}"</span>
            <span style={{ color: '#8892b0', margin: '0 2px' }}>·</span>
            <span style={{ color: '#22c88a', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {Math.round(orderedMatrix[hovered.i][hovered.j] * 100)}% co-agrupados
            </span>
          </div>
        ) : (
          <span style={{ color: 'rgba(136,146,176,0.4)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            Passe o mouse sobre uma célula para ver o detalhe
          </span>
        )}
      </div>

      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '75vh' }}>
        <div style={{ display: 'inline-block' }}>

          {/* Column headers SVG — only columns 0..n-2 (diagonal col has no header needed) */}
          <svg
            width={LABEL_W + n * CELL}
            height={HEADER_H}
            style={{ display: 'block', overflow: 'visible' }}
          >
            <line x1={LABEL_W} y1={HEADER_H - 1} x2={LABEL_W + n * CELL} y2={HEADER_H - 1} stroke="rgba(99,120,175,0.18)" strokeWidth={1} />
            {orderedCards.map((c, j) => {
              // Only show column headers for columns that appear in lower triangle (j < n-1)
              if (j >= n - 1) return null;
              const cx = LABEL_W + j * CELL + CELL / 2;
              const highlighted = hovered?.j === j || hovered?.i === j;
              return (
                <text
                  key={`col-${c.id}`}
                  x={cx} y={HEADER_H - 10}
                  textAnchor="start"
                  transform={`rotate(-45, ${cx}, ${HEADER_H - 10})`}
                  fill={highlighted ? '#e2e8f0' : '#8892b0'}
                  fontSize={11} fontFamily="var(--font-mono)"
                  fontWeight={highlighted ? 700 : 400}
                >
                  {c.text.length > 20 ? c.text.slice(0, 20) + '…' : c.text}
                </text>
              );
            })}
          </svg>

          {/* Rows — row i shows columns j=0..i */}
          {orderedCards.map((rowCard, i) => {
            const isRowHighlighted = hovered?.i === i || hovered?.j === i;
            // Width of this row = (i+1) cells + label
            const rowWidth = LABEL_W + (i + 1) * CELL;

            return (
              <div key={`row-${rowCard.id}`} style={{ display: 'flex', width: rowWidth }}>
                {/* Row label */}
                <div style={{
                  width: LABEL_W, height: CELL, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 12, boxSizing: 'border-box',
                  borderRight: '1px solid rgba(99,120,175,0.18)',
                  borderBottom: i < n - 1 ? '1px solid rgba(99,120,175,0.06)' : 'none',
                  color: isRowHighlighted ? '#e2e8f0' : '#8892b0',
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  fontWeight: isRowHighlighted ? 700 : 400,
                  transition: 'color 0.15s',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: LABEL_W - 16 }}>
                    {rowCard.text}
                  </span>
                </div>

                {/* Lower triangle cells: j = 0 to i */}
                {orderedCards.slice(0, i + 1).map((colCard, j) => {
                  const val = orderedMatrix[i][j];
                  const isDiag = i === j;
                  const isHovered = hovered?.i === i && hovered?.j === j;
                  const isHighlighted = hovered !== null && (hovered.i === i || hovered.j === i || hovered.i === j || hovered.j === j);
                  const { bg, text } = isDiag ? { bg: '#5a7cf8', text: '#fff' } : cellColor(val);
                  const pct = Math.round(val * 100);

                  return (
                    <div
                      key={`cell-${rowCard.id}-${colCard.id}`}
                      onMouseEnter={() => setHovered({ i, j })}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        width: CELL, height: CELL, flexShrink: 0,
                        background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'default', boxSizing: 'border-box',
                        outline: isHovered ? '2px solid rgba(255,255,255,0.5)' : 'none',
                        outlineOffset: -2, position: 'relative',
                        zIndex: isHovered ? 10 : 1,
                        opacity: hovered && !isHighlighted ? 0.38 : 1,
                        transition: 'opacity 0.15s',
                        borderBottom: i < n - 1 ? '1px solid rgba(0,0,0,0.18)' : 'none',
                        borderRight: j < i ? '1px solid rgba(0,0,0,0.18)' : 'none',
                      }}
                    >
                      <span style={{ color: isDiag ? '#fff' : text, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, userSelect: 'none', opacity: isDiag ? 1 : pct === 0 ? 0 : 1 }}>
                        {isDiag ? '—' : pct > 0 ? `${pct}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <span style={{ color: '#8892b0', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>0%</span>
        <div style={{ display: 'flex', height: 12, width: 160, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(99,120,175,0.15)' }}>
          {Array.from({ length: 20 }, (_, k) => (
            <div key={`legend-${k}`} style={{ flex: 1, background: cellColor(k / 19).bg }} />
          ))}
        </div>
        <span style={{ color: '#8892b0', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>100%</span>
        <div style={{ marginLeft: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#5a7cf8' }} />
          <span style={{ color: '#8892b0', fontSize: '0.72rem' }}>diagonal (mesmo card)</span>
        </div>
        <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#8892b0', fontSize: '0.72rem' }}>↑ ordenado por cluster</span>
        </div>
      </div>
    </div>
  );
}
