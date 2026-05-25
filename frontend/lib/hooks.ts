/**
 * PrepPilot Data Hooks — TanStack Query hooks for all dashboard data.
 * All components use these hooks to fetch real data from the backend.
 */
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCustomProblem,
  fetchDashboard,
  fetchHermesStatus,
  fetchProblem,
  fetchProblems,
  fetchSession,
  fetchSessions,
  fetchUserStats,
  rateSessionFeedback,
  startProblem,
  submitSolution,
  updateUserSettings,
  type DashboardData,
  type HermesStatus,
  type Problem,
  type ProblemListResponse,
  type Session,
  type SessionListResponse,
  type UserStats,
} from './api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// ─── Dashboard (all-in-one) ──────────────────────────────────────────────────

export function useDashboard(userId: string | undefined) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', userId],
    queryFn: () => fetchDashboard(userId!),
    enabled: !!userId,
    staleTime: 30_000, // 30s
    retry: 1,
  })
}

// ─── Problems list ───────────────────────────────────────────────────────────

export function useProblems(params?: {
  topic?: string
  difficulty?: string
  status?: string
  user_id?: string
  page?: number
  per_page?: number
}) {
  return useQuery<ProblemListResponse>({
    queryKey: ['problems', params],
    queryFn: () => fetchProblems(params),
    staleTime: 60_000,
  })
}

export function useProblem(problemId: string | undefined, userId?: string) {
  return useQuery<Problem>({
    queryKey: ['problem', problemId, userId],
    queryFn: () => fetchProblem(problemId!, userId),
    enabled: !!problemId,
    staleTime: 60_000,
  })
}

// ─── Sessions list ───────────────────────────────────────────────────────────

export function useSessions(userId: string | undefined, params?: {
  topic?: string
  page?: number
}) {
  return useQuery<SessionListResponse>({
    queryKey: ['sessions', userId, params],
    queryFn: () => fetchSessions(userId!, params),
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    staleTime: 15_000,
  })
}

// ─── User stats ──────────────────────────────────────────────────────────────

export function useUserStats(userId: string | undefined) {
  return useQuery<UserStats>({
    queryKey: ['userStats', userId],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  })
}

// ─── User profile ────────────────────────────────────────────────────────────

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/${userId}`)
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useHermesStatus() {
  return useQuery<HermesStatus>({
    queryKey: ['hermesStatus'],
    queryFn: fetchHermesStatus,
    staleTime: 30_000,
    retry: 1,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useUpdateSettings(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateUserSettings(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
    },
  })
}

export function useSubmitSolution() {
  const queryClient = useQueryClient()
  return useMutation<Session, Error, {
    sessionId: string
    solution: string
    language?: string
    timeTakenMinutes?: number
  }>({
    mutationFn: async ({ sessionId, solution, language, timeTakenMinutes }: {
      sessionId: string
      solution: string
      language?: string
      timeTakenMinutes?: number
    }) => {
      return submitSolution(sessionId, {
        user_solution: solution,
        language: language || 'python',
        time_taken_minutes: timeTakenMinutes,
      })
    },
    onSuccess: () => {
      // Refresh all dashboard data after submission
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })
}

export function useRateFeedback() {
  const queryClient = useQueryClient()
  return useMutation<Session, Error, {
    sessionId: string
    rating: number
    difficultyFelt?: 'too_easy' | 'right' | 'too_hard'
  }>({
    mutationFn: ({ sessionId, rating, difficultyFelt }) => rateSessionFeedback(sessionId, {
      explanation_helpful: rating,
      difficulty_felt: difficultyFelt,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })
}

export function useRequestProblem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      // Step 1: Call the problem selection endpoint
      const probRes = await fetch(`${API_BASE}/problems/today/${userId}`)
      if (!probRes.ok) throw new Error('No problems available')
      const problem = await probRes.json()

      // Step 2: Create a session for this problem
      const sessionRes = await fetch(`${API_BASE}/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          problem_id: problem.id,
          selected_by_skill_version: problem.selected_by_skill_version || '1.0',
        }),
      })
      if (!sessionRes.ok) throw new Error('Failed to create session')
      return sessionRes.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useStartProblem() {
  const queryClient = useQueryClient()
  return useMutation<Session, Error, { problemId: string; userId: string }>({
    mutationFn: ({ problemId, userId }) => startProblem(problemId, userId),
    onSuccess: session => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session', session.id] })
    },
  })
}

export function useCreateCustomProblem() {
  const queryClient = useQueryClient()
  return useMutation<Problem, Error, {
    user_id: string
    title: string
    difficulty: string
    topic: string
    sub_topic?: string
    description: string
    examples?: Array<{ input: string; output: string }>
    constraints?: string[]
    hints?: string[]
    source_url?: string
    tags?: string[]
  }>({
    mutationFn: createCustomProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
    },
  })
}
