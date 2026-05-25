'use client'
import AppShell from '@/components/layout/AppShell'
import ProblemGrid from '@/components/problems/ProblemGrid'
import { useAuth } from '@/lib/auth'
import { useProblems } from '@/lib/hooks'

export default function ProblemsPage() {
  const { user } = useAuth()
  const { data } = useProblems({ user_id: user?.id })
  const total = data?.total || 0
  const solved = data?.problems?.filter(p => p.status === 'solved').length || 0
  const attempted = data?.problems?.filter(p => p.status === 'attempted').length || 0
  const unseen = data?.problems?.filter(p => p.status === 'unseen').length || 0

  return (
    <AppShell>
      <div className="mb-8 fade-up">
        <h1 className="font-display font-bold text-2xl text-[#fafafa] mb-1">Problem Bank</h1>
        <p className="text-[#71717a] text-[14px]">
          {total} problems · {solved} solved · {attempted} attempted · {unseen} unseen
        </p>
      </div>
      <div className="fade-up delay-0">
        <ProblemGrid />
      </div>
    </AppShell>
  )
}
