'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import SessionHistory from '@/components/progress/SessionHistory'
import { TOPIC_META } from '@/lib/mock-data'
import { Card, ScoreBar } from '@/components/ui'
import { cn, getDifficultyStyle } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useDashboard, useUserStats } from '@/lib/hooks'

interface RadarDataPoint {
  topic: string
  key: string
  score: number
  attempts: number
  difficulty?: string
}

function TopicBreakdown({ radarData }: { radarData: RadarDataPoint[] }) {
  const [open, setOpen] = useState<string | null>(null)

  if (radarData.length === 0) {
    return (
      <div className="mt-8 text-center py-16 text-[#52525b]">
        <p className="text-lg mb-1">No topic data yet</p>
        <p className="text-sm">Solve problems across different topics to see your breakdown</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-[#fafafa] text-base mb-4">Topic Breakdown</h2>
      <div className="space-y-2">
        {radarData.map(d => {
          const meta = TOPIC_META[d.key]
          const diff = getDifficultyStyle((d.difficulty || 'easy') as any)
          const isOpen = open === d.key
          return (
            <Card key={d.key} padding="none" className="overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#1c1c1f] transition-colors"
                onClick={() => setOpen(isOpen ? null : d.key)}
              >
                <div className="flex items-center gap-2.5 w-44 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta?.color }} />
                  <span className="text-[#d4d4d8] text-[13px] font-medium truncate">{d.topic}</span>
                </div>
                <div className="flex-1">
                  <ScoreBar score={d.score} showNumber={true} height={5} />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-medium"
                    style={{ color: diff.color, background: diff.bg }}
                  >
                    {d.difficulty || 'easy'}
                  </span>
                  <span className="text-[#52525b] text-[11px] w-20 text-right">{d.attempts} attempts</span>
                  {isOpen ? <ChevronUp size={12} className="text-[#52525b]" /> : <ChevronDown size={12} className="text-[#52525b]" />}
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-[#1c1c1f] grid grid-cols-3 gap-3">
                  {[
                    { label: 'Average Score', value: d.score, unit: '/100' },
                    { label: 'Solved',         value: Math.round(d.attempts * (d.score / 100)), unit: ` of ${d.attempts}` },
                    { label: 'Attempts',       value: d.attempts, unit: '' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1c1c1f] rounded-lg p-3">
                      <p className="text-[10px] text-[#52525b] mb-1 uppercase tracking-wide">{s.label}</p>
                      <p className="font-mono font-semibold text-[#fafafa] text-[15px]">
                        {s.value}<span className="text-[#52525b] text-[11px]">{s.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'topics'>('sessions')
  const { user } = useAuth()
  const userId = user?.id

  const { data: stats } = useUserStats(userId)
  const { data: dashboard } = useDashboard(userId)

  const totalSessions = stats?.total_sessions || 0
  const streak = stats?.current_streak || 0
  const avgScore = stats?.average_score || 0
  const bestScore = stats?.best_score || 0
  const improvement = stats?.improvement_since_start || 0
  const solved = stats?.total_solved || 0

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8 fade-up">
        <h1 className="font-display font-bold text-2xl text-[#fafafa] mb-1">Progress</h1>
        <p className="text-[#71717a] text-[14px]">
          {totalSessions} sessions · {streak} day streak · avg score {Math.round(avgScore)}
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-8 fade-up delay-0">
        {[
          { label: 'Total Sessions',  value: String(totalSessions),  sub: `${stats?.problems_this_week || 0} this week` },
          { label: 'Solved',          value: String(solved),         sub: `${totalSessions > 0 ? Math.round((solved / totalSessions) * 100) : 0}% solve rate` },
          { label: 'Best Score',      value: String(bestScore),      sub: stats?.best_topic || 'N/A' },
          { label: 'Improvement',     value: improvement >= 0 ? `+${improvement}` : String(improvement), sub: 'pts since week 1' },
        ].map(s => (
          <div key={s.label} className="bg-[#111113] border border-[#27272a] rounded-xl p-4">
            <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-mono font-bold text-[#fafafa] text-2xl leading-none"
              style={s.label === 'Improvement' ? { color: improvement >= 0 ? '#22c55e' : '#ef4444' } : {}}>
              {s.value}
            </p>
            <p className="text-[#52525b] text-[11px] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1 w-fit mb-6 fade-up delay-1">
        {(['sessions', 'topics'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn(
              'px-4 py-1.5 text-[13px] rounded-md font-medium transition-all capitalize',
              activeTab === t ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
            )}>
            {t === 'sessions' ? 'Session History' : 'Topic Breakdown'}
          </button>
        ))}
      </div>

      <div className="fade-up delay-2">
        {activeTab === 'sessions'
          ? <SessionHistory />
          : <TopicBreakdown radarData={dashboard?.radar || []} />
        }
      </div>
    </AppShell>
  )
}
