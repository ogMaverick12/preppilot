'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Code2 } from 'lucide-react'
import { TOPIC_META } from '@/lib/mock-data'
import { Card, Badge, ScoreBar } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useSessions } from '@/lib/hooks'

interface SessionData {
  id: string
  problem_title?: string
  problem_topic?: string
  problem_difficulty?: string
  score?: number
  score_breakdown?: { correctness: number; complexity: number; edge_cases: number; style: number }
  status: string
  hermes_feedback?: string
  created_at: string
}

function FeedbackBlock({ text }: { text: string }) {
  return (
    <div className="terminal-block text-[11px] mt-3 max-h-64 overflow-y-auto">
      {text.split('\n').map((line, i) => {
        const isGreen  = line.startsWith('✅')
        const isAmber  = line.startsWith('⚠️') || line.startsWith('📈')
        const isRed    = line.startsWith('❌')
        const isHeader = line.startsWith('Score:')
        return (
          <div key={i} className={cn(
            'min-h-[18px]',
            isGreen  && 'text-green-400',
            isAmber  && 'text-[#f59e0b]',
            isRed    && 'text-red-400',
            isHeader && 'text-[#fafafa] font-semibold mb-1',
            !isGreen && !isAmber && !isRed && !isHeader && 'text-[#a1a1aa]',
          )}>
            {line || '\u00A0'}
          </div>
        )
      })}
    </div>
  )
}

function SessionCard({ s }: { s: SessionData }) {
  const [open, setOpen] = useState(false)
  const topicKey = s.problem_topic || ''
  const meta = TOPIC_META[topicKey]
  const breakdown = s.score_breakdown || { correctness: 0, complexity: 0, edge_cases: 0, style: 0 }
  const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-150 hover:border-[#3f3f46]',
        open && 'border-[#3f3f46]'
      )}
      padding="none"
    >
      <div className="flex items-center gap-4 px-5 py-4" onClick={() => setOpen(!open)}>
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {s.problem_difficulty && (
              <Badge variant="difficulty" difficulty={s.problem_difficulty as 'easy' | 'medium' | 'hard'}>
                {s.problem_difficulty.charAt(0).toUpperCase() + s.problem_difficulty.slice(1)}
              </Badge>
            )}
            {meta && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ color: meta?.color, background: meta?.bg }}
              >
                {meta?.label}
              </span>
            )}
            <Badge variant="status" status={s.status}>{s.status}</Badge>
          </div>
          <h3 className="text-[#fafafa] font-medium text-[14px] leading-tight truncate">
            {s.problem_title || 'Untitled Problem'}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#52525b]">
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Score */}
        <div className="w-40 shrink-0">
          <ScoreBar score={s.score || 0} />
        </div>

        {/* Expand */}
        <div className="text-[#52525b] shrink-0">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded feedback */}
      {open && (
        <div className="px-5 pb-4 border-t border-[#1c1c1f] pt-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Correctness', val: breakdown.correctness, max: 40 },
              { label: 'Complexity',  val: breakdown.complexity,  max: 30 },
              { label: 'Edge Cases',  val: breakdown.edge_cases,  max: 20 },
              { label: 'Style',       val: breakdown.style,       max: 10 },
            ].map(b => (
              <div key={b.label} className="bg-[#1c1c1f] rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-[#52525b] mb-1">{b.label}</p>
                <p className="font-mono font-semibold text-sm text-[#fafafa]">
                  {b.val}<span className="text-[#52525b] text-[10px]">/{b.max}</span>
                </p>
              </div>
            ))}
          </div>
          {s.hermes_feedback && <FeedbackBlock text={s.hermes_feedback} />}
        </div>
      )}
    </Card>
  )
}

export default function SessionHistory() {
  const { user } = useAuth()
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  const { data, isLoading } = useSessions(user?.id, {
    topic: topic !== 'all' ? topic : undefined,
  })

  const sessions = (data?.sessions || []) as SessionData[]
  const filtered = sessions.filter(s =>
    (difficulty === 'all' || s.problem_difficulty === difficulty)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#f59e0b] cursor-pointer"
        >
          <option value="all">All Topics</option>
          {Object.entries(TOPIC_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1">
          {['all', 'easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={cn(
                'px-3 py-1 text-[11px] rounded-md font-medium transition-all capitalize',
                difficulty === d ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
              )}>
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-[#52525b] self-center ml-auto">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {filtered.map(s => <SessionCard key={s.id} s={s} />)}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#52525b]">
            <p className="text-lg mb-1">No sessions yet</p>
            <p className="text-sm">Solve problems to see your session history here</p>
          </div>
        )}
      </div>
    </div>
  )
}
