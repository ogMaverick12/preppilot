/**
 * PrepPilot API Client — TanStack Query hooks for backend connectivity.
 * Falls back to mock data when backend is unavailable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Generic fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────

export interface DashboardData {
  user: { id: string; name: string; timezone: string; streak: number };
  week_summary: {
    problems_sent: number;
    problems_solved: number;
    avg_score: number;
    streak: number;
    score_delta: number;
  };
  today_problem: {
    session_id: string;
    id: string;
    title: string;
    difficulty: string;
    topic: string;
    sub_topic?: string;
    description: string;
    hints: string[];
    estimated_minutes: string;
    status: string;
    selection_reason: string;
    sent_at?: string;
    selected_by_skill_version?: string;
  } | null;
  assessment?: {
    status: string;
    completed_sessions: number;
    required_sessions: number;
    hermes_level: string;
  };
  hermes?: {
    mode: string;
    backend: string;
    inference_mode: string;
  };
  radar: Array<{ topic: string; key: string; score: number; attempts: number }>;
  trend: Array<{ date: string; score: number; topic: string }>;
  skills: Array<{
    skill: string;
    version: string;
    date: string;
    summary: string;
    trigger: string;
    trigger_detail: string;
    content: string;
    isLatest: boolean;
  }>;
}

export async function fetchDashboard(userId: string): Promise<DashboardData> {
  return apiFetch<DashboardData>(`/dashboard/${userId}`);
}

// ─── Problems ───────────────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  topic: string;
  sub_topic?: string;
  description: string;
  examples: Array<{ input: string; output: string }>;
  constraints: string[];
  hints: string[];
  solution_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
  source_url?: string;
  tags?: string[];
  owner_user_id?: string | null;
  is_custom?: boolean;
  your_score?: number;
  status: string;
  estimated_minutes?: string;
}

export interface ProblemListResponse {
  problems: Problem[];
  total: number;
  page: number;
  per_page: number;
}

export async function fetchProblems(params?: {
  topic?: string;
  difficulty?: string;
  status?: string;
  user_id?: string;
  page?: number;
  per_page?: number;
}): Promise<ProblemListResponse> {
  const qs = new URLSearchParams();
  if (params?.topic) qs.set('topic', params.topic);
  if (params?.difficulty) qs.set('difficulty', params.difficulty);
  if (params?.status) qs.set('status', params.status);
  if (params?.user_id) qs.set('user_id', params.user_id);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  return apiFetch<ProblemListResponse>(`/problems/?${qs.toString()}`);
}

export async function fetchProblem(problemId: string, userId?: string): Promise<Problem> {
  const qs = new URLSearchParams();
  if (userId) qs.set('user_id', userId);
  return apiFetch<Problem>(`/problems/${problemId}?${qs.toString()}`);
}

export async function startProblem(problemId: string, userId: string): Promise<Session> {
  return apiFetch<Session>(`/problems/${problemId}/start`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function createCustomProblem(data: {
  user_id: string;
  title: string;
  difficulty: string;
  topic: string;
  sub_topic?: string;
  description: string;
  examples?: Array<{ input: string; output: string }>;
  constraints?: string[];
  hints?: string[];
  source_url?: string;
  tags?: string[];
}): Promise<Problem> {
  return apiFetch<Problem>('/problems/custom', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Sessions ───────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  user_id: string;
  problem_id: string;
  problem_title?: string;
  problem_topic?: string;
  problem_difficulty?: string;
  score?: number;
  score_breakdown?: { correctness: number; complexity: number; edge_cases: number; style: number };
  status: string;
  hermes_feedback?: string;
  user_solution?: string;
  language?: string;
  explanation_helpful?: number;
  difficulty_felt?: string;
  created_at: string;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
  page: number;
}

export async function fetchSessions(userId: string, params?: {
  topic?: string;
  page?: number;
}): Promise<SessionListResponse> {
  const qs = new URLSearchParams();
  if (params?.topic) qs.set('topic', params.topic);
  if (params?.page) qs.set('page', String(params.page));
  return apiFetch<SessionListResponse>(`/sessions/${userId}?${qs.toString()}`);
}

export async function fetchActiveSession(userId: string): Promise<Session> {
  return apiFetch<Session>(`/sessions/active/${userId}`);
}

export async function fetchSession(sessionId: string): Promise<Session> {
  return apiFetch<Session>(`/sessions/detail/${sessionId}`);
}

export async function submitSolution(sessionId: string, data: {
  user_solution: string;
  language?: string;
  time_taken_minutes?: number;
}): Promise<Session> {
  return apiFetch<Session>(`/sessions/${sessionId}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function rateSessionFeedback(sessionId: string, data: {
  explanation_helpful: number;
  difficulty_felt?: 'too_easy' | 'right' | 'too_hard';
}): Promise<Session> {
  return apiFetch<Session>(`/sessions/${sessionId}/feedback`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── User ───────────────────────────────────────────────────────────────────────

export interface UserStats {
  total_sessions: number;
  total_solved: number;
  total_attempted: number;
  total_skipped: number;
  average_score: number;
  best_score: number;
  current_streak: number;
  longest_streak: number;
  improvement_since_start: number;
  best_topic?: string;
  weakest_topic?: string;
  problems_this_week: number;
  avg_score_this_week: number;
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  return apiFetch<UserStats>(`/users/${userId}/stats`);
}

export async function updateUserSettings(userId: string, data: Record<string, unknown>): Promise<void> {
  await apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Hermes ────────────────────────────────────────────────────────────────────

export interface HermesStatus {
  mode: string;
  backend: string;
  database: {
    url_kind: string;
    memory_ready: boolean;
    coaching_profiles: number;
    topic_stats: number;
  };
  skills: Record<string, string>;
  hosted_inference: {
    provider: string;
    connected: boolean;
    model: string;
    mode: string;
  };
  telegram: { configured: boolean };
  wsl_hermes?: {
    runtime: string;
    distro: string;
    command_path: string;
    version?: string | null;
    connected: boolean;
    message: string;
  };
  status: string;
  issues: string[];
}

export async function fetchHermesStatus(): Promise<HermesStatus> {
  return apiFetch<HermesStatus>('/hermes/status');
}
