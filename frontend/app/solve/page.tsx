'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, Code2, FilePlus2, Loader2, Search, Send, Star } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Badge, Button, Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import {
  useCreateCustomProblem,
  useDashboard,
  useProblem,
  useProblems,
  useRateFeedback,
  useSessionDetail,
  useStartProblem,
  useSubmitSolution,
} from '@/lib/hooks'
import type { Problem, Session } from '@/lib/api'
import { TOPIC_META } from '@/lib/mock-data'
import { cn, getStatusStyle } from '@/lib/utils'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const STARTERS: Record<string, string> = {
  python: 'def solve():\n    # Write your approach here\n    pass\n',
  javascript: 'function solve() {\n  // Write your approach here\n}\n',
  typescript: 'function solve(): void {\n  // Write your approach here\n}\n',
  java: 'class Solution {\n    public void solve() {\n        // Write your approach here\n    }\n}\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    // Write your approach here\n}\n',
}

export default function SolvePage() {
  return (
    <Suspense fallback={<AppShell wide><div className="text-[#71717a] text-sm">Loading solve workspace...</div></AppShell>}>
      <SolvePageContent />
    </Suspense>
  )
}

function SolvePageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const sessionId = params.get('session_id') || undefined
  const { user } = useAuth()
  const userId = user?.id
  const [activeTab, setActiveTab] = useState<'selector' | 'solve'>(sessionId ? 'solve' : 'selector')
  const [language, setLanguage] = useState('python')
  const [solution, setSolution] = useState(STARTERS.python)
  const [revealedHints, setRevealedHints] = useState(0)
  const [submitted, setSubmitted] = useState<Session | null>(null)
  const [startedAt, setStartedAt] = useState(Date.now())

  const { data: dashboard } = useDashboard(userId)
  const { data: sessionDetail, isLoading: sessionLoading } = useSessionDetail(sessionId)
  const fallbackSession = dashboard?.today_problem
    ? ({
        id: dashboard.today_problem.session_id,
        user_id: userId || '',
        problem_id: dashboard.today_problem.id,
        problem_title: dashboard.today_problem.title,
        problem_topic: dashboard.today_problem.topic,
        problem_difficulty: dashboard.today_problem.difficulty,
        status: dashboard.today_problem.status,
        created_at: dashboard.today_problem.sent_at || '',
      } as Session)
    : null
  const activeSession = sessionDetail || (sessionId ? null : fallbackSession)
  const activeProblemId = activeSession?.problem_id
  const { data: activeProblem } = useProblem(activeProblemId, userId)
  const problem = activeProblem || (dashboard?.today_problem
    ? ({
        id: dashboard.today_problem.id,
        title: dashboard.today_problem.title,
        slug: dashboard.today_problem.id,
        difficulty: dashboard.today_problem.difficulty,
        topic: dashboard.today_problem.topic,
        sub_topic: dashboard.today_problem.sub_topic,
        description: dashboard.today_problem.description,
        examples: [],
        constraints: [],
        hints: dashboard.today_problem.hints,
        status: dashboard.today_problem.status,
        estimated_minutes: dashboard.today_problem.estimated_minutes,
      } as Problem)
    : null)

  const submitSolution = useSubmitSolution()
  const rateFeedback = useRateFeedback()
  const reviewed = submitted || sessionDetail

  useEffect(() => {
    setActiveTab(sessionId || fallbackSession ? 'solve' : 'selector')
  }, [sessionId, fallbackSession?.id])

  useEffect(() => {
    setLanguage(sessionDetail?.language || 'python')
    setSolution(sessionDetail?.user_solution || STARTERS.python)
    setSubmitted(null)
    setRevealedHints(0)
    setStartedAt(Date.now())
  }, [activeSession?.id])

  const minutesTaken = useMemo(() => Math.max(1, Math.round((Date.now() - startedAt) / 60000)), [startedAt, submitted])
  const canSubmit = !!activeSession?.id && solution.trim().length > 10 && !submitSolution.isPending

  function changeLanguage(next: string) {
    setLanguage(next)
    if (!solution.trim() || Object.values(STARTERS).includes(solution)) {
      setSolution(STARTERS[next] || '')
    }
  }

  function submit() {
    if (!activeSession?.id || !canSubmit) return
    submitSolution.mutate({
      sessionId: activeSession.id,
      solution,
      language,
      timeTakenMinutes: minutesTaken,
    }, {
      onSuccess: session => setSubmitted(session),
    })
  }

  function rate(rating: number) {
    const target = reviewed?.id
    if (!target) return
    rateFeedback.mutate({ sessionId: target, rating, difficultyFelt: 'right' }, {
      onSuccess: session => setSubmitted(session),
    })
  }

  return (
    <AppShell wide>
      <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border border-[#1c1c1f] bg-[#111113] rounded-t-xl px-4 py-3">
          <div className="min-w-0">
            <p className="text-[#52525b] text-[11px] uppercase tracking-widest">PrepPilot Solve Workspace</p>
            <h1 className="text-[#fafafa] font-display font-semibold text-xl truncate">
              {problem ? problem.title : 'Choose a problem to start'}
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-[#1c1c1f] rounded-lg p-1">
            <button onClick={() => setActiveTab('selector')} className={tabClass(activeTab === 'selector')}>
              <Search size={14} /> Problem Selector
            </button>
            <button onClick={() => setActiveTab('solve')} className={tabClass(activeTab === 'solve')} disabled={!activeSession}>
              <Code2 size={14} /> Solve
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 border-x border-b border-[#1c1c1f] rounded-b-xl bg-[#09090b] overflow-hidden">
          {activeTab === 'selector' ? (
            <ProblemSelector onStarted={session => {
              router.replace(`/solve?session_id=${session.id}`)
              setActiveTab('solve')
            }} />
          ) : (
            <SolveSurface
              problem={problem}
              session={activeSession}
              sessionLoading={sessionLoading}
              language={language}
              solution={solution}
              setSolution={setSolution}
              changeLanguage={changeLanguage}
              canSubmit={canSubmit}
              submit={submit}
              reviewing={submitSolution.isPending}
              reviewed={reviewed || null}
              revealedHints={revealedHints}
              setRevealedHints={setRevealedHints}
              rate={rate}
              ratingPending={rateFeedback.isPending}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}

function ProblemSelector({ onStarted }: { onStarted: (session: Session) => void }) {
  const { user } = useAuth()
  const userId = user?.id
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Problem | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const { data, isLoading } = useProblems({
    user_id: userId,
    topic: topic !== 'all' ? topic : undefined,
    difficulty: difficulty !== 'all' ? difficulty : undefined,
    per_page: 100,
  })
  const startProblem = useStartProblem()
  const createCustom = useCreateCustomProblem()
  const [custom, setCustom] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    topic: 'custom',
    hints: '',
  })

  const problems = (data?.problems || []).filter(p => {
    const haystack = `${p.title} ${p.topic} ${p.sub_topic || ''}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  function start(p: Problem) {
    if (!userId) return
    startProblem.mutate({ problemId: p.id, userId }, { onSuccess: onStarted })
  }

  function createAndStart() {
    if (!userId || !custom.title.trim() || !custom.description.trim()) return
    createCustom.mutate({
      user_id: userId,
      title: custom.title,
      description: custom.description,
      difficulty: custom.difficulty,
      topic: custom.topic || 'custom',
      hints: custom.hints.split('\n').map(h => h.trim()).filter(Boolean),
      constraints: ['Custom problem supplied by the learner.'],
      tags: ['custom'],
    }, {
      onSuccess: problem => start(problem),
    })
  }

  return (
    <div className="h-full grid grid-cols-12 min-h-0">
      <section className="col-span-7 border-r border-[#1c1c1f] min-h-0 flex flex-col">
        <div className="p-4 border-b border-[#1c1c1f] flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[260px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search problems..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#f59e0b]" />
          </div>
          <select value={topic} onChange={e => setTopic(e.target.value)} className="select-dark">
            <option value="all">All Topics</option>
            {Object.entries(TOPIC_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="select-dark">
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Button variant="secondary" size="sm" onClick={() => setCustomOpen(!customOpen)} className="gap-1.5">
            <FilePlus2 size={13} /> Custom
          </Button>
        </div>

        {customOpen && (
          <div className="border-b border-[#1c1c1f] p-4 bg-[#0d0d0f] grid grid-cols-2 gap-3">
            <input value={custom.title} onChange={e => setCustom({ ...custom, title: e.target.value })} placeholder="Custom problem title" className="input-dark" />
            <select value={custom.difficulty} onChange={e => setCustom({ ...custom, difficulty: e.target.value })} className="select-dark">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <textarea value={custom.description} onChange={e => setCustom({ ...custom, description: e.target.value })} placeholder="Paste or write the problem statement" className="input-dark col-span-2 min-h-[88px]" />
            <textarea value={custom.hints} onChange={e => setCustom({ ...custom, hints: e.target.value })} placeholder="Optional hints, one per line" className="input-dark col-span-2 min-h-[56px]" />
            <Button variant="primary" size="sm" onClick={createAndStart} disabled={createCustom.isPending || startProblem.isPending} className="col-span-2">
              {createCustom.isPending || startProblem.isPending ? 'Creating...' : 'Create and Solve'}
            </Button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#f59e0b]" /></div>
          ) : (
            <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3">
              {problems.map(p => (
                <ProblemTile key={p.id} problem={p} selected={selected?.id === p.id} onClick={() => setSelected(p)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="col-span-5 min-h-0 overflow-y-auto p-5">
        {selected ? (
          <ProblemPreview problem={selected} onStart={() => start(selected)} starting={startProblem.isPending} />
        ) : (
          <div className="h-full flex items-center justify-center text-center text-[#52525b] text-sm">
            Select a problem to preview it and start a Hermes session.
          </div>
        )}
      </aside>
    </div>
  )
}

function SolveSurface(props: {
  problem: Problem | null
  session: Session | null
  sessionLoading: boolean
  language: string
  solution: string
  setSolution: (value: string) => void
  changeLanguage: (value: string) => void
  canSubmit: boolean
  submit: () => void
  reviewing: boolean
  reviewed: Session | null
  revealedHints: number
  setRevealedHints: (value: number) => void
  rate: (rating: number) => void
  ratingPending: boolean
}) {
  const { problem, session, reviewed } = props
  if (props.sessionLoading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#f59e0b]" /></div>
  }
  if (!problem || !session) {
    return <div className="h-full flex items-center justify-center text-[#52525b] text-sm">Choose a problem first.</div>
  }
  const meta = TOPIC_META[problem.topic]
  const hints = problem.hints || []
  const breakdown = reviewed?.score_breakdown

  return (
    <div className="h-full grid grid-cols-12 min-h-0">
      <aside className="col-span-4 border-r border-[#1c1c1f] min-h-0 overflow-y-auto p-5 space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="difficulty" difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'}>{problem.difficulty}</Badge>
          {meta && <span className="topic-pill" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>}
          {problem.is_custom && <span className="topic-pill text-[#a1a1aa] bg-[#1c1c1f]">Private</span>}
        </div>
        <div>
          <h2 className="text-[#fafafa] text-xl font-semibold mb-2">{problem.title}</h2>
          <div className="flex items-center gap-1.5 text-[#71717a] text-[12px]">
            <Clock size={12} /> {problem.estimated_minutes || (problem.difficulty === 'easy' ? '15-20' : problem.difficulty === 'hard' ? '45-60' : '30-40')} min
            <span className="text-[#3f3f46]">session {session.id.slice(0, 8)}</span>
          </div>
        </div>
        <InfoSection title="Problem Statement">
          <p className="text-[#d4d4d8] text-[13px] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
        </InfoSection>
        {problem.examples?.length > 0 && (
          <InfoSection title="Examples">
            <div className="space-y-2">
              {problem.examples.map((ex, index) => (
                <pre key={index} className="terminal-block text-[11px] whitespace-pre-wrap">Input: {ex.input}{'\n'}Output: {ex.output}</pre>
              ))}
            </div>
          </InfoSection>
        )}
        {problem.constraints?.length > 0 && (
          <InfoSection title="Constraints">
            <ul className="space-y-1">
              {problem.constraints.map(item => <li key={item} className="text-[#a1a1aa] text-[12px]">{item}</li>)}
            </ul>
          </InfoSection>
        )}
        <InfoSection title="Hints">
          <div className="space-y-2">
            {hints.slice(0, props.revealedHints).map((hint, index) => (
              <div key={hint} className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
                <p className="text-[#f59e0b] text-[11px] font-medium">Hint {index + 1}</p>
                <p className="text-[#a1a1aa] text-[12px]">{hint}</p>
              </div>
            ))}
            {hints.length > props.revealedHints ? (
              <Button variant="ghost" size="sm" onClick={() => props.setRevealedHints(props.revealedHints + 1)}>Reveal hint</Button>
            ) : (
              <p className="text-[#52525b] text-[12px]">{hints.length ? 'All hints revealed.' : 'No hints for this problem yet.'}</p>
            )}
          </div>
        </InfoSection>
      </aside>

      <main className="col-span-8 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f] bg-[#0d0d0f]">
          <div className="flex items-center gap-2">
            <select value={props.language} onChange={e => props.changeLanguage(e.target.value)} className="select-dark">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            {reviewed?.score != null && <span className="inline-flex items-center gap-1.5 text-green-400 text-[12px]"><CheckCircle2 size={13} /> Reviewed</span>}
          </div>
          <Button variant="primary" size="sm" onClick={props.submit} disabled={!props.canSubmit} className="gap-1.5">
            {props.reviewing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {props.reviewing ? 'Reviewing...' : 'Submit to Hermes'}
          </Button>
        </div>

        <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            language={props.language}
            theme="vs-dark"
            value={props.solution}
            onChange={value => props.setSolution(value || '')}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbersMinChars: 3,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>

        <div className="h-[245px] border-t border-[#1c1c1f] bg-[#111113] overflow-y-auto">
          {!reviewed?.hermes_feedback ? (
            <div className="px-5 py-5 text-[#52525b] text-[13px]">Hermes review will appear here after submission.</div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-1">Hermes Score</p>
                  <p className="font-mono text-3xl font-semibold text-[#f59e0b] leading-none">{reviewed.score}<span className="text-[#52525b] text-sm">/100</span></p>
                </div>
                {breakdown && (
                  <div className="grid grid-cols-4 gap-2 flex-1 max-w-xl">
                    {[
                      ['Correctness', breakdown.correctness, 40],
                      ['Complexity', breakdown.complexity, 30],
                      ['Edge Cases', breakdown.edge_cases, 20],
                      ['Style', breakdown.style, 10],
                    ].map(([label, value, max]) => (
                      <div key={label} className="bg-[#1c1c1f] rounded-lg p-2 text-center">
                        <p className="text-[10px] text-[#52525b]">{label}</p>
                        <p className="font-mono text-[#fafafa] text-[13px]">{value}<span className="text-[#52525b] text-[10px]">/{max}</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <pre className="terminal-block text-[11px] whitespace-pre-wrap">{reviewed.hermes_feedback}</pre>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[#71717a] text-[12px]">{reviewed.explanation_helpful ? 'Feedback recorded.' : 'Rate this review so Hermes can adapt.'}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} onClick={() => props.rate(rating)} disabled={props.ratingPending || !!reviewed.explanation_helpful}
                      className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        reviewed.explanation_helpful && rating <= reviewed.explanation_helpful
                          ? 'bg-[#451a03] text-[#f59e0b]'
                          : 'bg-[#1c1c1f] text-[#52525b] hover:text-[#f59e0b]')}>
                      <Star size={13} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ProblemTile({ problem, selected, onClick }: { problem: Problem; selected: boolean; onClick: () => void }) {
  const meta = TOPIC_META[problem.topic]
  const status = getStatusStyle(problem.status)
  return (
    <Card className={cn('cursor-pointer transition-all hover:border-[#3f3f46]', selected && 'border-[#f59e0b] bg-[#1c1500]')} onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="difficulty" difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'}>{problem.difficulty}</Badge>
        {problem.status !== 'unseen' && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: status.color, background: status.bg }}>{status.label}</span>}
      </div>
      <h3 className="text-[#fafafa] text-[13px] font-medium leading-snug line-clamp-2">{problem.title}</h3>
      <div className="flex items-center justify-between mt-3 gap-2">
        {meta && <span className="topic-pill" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>}
        {problem.your_score != null && <span className="font-mono text-[#f59e0b] text-[12px]">{problem.your_score}</span>}
      </div>
    </Card>
  )
}

function ProblemPreview({ problem, onStart, starting }: { problem: Problem; onStart: () => void; starting: boolean }) {
  const meta = TOPIC_META[problem.topic]
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="difficulty" difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'}>{problem.difficulty}</Badge>
        {meta && <span className="topic-pill" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>}
        {problem.is_custom && <span className="topic-pill text-[#a1a1aa] bg-[#1c1c1f]">Private</span>}
      </div>
      <div>
        <h2 className="text-[#fafafa] font-semibold text-2xl mb-2">{problem.title}</h2>
        <p className="text-[#a1a1aa] text-[13px] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
      </div>
      {problem.examples?.length > 0 && (
        <InfoSection title="Examples">
          {problem.examples.slice(0, 2).map((ex, index) => (
            <pre key={index} className="terminal-block text-[11px] whitespace-pre-wrap mb-2">Input: {ex.input}{'\n'}Output: {ex.output}</pre>
          ))}
        </InfoSection>
      )}
      {problem.constraints?.length > 0 && (
        <InfoSection title="Constraints">
          <ul className="space-y-1">{problem.constraints.map(item => <li key={item} className="text-[#a1a1aa] text-[12px]">{item}</li>)}</ul>
        </InfoSection>
      )}
      <Button variant="primary" size="lg" fullWidth onClick={onStart} disabled={starting} className="gap-1.5">
        {starting ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />}
        {starting ? 'Starting...' : 'Solve'}
      </Button>
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">{title}</p>
      {children}
    </section>
  )
}

function tabClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
    active ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#71717a] hover:text-[#fafafa]'
  )
}
