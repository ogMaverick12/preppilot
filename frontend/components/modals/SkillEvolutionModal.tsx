'use client'
import { useState } from 'react'
import { X, Zap, ChevronRight } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SkillVersionData {
  skill: string
  version: string
  date: string
  summary: string
  trigger: string
  trigger_detail: string
  content: string
  isLatest: boolean
}

interface SkillEvolutionModalProps {
  open: boolean
  onClose: () => void
  versions?: SkillVersionData[]
}

function CodeLine({ line }: { line: string }) {
  const isHeader = line.startsWith('##')
  const isKey = /^(version|created|last_improved):/.test(line.trim())
  const isComment = line.startsWith('v1.') && line.includes(':')

  return (
    <div
      className={cn(
        'min-h-[20px] font-mono text-[12px] leading-[20px] px-2',
        isHeader && 'text-[#f59e0b]',
        isKey && 'text-[#60a5fa]',
        isComment && 'text-[#71717a] italic',
        !isHeader && !isKey && !isComment && 'text-[#d4d4d8]',
      )}
    >
      {line || '\u00A0'}
    </div>
  )
}

export default function SkillEvolutionModal({ open, onClose, versions: propVersions }: SkillEvolutionModalProps) {
  const versions = (propVersions || []).map((v, i) => ({ ...v, isLatest: i === 0 }))
  const [selected, setSelected] = useState(versions[0]?.version || '1.0')
  const latestVersion = versions[0]?.version || '1.0'

  if (!open) return null

  const selectedVersion = versions.find(v => v.version === selected) || versions[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: '#111113',
          border: '1px solid #78350f',
          boxShadow: '0 0 0 1px #78350f, 0 0 24px rgba(245,158,11,0.2), 0 0 48px rgba(245,158,11,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-[#fafafa]">Skill Evolution</h2>
            <Badge variant="version">v{latestVersion}</Badge>
          </div>
          {/* Skill tabs */}
          <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1">
            {['Problem Selector', 'Solution Reviewer', 'Coach Profiler'].map((s, i) => (
              <button key={s} className={cn(
                'px-3 py-1.5 text-[11px] rounded-md transition-all font-medium',
                i === 0 ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
              )}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-[#52525b] hover:text-[#fafafa] transition-colors p-1 rounded-lg hover:bg-[#1c1c1f]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: version list */}
          <div className="w-64 border-r border-[#1c1c1f] overflow-y-auto py-2 shrink-0">
            {versions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[#52525b] text-[12px]">No versions yet</p>
              </div>
            ) : (
              versions.map(v => (
                <button
                  key={v.version}
                  onClick={() => setSelected(v.version)}
                  className={cn(
                    'w-full text-left px-4 py-3 transition-all',
                    selected === v.version
                      ? 'bg-[#1c1500] border-l-2 border-[#f59e0b]'
                      : 'hover:bg-[#1c1c1f] border-l-2 border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {v.isLatest && <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />}
                    <span className={cn('font-mono font-semibold text-[13px]', selected === v.version ? 'text-[#f59e0b]' : 'text-[#71717a]')}>
                      v{v.version}
                    </span>
                    <span className="text-[10px] text-[#52525b]">{v.date.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={9} className="text-[#52525b] shrink-0" />
                    <span className="text-[10px] text-[#52525b] line-clamp-1">{v.trigger}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right: skill file */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1c1f] bg-[#0d0d0f]">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-[#52525b] font-mono">problem_selector.md</span>
                <ChevronRight size={12} className="text-[#3f3f46]" />
                <span className="text-[#f59e0b] font-mono">v{selected}</span>
              </div>
            </div>

            {/* Code view */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="terminal-block">
                {(selectedVersion?.content || `# No content available for v${selected}`)
                  .split('\n').map((line, i) => (
                    <CodeLine key={i} line={line} />
                  ))}
              </div>
            </div>

            {/* Trigger bar */}
            {selectedVersion && (
              <div className="px-5 py-3 border-t border-[#1c1c1f] bg-[#0d0d0f] flex items-start gap-2.5">
                <Zap size={14} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#71717a] font-medium uppercase tracking-wide mb-0.5">
                    What triggered v{selected}
                  </p>
                  <p className="text-[12px] text-[#a1a1aa] leading-relaxed">
                    {selectedVersion.trigger_detail}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
