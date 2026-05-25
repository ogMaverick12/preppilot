'use client'
import { useState } from 'react'
import { Code2, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TOPIC_META } from '@/lib/mock-data'
import { Card, Badge, Button } from '@/components/ui'
import { cn, getStatusStyle } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useProblems, useStartProblem } from '@/lib/hooks'

interface ProblemData {
  id: string; title: string; slug: string; difficulty: string
  topic: string; sub_topic?: string; description?: string
  examples?: Array<{ input: string; output: string }>
  constraints?: string[]
  hints?: string[]; your_score?: number | null; status: string
  is_custom?: boolean
}

function ProblemModal({ p, onClose, onSolve, solving }: { p: ProblemData; onClose: () => void; onSolve: () => void; solving: boolean }) {
  const meta = TOPIC_META[p.topic]
  const status = getStatusStyle(p.status)
  const [hintIdx, setHintIdx] = useState(0)
  const hints = p.hints?.length ? p.hints : ['Think about subproblems.']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-[#111113] border border-[#27272a] rounded-2xl shadow-xl">
        <div className="sticky top-0 bg-[#111113] border-b border-[#1c1c1f] px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="difficulty" difficulty={p.difficulty as 'easy' | 'medium' | 'hard'}>{p.difficulty}</Badge>
              {meta && <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>}
              <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ color: status.color, background: status.bg }}>{status.label}</span>
              {p.is_custom && <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#1c1c1f] text-[#a1a1aa]">Private</span>}
            </div>
            <h2 className="text-[#fafafa] font-semibold text-xl">{p.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#52525b] hover:text-[#fafafa] transition-colors mt-1"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {p.description && <div><p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Description</p><p className="text-[#a1a1aa] text-[14px] leading-relaxed whitespace-pre-wrap">{p.description}</p></div>}
          {!!p.examples?.length && (
            <div>
              <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Examples</p>
              {p.examples.slice(0, 2).map((ex, index) => (
                <pre key={index} className="terminal-block text-[11px] whitespace-pre-wrap mb-2">Input: {ex.input}{'\n'}Output: {ex.output}</pre>
              ))}
            </div>
          )}
          {!!p.constraints?.length && (
            <div>
              <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Constraints</p>
              <ul className="space-y-1">
                {p.constraints.map(item => <li key={item} className="text-[#a1a1aa] text-[12px]">{item}</li>)}
              </ul>
            </div>
          )}
          <div>
            <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Hints</p>
            {hints.slice(0, hintIdx + 1).map((h, i) => (
              <div key={i} className="bg-[#451a03]/60 border border-[#78350f]/40 rounded-lg px-4 py-2.5 mb-2">
                <p className="text-[#fbbf24] text-[11px] font-medium mb-0.5">Hint {i + 1}</p>
                <p className="text-[#d97706] text-[12px]">{h}</p>
              </div>
            ))}
            {hintIdx < hints.length - 1 && <Button variant="ghost" size="sm" onClick={() => setHintIdx(hintIdx + 1)} className="text-[#52525b] text-[11px]">Reveal Hint {hintIdx + 2}</Button>}
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={onSolve} disabled={solving} className="gap-1.5">
            {solving ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />}
            {solving ? 'Starting...' : 'Solve'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProblemCard({ p, onClick }: { p: ProblemData; onClick: () => void }) {
  const meta = TOPIC_META[p.topic]
  const status = getStatusStyle(p.status)
  return (
    <Card className="cursor-pointer hover:border-[#3f3f46] hover:-translate-y-0.5 transition-all duration-150 group" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant="difficulty" difficulty={p.difficulty as 'easy' | 'medium' | 'hard'}>{p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}</Badge>
        {p.status !== 'unseen' && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: status.color, background: status.bg }}>{status.label}</span>}
      </div>
      <h3 className="text-[#fafafa] font-medium text-[14px] leading-snug mb-2 group-hover:text-[#fbbf24] transition-colors">{p.title}</h3>
      {meta && <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-[#52525b]">{p.sub_topic || p.topic}</span>
        {p.your_score != null && <span className="font-mono font-semibold text-[13px]" style={{ color: p.your_score >= 90 ? '#22c55e' : p.your_score >= 70 ? '#f59e0b' : '#ef4444' }}>{p.your_score}</span>}
      </div>
    </Card>
  )
}

export default function ProblemGrid() {
  const { user } = useAuth()
  const router = useRouter()
  const [selected, setSelected] = useState<ProblemData | null>(null)
  const [topicFilter, setTopicFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const startProblem = useStartProblem()
  const { data, isLoading } = useProblems({ topic: topicFilter !== 'all' ? topicFilter : undefined, difficulty: diffFilter !== 'all' ? diffFilter : undefined, status: statusFilter !== 'all' ? statusFilter : undefined, user_id: user?.id, per_page: 100 })
  const problems = (data?.problems || []) as ProblemData[]
  const totalProblems = data?.total ?? problems.length

  function solveSelected() {
    if (!selected || !user?.id) return
    startProblem.mutate({ problemId: selected.id, userId: user.id }, {
      onSuccess: session => router.push(`/solve?session_id=${session.id}`),
    })
  }

  return (
    <>
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#f59e0b] cursor-pointer">
          <option value="all">All Topics</option>
          {Object.entries(TOPIC_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1">
          {['all','easy','medium','hard'].map(d => <button key={d} onClick={() => setDiffFilter(d)} className={cn('px-3 py-1 text-[11px] rounded-md font-medium transition-all capitalize', diffFilter === d ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]')}>{d === 'all' ? 'All' : d}</button>)}
        </div>
        <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1">
          {[['all','All'],['solved','Solved'],['attempted','Attempted'],['unseen','Unseen']].map(([v,l]) => <button key={v} onClick={() => setStatusFilter(v)} className={cn('px-3 py-1 text-[11px] rounded-md font-medium transition-all', statusFilter === v ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]')}>{l}</button>)}
        </div>
        <span className="text-[13px] text-[#52525b] ml-auto">{isLoading ? '...' : `${totalProblems} problems`}</span>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(p => <ProblemCard key={p.id} p={p} onClick={() => setSelected(p)} />)}
          {problems.length === 0 && <div className="col-span-3 text-center py-16 text-[#52525b]"><p className="text-lg mb-1">No problems found</p><p className="text-sm">Seed the problem bank or adjust filters</p></div>}
        </div>
      )}
      {selected && <ProblemModal p={selected} onClose={() => setSelected(null)} onSolve={solveSelected} solving={startProblem.isPending} />}
    </>
  )
}
