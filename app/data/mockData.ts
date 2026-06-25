export type SortingType = 'open' | 'closed' | 'hybrid';

export interface Card {
  id: string;
  text: string;
  expectedCategoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  fixed: boolean;
  color: string;
}

export interface SessionGroup {
  categoryId: string;
  categoryName: string;
  cardIds: string[];
}

export interface Session {
  id: string;
  participantId: string;
  participantName: string;
  completedAt: string;
  timeSpent: number;
  groups: SessionGroup[];
}

export interface Study {
  id: string;
  name: string;
  description: string;
  type: SortingType;
  isPrivate?: boolean;
  accessMode?: 'link' | 'code' | 'login';
  accessCode?: string;
  shareToken?: string;
  allowUncertainCategory?: boolean;
  timerEnabled?: boolean;
  status?: 'draft' | 'published' | 'archived';
  cards: Card[];
  categories: Category[];
  instructions: string;
  createdAt: string;
  sessions: Session[];
}

const categoryColors = [
  '#5a7cf8', '#22c88a', '#f59e0b', '#a78bfa',
  '#fb7185', '#38bdf8', '#f97316', '#84cc16',
];

export const studies: Study[] = [
  {
    id: 'study-1',
    name: 'Navegação E-commerce',
    description: 'Descobrir como usuários organizam itens de um site de compras.',
    type: 'open',
    instructions: 'Agrupe os cartões abaixo da forma que fizer mais sentido para você. Crie grupos livremente, nomeie-os como preferir e mova os cartões entre eles.',
    createdAt: '2026-05-10',
    cards: [
      { id: 'c1', text: 'Página Inicial' },
      { id: 'c2', text: 'Meu Carrinho' },
      { id: 'c3', text: 'Minha Conta' },
      { id: 'c4', text: 'Pedidos' },
      { id: 'c5', text: 'Favoritos' },
      { id: 'c6', text: 'Promoções' },
      { id: 'c7', text: 'Ajuda' },
      { id: 'c8', text: 'Contato' },
      { id: 'c9', text: 'Rastreamento' },
      { id: 'c10', text: 'Avaliações' },
      { id: 'c11', text: 'Configurações' },
      { id: 'c12', text: 'Busca' },
      { id: 'c13', text: 'Categorias' },
      { id: 'c14', text: 'Notificações' },
      { id: 'c15', text: 'Pagamento' },
    ],
    categories: [],
    sessions: [
      {
        id: 's1-1', participantId: 'p1', participantName: 'Ana Lima',
        completedAt: '2026-05-12T10:30:00', timeSpent: 342,
        groups: [
          { categoryId: 'g1', categoryName: 'Compras', cardIds: ['c2', 'c3', 'c4', 'c15', 'c9'] },
          { categoryId: 'g2', categoryName: 'Descoberta', cardIds: ['c1', 'c6', 'c13', 'c12'] },
          { categoryId: 'g3', categoryName: 'Suporte', cardIds: ['c7', 'c8', 'c11'] },
          { categoryId: 'g4', categoryName: 'Social', cardIds: ['c5', 'c10', 'c14'] },
        ],
      },
      {
        id: 's1-2', participantId: 'p2', participantName: 'Bruno Carvalho',
        completedAt: '2026-05-13T14:15:00', timeSpent: 418,
        groups: [
          { categoryId: 'g5', categoryName: 'Minha Área', cardIds: ['c3', 'c4', 'c5', 'c11', 'c14'] },
          { categoryId: 'g6', categoryName: 'Loja', cardIds: ['c1', 'c2', 'c6', 'c12', 'c13', 'c15'] },
          { categoryId: 'g7', categoryName: 'Ajuda', cardIds: ['c7', 'c8', 'c9', 'c10'] },
        ],
      },
      {
        id: 's1-3', participantId: 'p3', participantName: 'Carla Santos',
        completedAt: '2026-05-14T09:00:00', timeSpent: 275,
        groups: [
          { categoryId: 'g8', categoryName: 'Navegação', cardIds: ['c1', 'c12', 'c13'] },
          { categoryId: 'g9', categoryName: 'Pedidos e Pagamento', cardIds: ['c2', 'c4', 'c9', 'c15'] },
          { categoryId: 'g10', categoryName: 'Conta', cardIds: ['c3', 'c5', 'c11', 'c14'] },
          { categoryId: 'g11', categoryName: 'Ofertas', cardIds: ['c6', 'c10'] },
          { categoryId: 'g12', categoryName: 'Suporte', cardIds: ['c7', 'c8'] },
        ],
      },
      {
        id: 's1-4', participantId: 'p4', participantName: 'Diego Mendes',
        completedAt: '2026-05-15T16:45:00', timeSpent: 390,
        groups: [
          { categoryId: 'g13', categoryName: 'Pessoal', cardIds: ['c3', 'c4', 'c5', 'c11'] },
          { categoryId: 'g14', categoryName: 'Compras', cardIds: ['c2', 'c6', 'c12', 'c13', 'c15'] },
          { categoryId: 'g15', categoryName: 'Rastreio e Entrega', cardIds: ['c9', 'c14'] },
          { categoryId: 'g16', categoryName: 'Informação', cardIds: ['c1', 'c7', 'c8', 'c10'] },
        ],
      },
      {
        id: 's1-5', participantId: 'p5', participantName: 'Elena Ferreira',
        completedAt: '2026-05-16T11:00:00', timeSpent: 310,
        groups: [
          { categoryId: 'g17', categoryName: 'Usuário', cardIds: ['c3', 'c5', 'c11', 'c14'] },
          { categoryId: 'g18', categoryName: 'Transação', cardIds: ['c2', 'c4', 'c15', 'c9'] },
          { categoryId: 'g19', categoryName: 'Descoberta', cardIds: ['c1', 'c6', 'c10', 'c12', 'c13'] },
          { categoryId: 'g20', categoryName: 'Suporte', cardIds: ['c7', 'c8'] },
        ],
      },
    ],
  },
  {
    id: 'study-2',
    name: 'App de Saúde',
    description: 'Avaliação da arquitetura de informação de um aplicativo de saúde.',
    type: 'closed',
    instructions: 'Aloque cada cartão na categoria que você considera mais adequada. Cada cartão deve ir para exatamente uma categoria.',
    createdAt: '2026-05-20',
    cards: [
      { id: 'h1', text: 'Agendar Consulta' },
      { id: 'h2', text: 'Ver Resultados de Exames' },
      { id: 'h3', text: 'Renovar Receita' },
      { id: 'h4', text: 'Cartão de Vacinação' },
      { id: 'h5', text: 'Histórico Médico' },
      { id: 'h6', text: 'Lembretes de Medicamento' },
      { id: 'h7', text: 'Pronto-socorro' },
      { id: 'h8', text: 'Meu Plano de Saúde' },
      { id: 'h9', text: 'Pagar Consulta' },
      { id: 'h10', text: 'Teleconsulta' },
      { id: 'h11', text: 'Solicitar Exame' },
      { id: 'h12', text: 'Atestado Médico' },
    ],
    categories: [
      { id: 'cat1', name: 'Prevenção e Histórico', fixed: true, color: categoryColors[0] },
      { id: 'cat2', name: 'Consultas e Exames', fixed: true, color: categoryColors[1] },
      { id: 'cat3', name: 'Financeiro e Plano', fixed: true, color: categoryColors[2] },
      { id: 'cat4', name: 'Urgências', fixed: true, color: categoryColors[3] },
    ],
    sessions: [
      {
        id: 's2-1', participantId: 'p6', participantName: 'Fabio Alves',
        completedAt: '2026-05-22T10:00:00', timeSpent: 220,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5', 'h6'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h3', 'h10', 'h11', 'h12'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h7'] },
        ],
      },
      {
        id: 's2-2', participantId: 'p7', participantName: 'Gisele Rodrigues',
        completedAt: '2026-05-23T14:30:00', timeSpent: 185,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5', 'h6', 'h12'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h3', 'h10', 'h11'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h7'] },
        ],
      },
      {
        id: 's2-3', participantId: 'p8', participantName: 'Heitor Costa',
        completedAt: '2026-05-24T09:45:00', timeSpent: 295,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h3', 'h6', 'h10', 'h11', 'h12'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h7'] },
        ],
      },
      {
        id: 's2-4', participantId: 'p9', participantName: 'Inês Oliveira',
        completedAt: '2026-05-25T15:00:00', timeSpent: 162,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5', 'h6'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h3', 'h10', 'h11'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9', 'h12'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h7'] },
        ],
      },
      {
        id: 's2-5', participantId: 'p10', participantName: 'João Paulo',
        completedAt: '2026-05-26T11:20:00', timeSpent: 248,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5', 'h6', 'h12'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h11', 'h10'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h3', 'h7'] },
        ],
      },
      {
        id: 's2-6', participantId: 'p11', participantName: 'Kátia Nunes',
        completedAt: '2026-05-27T13:00:00', timeSpent: 198,
        groups: [
          { categoryId: 'cat1', categoryName: 'Prevenção e Histórico', cardIds: ['h4', 'h5'] },
          { categoryId: 'cat2', categoryName: 'Consultas e Exames', cardIds: ['h1', 'h2', 'h3', 'h6', 'h10', 'h11', 'h12'] },
          { categoryId: 'cat3', categoryName: 'Financeiro e Plano', cardIds: ['h8', 'h9'] },
          { categoryId: 'cat4', categoryName: 'Urgências', cardIds: ['h7'] },
        ],
      },
    ],
  },
  {
    id: 'study-3',
    name: 'Portal Corporativo',
    description: 'Organização da intranet de uma empresa de médio porte.',
    type: 'hybrid',
    instructions: 'Use as categorias pré-definidas para organizar os cartões. Se necessário, crie novas categorias para itens que não se encaixem nas existentes.',
    createdAt: '2026-06-01',
    cards: [
      { id: 'p1', text: 'Gestão de RH' },
      { id: 'p2', text: 'Folha de Pagamento' },
      { id: 'p3', text: 'Suporte de TI' },
      { id: 'p4', text: 'Conformidade Legal' },
      { id: 'p5', text: 'Projetos em Andamento' },
      { id: 'p6', text: 'Relatórios Executivos' },
      { id: 'p7', text: 'Comunicados Internos' },
      { id: 'p8', text: 'Benefícios' },
      { id: 'p9', text: 'Solicitação de Férias' },
      { id: 'p10', text: 'Treinamentos' },
      { id: 'p11', text: 'Orçamento do Departamento' },
      { id: 'p12', text: 'Avaliação de Desempenho' },
    ],
    categories: [
      { id: 'cp1', name: 'Administrativo', fixed: true, color: categoryColors[0] },
      { id: 'cp2', name: 'Operacional', fixed: true, color: categoryColors[1] },
    ],
    sessions: [
      {
        id: 's3-1', participantId: 'p12', participantName: 'Luís Machado',
        completedAt: '2026-06-03T10:00:00', timeSpent: 305,
        groups: [
          { categoryId: 'cp1', categoryName: 'Administrativo', cardIds: ['p1', 'p2', 'p4', 'p6', 'p8', 'p9', 'p11', 'p12'] },
          { categoryId: 'cp2', categoryName: 'Operacional', cardIds: ['p3', 'p5', 'p7', 'p10'] },
        ],
      },
      {
        id: 's3-2', participantId: 'p13', participantName: 'Marina Souza',
        completedAt: '2026-06-04T14:00:00', timeSpent: 420,
        groups: [
          { categoryId: 'cp1', categoryName: 'Administrativo', cardIds: ['p1', 'p2', 'p4', 'p8', 'p9', 'p12'] },
          { categoryId: 'cp2', categoryName: 'Operacional', cardIds: ['p3', 'p5', 'p7', 'p10'] },
          { categoryId: 'new1', categoryName: 'Estratégico', cardIds: ['p6', 'p11'] },
        ],
      },
      {
        id: 's3-3', participantId: 'p14', participantName: 'Nelson Pereira',
        completedAt: '2026-06-05T09:30:00', timeSpent: 355,
        groups: [
          { categoryId: 'cp1', categoryName: 'Administrativo', cardIds: ['p1', 'p2', 'p4', 'p8', 'p9', 'p11', 'p12'] },
          { categoryId: 'cp2', categoryName: 'Operacional', cardIds: ['p3', 'p5', 'p10'] },
          { categoryId: 'new2', categoryName: 'Comunicação', cardIds: ['p6', 'p7'] },
        ],
      },
      {
        id: 's3-4', participantId: 'p15', participantName: 'Olivia Teixeira',
        completedAt: '2026-06-06T16:00:00', timeSpent: 278,
        groups: [
          { categoryId: 'cp1', categoryName: 'Administrativo', cardIds: ['p1', 'p2', 'p4', 'p6', 'p8', 'p9', 'p11', 'p12'] },
          { categoryId: 'cp2', categoryName: 'Operacional', cardIds: ['p3', 'p5', 'p7', 'p10'] },
        ],
      },
    ],
  },
];

