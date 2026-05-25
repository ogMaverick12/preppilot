'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckCircle2, Clock, Loader2, Send, Star, X } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { useRateFeedback, useSubmitSolution } from '@/lib/hooks'
import type { DashboardData, Session } from '@/lib/api'
import { TOPIC_META } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type TodayProblem = NonNullable<DashboardData['today_problem']>

const STARTERS: Record<string, string> = {
  python: 'def solve():\n    # Write your approach here\n    pass\n',
  javascript: 'function solve() {\n  // Write your approach here\n}\n',
  typescript: 'function solve(): void {\n  // Write your approach here\n}\n',
  java: 'class Solution {\n    public void solve() {\n        // Write your approach here\n    }\n}\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    // Write your approach here\n}\n',
}

interface SolveProblemModalProps {
  open: boolean
  problem: TodayProblem | null
  onClose: () => void
}

export default function SolveProblemModal({ open, problem, onClose }: SolveProblemModalProps) {
  const [language, setLanguage] = useState('python')
  const [solution, setSolution] = useState(STARTERS.python)
  const [revealedHints, setRevealedHints] = useState(0)
  const [submitted, setSubmitted] = useState<Session | null>(null)
  const [startedAt, setStartedAt] = useState(Date.now())
  const submitSolution = useSubmitSolution()
  const rateFeedback = useRateFeedback()

  useEffect(() => {
    if (!open || !problem) return
    setLanguage('python')
    setSolution(STARTERS.python)
    setRevealedHints(0)
    setSubmitted(null)
    setStartedAt(Date.now())
  }, [open, problem?.session_id])

  const meta = problem ? TOPIC_META[problem.topic] : null
  const hints = problem?.hints || []
  const canSubmit = !!problem?.session_id && solution.trim().length > 10 && !submitSolution.isPending
  const minutesTaken = useMemo(
    () => Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    [startedAt, submitted]
  )

  if (!open || !problem) return null

  function changeLanguage(next: string) {
    setLanguage(next)
    if (!solution.trim() || Object.values(STARTERS).includes(solution)) {
      setSolution(STARTERS[next] || '')
    }
  }

  function submit() {
    if (!problem || !canSubmit) return
    submitSolution.mutate({
      sessionId: problem.session_id,
      solution,
      language,
      timeTakenMinutes: minutesTaken,
    }, {
      onSuccess: session => setSubmitted(session),
    })
  }

  function rate(rating: number) {
    const target = submitted?.id || problem?.session_id
    if (!target) return
    rateFeedback.mutate({ sessionId: target, rating, difficultyFelt: 'right' }, {
      onSuccess: session => setSubmitted(session),
    })
  }

  const breakdown = submitted?.score_breakdown

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.84)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-xl border border-[#3f3f46] bg-[#09090b] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[#1c1c1f] bg-[#111113]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="difficulty" difficulty={problem.difficulty as 'easy' | 'medium' | 'hard'}>
                {problem.difficulty}
              </Badge>
              {meta && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ color: meta.color, background: meta.bg }}>
                  {meta.label}
                </span>
              )}
              <span className="text-[11px] text-[#52525b] font-mono">session {problem.session_id.slice(0, 8)}</span>
            </div>
            <h2 className="text-[#fafafa] font-semibold text-lg truncate">{problem.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[#71717a] text-[12px]">
              <Clock size={12} /> {problem.estimated_minutes} min
            </div>
            <button onClick={onClose} className="text-[#52525b] hover:text-[#fafafa] rounded-lg p-1 hover:bg-[#1c1c1f] transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-0 flex-1">
          <aside className="col-span-4 border-r border-[#1c1c1f] overflow-y-auto p-5 space-y-5">
            <section>
              <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Prompt</p>
              <p className="text-[#d4d4d8] text-[13px] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
            </section>

            <section>
              <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-2 font-medium">Why Hermes picked it</p>
              <div className="bg-[#1c1500] border border-[#78350f]/50 rounded-lg px-3 py-2">
                <p className="text-[#fbbf24] text-[12px] leading-relaxed">{problem.selection_reason}</p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-[#52525b] uppercase tracking-widest font-medium">Hints</p>
                {hints.length > revealedHints && (
                  <Button variant="ghost" size="sm" onClick={() => setRevealedHints(revealedHints + 1)} className="text-[11px]">
                    Reveal
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {hints.slice(0, revealedHints).map((hint, index) => (
                  <div key={hint} className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
                    <p className="text-[#f59e0b] text-[11px] font-medium mb-0.5">Hint {index + 1}</p>
                    <p className="text-[#a1a1aa] text-[12px] leading-relaxed">{hint}</p>
                  </div>
                ))}
                {revealedHints === 0 && <p className="text-[#52525b] text-[12px]">Hints stay hidden until you ask.</p>}
              </div>
            </section>
          </aside>

          <main className="col-span-8 min-h-0 flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1c1c1f] bg-[#0d0d0f]">
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={e => changeLanguage(e.target.value)}
                  className="bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-1.5 text-[12px] text-[#fafafa] outline-none focus:border-[#f59e0b]"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                {submitted && (
                  <span className="inline-flex items-center gap-1.5 text-green-400 text-[12px]">
                    <CheckCircle2 size={13} /> Reviewed
                  </span>
                )}
              </div>
              <Button variant="primary" size="sm" onClick={submit} disabled={!canSubmit} className="gap-1.5">
                {submitSolution.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {submitSolution.isPending ? 'Reviewing...' : 'Submit to Hermes'}
              </Button>
            </div>

            <div className="min-h-[360px] flex-1">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={solution}
                onChange={value => setSolution(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineNumbersMinChars: 3,
                  padding: { top: 14, bottom: 14 },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="border-t border-[#1c1c1f] bg-[#111113] max-h-[260px] overflow-y-auto">
              {!submitted ? (
                <div className="px-5 py-5 text-[#52525b] text-[13px]">
                  Hermes review will appear here after submission.
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-1">Hermes Score</p>
                      <p className="font-mono text-3xl font-semibold text-[#f59e0b] leading-none">
                        {submitted.score}<span className="text-[#52525b] text-sm">/100</span>
                      </p>
                    </div>
                    {breakdown && (
                      <div className="grid grid-cols-4 gap-2 flex-1 max-w-lg">
                        {[
                          ['Correctness', breakdown.correctness, 40],
                          ['Complexity', breakdown.complexity, 30],
                          ['Edge Cases', breakdown.edge_cases, 20],
                          ['Style', breakdown.style, 10],
                        ].map(([label, value, max]) => (
                          <div key={label} className="bg-[#1c1c1f] rounded-lg p-2 text-center">
                            <p className="text-[10px] text-[#52525b] mb-0.5">{label}</p>
                            <p className="font-mono text-[#fafafa] text-[13px]">{value}<span className="text-[#52525b] text-[10px]">/{max}</span></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <pre className="terminal-block text-[11px] whitespace-pre-wrap max-h-44 overflow-y-auto">{submitted.hermes_feedback}</pre>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-[#71717a] text-[12px]">
                      {submitted.explanation_helpful ? 'Feedback recorded.' : 'Rate this review so Hermes can adapt.'}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => rate(rating)}
                          disabled={rateFeedback.isPending || !!submitted.explanation_helpful}
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            submitted.explanation_helpful && rating <= submitted.explanation_helpful
                              ? 'bg-[#451a03] text-[#f59e0b]'
                              : 'bg-[#1c1c1f] text-[#52525b] hover:text-[#f59e0b]'
                          )}
                        >
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
      </div>
    </div>
  )
}
