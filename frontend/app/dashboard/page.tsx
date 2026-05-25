'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { WeekSummaryStats, TodaysProblem } from '@/components/dashboard/TodaysProblem'
import SkillEvolution from '@/components/dashboard/SkillEvolution'
import SkillEvolutionModal from '@/components/modals/SkillEvolutionModal'
import { useAuth } from '@/lib/auth'
import { useDashboard, useRequestProblem } from '@/lib/hooks'

const SkillRadar  = dynamic(() => import('@/components/dashboard/SkillRadar'),  { ssr: false })
const ScoreTrend  = dynamic(() => import('@/components/dashboard/ScoreTrend'),  { ssr: false })

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const [dateStr, setDateStr] = useState('')
  const userId = user?.id

  // Fetch all dashboard data with a single hook
  const { data: dashboard, isLoading, error } = useDashboard(userId)
  const requestProblem = useRequestProblem()

  useEffect(() => {
    const now = new Date()
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setDateStr(`${now.toLocaleDateString('en-US', opts)} · ${time}`)
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'there'

  // Derive focus from today's problem or radar data
  const focusTopic = dashboard?.today_problem?.topic || dashboard?.radar?.[0]?.topic || null
  const latestSkillVersion = dashboard?.skills?.[0]?.version || '1.0'

  return (
    <AppShell>
      {/* Page header */}
      <div className="flex items-end justify-between mb-8 fade-up">
        <div>
          <p className="text-[#52525b] text-[12px] mb-1">{dateStr}</p>
          <h1 className="font-display font-bold text-2xl text-[#fafafa]">{greeting()}, {displayName}.</h1>
          <p className="text-[#71717a] text-[14px] mt-0.5">
            {focusTopic
              ? <>Your focus today: <span className="text-[#f59e0b]">{focusTopic}</span></>
              : <>Get started by solving your first problem!</>
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#52525b] text-[11px] font-mono">problem_selector</p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[#f59e0b] font-mono font-semibold text-[13px] hover:underline cursor-pointer"
            style={{ textShadow: '0 0 12px rgba(245,158,11,0.4)' }}
          >
            v{latestSkillVersion} ↗
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#52525b] text-[12px]">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center mb-6">
          <p className="text-[#ef4444] text-[14px] font-medium mb-1">Could not load dashboard</p>
          <p className="text-[#52525b] text-[12px]">Make sure the backend is running on port 8000</p>
        </div>
      )}

      {/* Content (show even with error — empty states will handle gracefully) */}
      {!isLoading && (
        <>
          {dashboard?.assessment && dashboard.assessment.status !== 'complete' && (
            <div className="mb-6 bg-[#1c1500] border border-[#78350f]/50 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[#fbbf24] text-[13px] font-semibold">Hermes calibration in progress</p>
                <p className="text-[#d97706] text-[12px] mt-0.5">
                  Solve {dashboard.assessment.required_sessions - dashboard.assessment.completed_sessions} more assessment problems to unlock your starting level.
                </p>
              </div>
              <button
                onClick={() => router.push('/solve')}
                className="bg-[#f59e0b] text-[#09090b] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#d97706] transition-colors"
              >
                Continue Assessment
              </button>
            </div>
          )}

          {/* Stat cards */}
          <div className="fade-up delay-0 mb-6">
            <WeekSummaryStats
              weekSummary={dashboard?.week_summary}
              streak={dashboard?.user?.streak}
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-5 gap-5 fade-up delay-1">
            {/* Left col — 3/5 */}
            <div className="col-span-3 space-y-5">
              <SkillRadar data={dashboard?.radar} />
              <ScoreTrend data={dashboard?.trend} />
            </div>

            {/* Right col — 2/5 */}
            <div className="col-span-2 space-y-5">
              <TodaysProblem
                problem={dashboard?.today_problem}
                onRequestProblem={() => userId && requestProblem.mutate(userId)}
                requestingProblem={requestProblem.isPending}
                onSolve={() => router.push(dashboard?.today_problem?.session_id ? `/solve?session_id=${dashboard.today_problem.session_id}` : '/solve')}
              />
              <SkillEvolution
                versions={dashboard?.skills}
                onViewFull={() => setModalOpen(true)}
              />
            </div>
          </div>
        </>
      )}

      {/* Skill evolution full modal */}
      <SkillEvolutionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        versions={dashboard?.skills}
      />
    </AppShell>
  )
}
