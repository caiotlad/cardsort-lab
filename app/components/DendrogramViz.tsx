import { useMemo } from 'react';
import { DendrogramNode } from '../data/mockData';

interface Props {
  node: DendrogramNode;
  cards: { id: string; text: string }[];
}

interface LeafPosition {
  label: string;
  y: number;
}

interface EdgeSpec {
  x1: number; y1: number;
  x2: number; y2: number;
  similarity: number;
}

interface MergeLabel {
  x: number; y: number;
  similarity: number;
}

function collectLeaves(node: DendrogramNode, out: string[]) {
  if (!node.children) {
    out.push(node.label!);
    return;
  }
  for (const child of node.children) collectLeaves(child, out);
}

function layoutTree(
  node: DendrogramNode,
  leafYMap: Record<string, number>,
  maxDist: number,
  drawWidth: number,
  edges: EdgeSpec[],
  mergeLabels: MergeLabel[],
): { x: number; y: number } {
  // x = distance from left; distance = (1 - similarity)
  // leaves at x = 0, root at x = maxDist
  const dist = (1 - Math.max(0, Math.min(1, node.similarity)));
  const x = (dist / maxDist) * drawWidth;

  if (!node.children) {
    const y = leafYMap[node.label!] ?? 0;
    return { x, y };
  }

  const childPositions = node.children.map(c =>
    layoutTree(c, leafYMap, maxDist, drawWidth, edges, mergeLabels)
  );

  const ys = childPositions.map(p => p.y);
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2;

  // Vertical line connecting all children at this x
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  edges.push({ x1: x, y1: minY, x2: x, y2: maxY, similarity: node.similarity });

  // Horizontal lines from each child to this node
  for (const cp of childPositions) {
    edges.push({ x1: cp.x, y1: cp.y, x2: x, y2: cp.y, similarity: node.similarity });
  }

  mergeLabels.push({ x, y: midY, similarity: node.similarity });

  return { x, y: midY };
}

function mergeColor(similarity: number): string {
  // low similarity = red-ish, high = blue-ish
  if (similarity >= 0.75) return '#22c88a';
  if (similarity >= 0.5) return '#5a7cf8';
  if (similarity >= 0.25) return '#f59e0b';
  return '#fb7185';
}

