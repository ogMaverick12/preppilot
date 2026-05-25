'use client'
import { Clock, Code2, RefreshCw, TrendingUp, CheckCircle2, Flame, Play } from 'lucide-react'
import { Card, Badge, Button, StatCard, SectionHeader } from '@/components/ui'
import { TOPIC_META } from '@/lib/mock-data'

interface TodayProblemData {
  id: string
  title: string
  difficulty: string
  topic: string
  sub_topic?: string
  session_id?: string
  description?: string
  hints?: string[]
  estimated_minutes: string
  status: string
  selection_reason: string
  sent_at?: string
  selected_by_skill_version?: string
}

interface WeekSummaryData {
  problems_sent: number
  problems_solved: number
  avg_score: number
  score_delta: number
}

interface TodaysProblemProps {
  problem?: TodayProblemData | null
  onRequestProblem?: () => void
  requestingProblem?: boolean
  onSolve?: () => void
}

export function TodaysProblem({ problem, onRequestProblem, requestingProblem, onSolve }: TodaysProblemProps) {
  if (!problem) {
    return (
      <Card variant="amber" className="flex flex-col gap-4">
        <SectionHeader title="Today's Problem" />
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#451a03]/50 flex items-center justify-center mb-3">
            <Play size={20} className="text-[#f59e0b] ml-0.5" />
          </div>
          <p className="text-[#a1a1aa] text-[13px] font-medium mb-1">No problem assigned yet</p>
          <p className="text-[#71717a] text-[11px] mb-4">Let Hermes pick one for this local profile</p>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={onRequestProblem}
            disabled={requestingProblem}
          >
            <Play size={12} />
            {requestingProblem ? 'Selecting...' : "Get Today's Problem"}
          </Button>
        </div>
      </Card>
    )
  }

  const meta = TOPIC_META[problem.topic] || { label: problem.topic, color: '#f59e0b', bg: '#451a03' }

  return (
    <Card variant="amber" className="flex flex-col gap-4">
      <SectionHeader title="Today's Problem" />
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="difficulty" difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'}>
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </Badge>
        <span
          className="text-[11px] px-2 py-0.5 rounded font-medium"
          style={{ color: meta?.color, background: meta?.bg, borderLeft: `2px solid ${meta?.color}`, paddingLeft: '6px' }}
        >
          {meta?.label}
        </span>
      </div>

      <div>
        <h3 className="text-[#fafafa] font-semibold text-lg leading-tight">{problem.title}</h3>
        <p className="text-[#a1a1aa] text-[12px] mt-1 flex items-center gap-1.5">
          <Clock size={11} /> Est. {problem.estimated_minutes} minutes
        </p>
      </div>

      <div className="bg-[#09090b]/40 rounded-lg px-3 py-2.5 border border-[#78350f]/50">
        <p className="text-[#fbbf24] text-[11px] font-medium mb-0.5 uppercase tracking-wide">Why today?</p>
        <p className="text-[#d97706] text-[12px] leading-relaxed">{problem.selection_reason}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[#71717a] text-[11px]">
        <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
        {problem.sent_at ? `Sent at ${problem.sent_at}` : 'Active'} · Awaiting your solution
      </div>

      <div className="flex gap-2 mt-auto">
        <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={onSolve}>
          <Code2 size={12} /> Solve in Dashboard
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRequestProblem} disabled={requestingProblem}>
          <RefreshCw size={12} /> Different topic
        </Button>
      </div>
    </Card>
  )
}

interface WeekSummaryStatsProps {
  weekSummary?: WeekSummaryData | null
  streak?: number
}

export function WeekSummaryStats({ weekSummary, streak }: WeekSummaryStatsProps) {
  const s = weekSummary || { problems_solved: 0, problems_sent: 0, avg_score: 0, score_delta: 0 }
  const currentStreak = streak ?? 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label="This Week"
        value={`${s.problems_solved}/${s.problems_sent}`}
        sub="problems solved"
        trend={{ value: s.problems_solved > 0 ? s.problems_solved : 0, label: 'vs last week' }}
        icon={<CheckCircle2 size={14} />}
      />
      <StatCard
        label="Average Score"
        value={s.avg_score}
        sub="across all sessions"
        trend={{ value: s.score_delta, label: 'pts from week 1' }}
        icon={<TrendingUp size={14} />}
      />
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-widest">Streak</span>
          <Flame size={14} className="text-[#f59e0b]" />
        </div>
        <div className="flex items-end gap-2">
          <span className="font-mono font-semibold text-3xl text-[#f59e0b] leading-none" style={{ textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
            {currentStreak}
          </span>
          <span className="text-[#a1a1aa] text-sm mb-0.5">day{currentStreak !== 1 ? 's' : ''} {currentStreak > 0 ? '🔥' : ''}</span>
        </div>
        <p className="text-[13px] text-[#71717a]">{currentStreak > 0 ? 'Keep it going!' : 'Start practicing!'}</p>
      </Card>
    </div>
  )
}
