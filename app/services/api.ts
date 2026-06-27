import type { Session, Study } from '../data/mockData';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface StudyDraft {
  name: string;
  description: string;
  type: Study['type'];
  instructions: string;
  cards: Array<{ id?: string; text: string; expectedCategoryId?: string }>;
  categories: Array<{ id?: string; name: string; fixed: boolean; color: string }>;
  accessMode?: 'link' | 'code' | 'login';
  dashboardPrivate?: boolean;
  allowUncertainCategory?: boolean;
  timerEnabled?: boolean;
}

export interface ParticipantProfile {
  area?: string;
  experience?: string;
  familiarity?: string;
  notes?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ${response.status} ao acessar o servidor.`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  me: () => request<AuthUser>('/auth/me'),
  login: (email: string, password: string) =>
    request<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    request<AuthUser>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  studies: () => request<Study[]>('/studies'),
  createStudy: (study: StudyDraft) =>
    request<Study>('/studies', { method: 'POST', body: JSON.stringify(study) }),
  deleteStudy: (id: string) => request<void>(`/studies/${id}`, { method: 'DELETE' }),
  setPrivacy: (id: string, isPrivate: boolean) =>
    request<Study>(`/studies/${id}/privacy`, { method: 'PATCH', body: JSON.stringify({ isPrivate }) }),
  publicStudy: (id: string, token: string) =>
    request<Study>(`/public/studies/${id}?token=${encodeURIComponent(token)}`),
  publicStudyByCode: (code: string) =>
    request<Study>(`/public/studies/by-code/${encodeURIComponent(code)}`),
  startSession: (id: string, token: string, participantName: string, participantEmail?: string, code?: string, profile?: ParticipantProfile, consentAccepted = false) =>
    request<{ sessionId: string; study: Study; draft: unknown; startedAt: string }>(
      `/public/studies/${id}/sessions?token=${encodeURIComponent(token)}`,
      { method: 'POST', body: JSON.stringify({ participantName, participantEmail, code, profile, consentAccepted }) },
    ),
  resumeSession: (sessionId: string, token: string, code?: string) =>
    request<{ sessionId: string; study: Study; draft: { placements?: Record<string, string>; categories?: Study['categories'] }; startedAt: string }>(
      `/public/sessions/${sessionId}?token=${encodeURIComponent(token)}&code=${encodeURIComponent(code || '')}`,
    ),
  saveDraft: (sessionId: string, placements: Record<string, string>, categories: Study['categories']) =>
    request<void>(`/public/sessions/${sessionId}/draft`, {
      method: 'PUT',
      body: JSON.stringify({ placements, categories }),
    }),
  completeSession: (sessionId: string, groups: Session['groups'], timeSpent: number) =>
    request<Session>(`/public/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ groups, timeSpent }),
    }),
};
