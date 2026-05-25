import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'
  if (score >= 75) return '#84cc16'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'rgba(34,197,94,0.12)'
  if (score >= 75) return 'rgba(132,204,22,0.12)'
  if (score >= 50) return 'rgba(245,158,11,0.12)'
  return 'rgba(239,68,68,0.12)'
}

export function getDifficultyStyle(d: 'easy' | 'medium' | 'hard') {
  return {
    easy:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
  }[d]
}

export function getStatusStyle(s: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    solved:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Solved'    },
    attempted: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Attempted' },
    skipped:   { color: '#71717a', bg: 'rgba(113,113,122,0.1)',label: 'Skipped'   },
    unseen:    { color: '#52525b', bg: 'transparent',           label: 'Unseen'    },
    sent:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Due Today' },
  }
  return map[s] ?? map.unseen
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