// Compute similarity matrix: for each pair of cards, frequency co-grouped / total sessions
export function computeSimilarityMatrix(study: Study): number[][] {
  const cards = study.cards;
  const n = cards.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const total = study.sessions.length;

  if (total === 0) return matrix;

  for (const session of study.sessions) {
    for (const group of session.groups) {
      for (let i = 0; i < group.cardIds.length; i++) {
        for (let j = i + 1; j < group.cardIds.length; j++) {
          const ci = cards.findIndex(c => c.id === group.cardIds[i]);
          const cj = cards.findIndex(c => c.id === group.cardIds[j]);
          if (ci >= 0 && cj >= 0) {
            matrix[ci][cj] += 1;
            matrix[cj][ci] += 1;
          }
        }
      }
    }
  }

  // Normalize to 0-1
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) matrix[i][j] = 1;
      else matrix[i][j] = matrix[i][j] / total;
    }
  }

  return matrix;
}

// Compute category allocation for closed/hybrid
export function computeCategoryAllocation(study: Study): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  const total = study.sessions.length;
  if (total === 0) return result;

  for (const card of study.cards) {
    result[card.id] = {};
    for (const cat of study.categories) {
      result[card.id][cat.id] = 0;
    }
  }

  for (const session of study.sessions) {
    for (const group of session.groups) {
      for (const cardId of group.cardIds) {
        if (result[cardId] && result[cardId][group.categoryId] !== undefined) {
          result[cardId][group.categoryId] += 1 / total;
        }
      }
    }
  }

  return result;
}