export function DendrogramChart({ node, cards }: Props) {
  const LEAF_SPACING = 34;
  const LABEL_W = 152;
  const RIGHT_PAD = 40;
  const TOP_PAD = 16;
  const AXIS_H = 32;

  const leaves = useMemo(() => {
    const arr: string[] = [];
    collectLeaves(node, arr);
    return arr;
  }, [node]);

  const height = leaves.length * LEAF_SPACING + TOP_PAD + AXIS_H;
  const drawWidth = 480; // width of the dendrogram drawing area (excluding label)
  const totalWidth = LABEL_W + drawWidth + RIGHT_PAD;

  const leafYMap: Record<string, number> = {};
  leaves.forEach((label, i) => {
    leafYMap[label] = TOP_PAD + i * LEAF_SPACING + LEAF_SPACING / 2;
  });

  // Find max distance among all nodes
  const allDistances: number[] = [];
  function collectDistances(n: DendrogramNode) {
    if (n.children) {
      allDistances.push(1 - Math.max(0, Math.min(1, n.similarity)));
      n.children.forEach(collectDistances);
    }
  }
  collectDistances(node);
  const maxDist = Math.max(...allDistances, 0.05);

  const edges: EdgeSpec[] = [];
  const mergeLabels: MergeLabel[] = [];
  layoutTree(node, leafYMap, maxDist, drawWidth, edges, mergeLabels);

  // Axis ticks at similarity values (show similarity, not distance)
  const axisTicks = [1, 0.75, 0.5, 0.25, 0].map(sim => {
    const dist = (1 - sim);
    const x = LABEL_W + (dist / maxDist) * drawWidth;
    return { sim, x, valid: dist <= maxDist + 0.001 };
  }).filter(t => t.valid && t.x <= totalWidth - RIGHT_PAD + 10);

  return (
    <div>
      <p style={{ color: '#8892b0', fontSize: '0.78rem', marginBottom: 16, lineHeight: 1.5 }}>
        Cards agrupados na mesma ramificação foram frequentemente organizados juntos.
        Ramificações à esquerda (
        <span style={{ color: '#22c88a', fontWeight: 600 }}>verde</span>
        ) indicam alta similaridade; à direita (
        <span style={{ color: '#fb7185', fontWeight: 600 }}>vermelho</span>
        ) indicam baixa concordância.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={totalWidth}
          height={height}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Background strip for the drawing area */}
          <rect x={LABEL_W} y={0} width={drawWidth} height={height - AXIS_H} fill="rgba(13,17,23,0.5)" rx={4} />

          {/* Vertical grid lines at axis ticks */}
          {axisTicks.map(({ sim, x }) => (
            <line
              key={`grid-${sim}`}
              x1={x} y1={TOP_PAD}
              x2={x} y2={height - AXIS_H}
              stroke="rgba(99,120,175,0.12)"
              strokeWidth={1}
              strokeDasharray={sim === 1 ? '0' : '4 3'}
            />
          ))}

          {/* Edges */}
          {edges.map((e, idx) => (
            <line
              key={`edge-${idx}-${Math.round(e.x1)}-${Math.round(e.y1)}-${Math.round(e.x2)}-${Math.round(e.y2)}`}
              x1={LABEL_W + e.x1}
              y1={e.y1}
              x2={LABEL_W + e.x2}
              y2={e.y2}
              stroke={mergeColor(e.similarity)}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}

          {/* Leaf dots */}
          {leaves.map((label, i) => (
            <circle
              key={`dot-${label}`}
              cx={LABEL_W + 0}
              cy={leafYMap[label]}
              r={3}
              fill={mergeColor(1)}
            />
          ))}

          {/* Leaf labels (right-aligned, left of drawing area) */}
          {leaves.map((label, i) => {
            const y = leafYMap[label];
            return (
              <text
                key={`label-${label}`}
                x={LABEL_W - 10}
                y={y + 4}
                textAnchor="end"
                fill="#c8d0e0"
                fontSize={11}
                fontFamily="var(--font-mono)"
              >
                {label.length > 18 ? label.slice(0, 18) + '…' : label}
              </text>
            );
          })}

          {/* Merge similarity badges */}
          {mergeLabels.map((ml, idx) => {
            const pct = Math.round(ml.similarity * 100);
            const bx = LABEL_W + ml.x + 4;
            const by = ml.y;
            return (
              <g key={`merge-${idx}-${Math.round(ml.x)}-${Math.round(ml.y)}`}>
                <rect
                  x={bx}
                  y={by - 8}
                  width={30}
                  height={16}
                  rx={4}
                  fill="rgba(22,28,45,0.92)"
                  stroke={mergeColor(ml.similarity)}
                  strokeWidth={1}
                />
                <text
                  x={bx + 15}
                  y={by + 4}
                  textAnchor="middle"
                  fill={mergeColor(ml.similarity)}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Axis line */}
          <line
            x1={LABEL_W}
            y1={height - AXIS_H}
            x2={LABEL_W + drawWidth}
            y2={height - AXIS_H}
            stroke="rgba(99,120,175,0.3)"
            strokeWidth={1}
          />

          {/* Axis ticks and labels */}
          {axisTicks.map(({ sim, x }) => (
            <g key={`tick-${sim}`}>
              <line
                x1={x} y1={height - AXIS_H}
                x2={x} y2={height - AXIS_H + 6}
                stroke="rgba(99,120,175,0.5)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - AXIS_H + 18}
                textAnchor="middle"
                fill="#8892b0"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                {Math.round(sim * 100)}%
              </text>
            </g>
          ))}

          {/* Axis label */}
          <text
            x={LABEL_W + drawWidth / 2}
            y={height}
            textAnchor="middle"
            fill="rgba(136,146,176,0.5)"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            similaridade de agrupamento →
          </text>

          {/* Color legend */}
          {[
            { label: '≥75%', color: '#22c88a' },
            { label: '50–75%', color: '#5a7cf8' },
            { label: '25–50%', color: '#f59e0b' },
            { label: '<25%', color: '#fb7185' },
          ].map((item, k) => (
            <g key={`legend-${item.label}`} transform={`translate(${LABEL_W + drawWidth + 8}, ${TOP_PAD + k * 20})`}>
              <rect x={0} y={-6} width={14} height={12} rx={3} fill={item.color} opacity={0.85} />
              <text x={18} y={4} fill="#8892b0" fontSize={9} fontFamily="var(--font-mono)">{item.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