// Compute agreement index (average pairwise similarity)
export function computeAgreementIndex(matrix: number[][]): number {
  const n = matrix.length;
  if (n <= 1) return 1;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      sum += matrix[i][j];
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

// Get category name frequency for open sorting
export function computeCategoryNameFrequency(study: Study): Array<{ name: string; count: number }> {
  const freq: Record<string, number> = {};
  for (const session of study.sessions) {
    for (const group of session.groups) {
      const normalized = group.categoryName.toLowerCase().trim();
      freq[normalized] = (freq[normalized] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Simple hierarchical clustering for dendrogram
export interface DendrogramNode {
  id: string;
  label?: string;
  children?: DendrogramNode[];
  similarity: number;
}

export function buildDendrogram(cards: Card[], matrix: number[][]): DendrogramNode {
  // Single-linkage hierarchical clustering
  type Cluster = { ids: number[]; label: string };
  const clusters: Cluster[] = cards.map((c, i) => ({ ids: [i], label: c.text }));

  const getSimilarity = (a: Cluster, b: Cluster): number => {
    let maxSim = 0;
    for (const ai of a.ids) {
      for (const bi of b.ids) {
        if (ai !== bi) maxSim = Math.max(maxSim, matrix[ai][bi]);
      }
    }
    return maxSim;
  };

  // Keep merging until one cluster
  const nodes: DendrogramNode[] = cards.map((c, i) => ({
    id: `leaf-${i}`,
    label: c.text,
    similarity: 1,
  }));

  const clusterNodes: DendrogramNode[] = [...nodes];

  while (clusters.length > 1) {
    let maxSim = -1;
    let mergeI = 0;
    let mergeJ = 1;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sim = getSimilarity(clusters[i], clusters[j]);
        if (sim > maxSim) {
          maxSim = sim;
          mergeI = i;
          mergeJ = j;
        }
      }
    }

    const newNode: DendrogramNode = {
      id: `node-${clusters.length}`,
      similarity: maxSim,
      children: [clusterNodes[mergeI], clusterNodes[mergeJ]],
    };

    const newCluster: Cluster = {
      ids: [...clusters[mergeI].ids, ...clusters[mergeJ].ids],
      label: '',
    };

    clusterNodes.splice(mergeJ, 1);
    clusterNodes.splice(mergeI, 1, newNode);
    clusters.splice(mergeJ, 1);
    clusters.splice(mergeI, 1, newCluster);
  }

  return clusterNodes[0];
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
