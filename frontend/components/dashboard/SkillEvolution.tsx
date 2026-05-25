'use client'
import { useState } from 'react'
import { ExternalLink, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, Badge, Button, SectionHeader } from '@/components/ui'
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

interface SkillEvolutionProps {
  onViewFull?: () => void
  versions?: SkillVersionData[]
}

export default function SkillEvolution({ onViewFull, versions: propVersions }: SkillEvolutionProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const versions = (propVersions || []).map((v, i) => ({
    ...v,
    isLatest: i === 0,
    timelineKey: `${v.skill}-${v.version}-${v.date}-${i}`,
  }))
  const latestVersion = versions[0]?.version || '1.0'

  if (versions.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <SectionHeader title="Skill Evolution" />
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1c1c1f] flex items-center justify-center mb-3">
            <Zap size={20} className="text-[#52525b]" />
          </div>
          <p className="text-[#52525b] text-[13px] font-medium">No skill evolution yet</p>
          <p className="text-[#3f3f46] text-[11px] mt-1">Hermes improves every 10 sessions</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <SectionHeader
        title="Skill Evolution"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="version">v{latestVersion}</Badge>
            <Button variant="ghost" size="sm" className="text-[11px] gap-1" onClick={onViewFull}>
              View full <ExternalLink size={10} />
            </Button>
          </div>
        }
      />

      {/* Skill selector */}
      <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1 mb-4">
        {['Problem Selector', 'Solution Reviewer', 'Coach Profiler'].map((s, i) => (
          <button key={s} className={cn(
            'flex-1 text-[10px] py-1.5 rounded-md transition-all font-medium leading-tight',
            i === 0 ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
          )}>
            {s}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {versions.map((v, idx) => (
          <div key={v.timelineKey} className="relative">
            {/* Connector line */}
            {idx < versions.length - 1 && (
              <div className="absolute left-[7px] top-6 w-px h-full bg-[#27272a] -z-0" />
            )}

            <div
              className={cn(
                'relative flex gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-150',
                v.isLatest ? 'bg-[#1c1500] border border-[#78350f]/40' : 'hover:bg-[#1c1c1f]',
                expanded === v.timelineKey && !v.isLatest && 'bg-[#1c1c1f]'
              )}
              onClick={() => setExpanded(expanded === v.timelineKey ? null : v.timelineKey)}
            >
              {/* Dot */}
              <div className="shrink-0 mt-0.5">
                {v.isLatest
                  ? <span className="pulse-dot w-3.5 h-3.5 rounded-full bg-[#f59e0b] inline-block shadow-glow-amber-sm" />
                  : <span className="w-3.5 h-3.5 rounded-full bg-[#27272a] border border-[#3f3f46] inline-block" />
                }
              </div>

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'font-mono font-semibold text-[12px]',
                      v.isLatest ? 'text-[#f59e0b]' : 'text-[#71717a]'
                    )}>
                      v{v.version}
                    </span>
                    <span className="text-[#52525b] text-[10px]">— {v.date}</span>
                  </div>
                  {!v.isLatest && (
                    expanded === v.timelineKey
                      ? <ChevronUp size={12} className="text-[#52525b] shrink-0" />
                      : <ChevronDown size={12} className="text-[#52525b] shrink-0" />
                  )}
                </div>

                {/* Summary */}
                <p className="text-[#a1a1aa] text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                  {v.summary}
                </p>

                {/* Trigger chip */}
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap size={9} className={v.isLatest ? 'text-[#f59e0b]' : 'text-[#52525b]'} />
                  <span className={cn(
                    'text-[10px] italic',
                    v.isLatest ? 'text-[#d97706]' : 'text-[#52525b]'
                  )}>
                    {v.trigger}: {v.trigger_detail.length > 55 ? v.trigger_detail.slice(0, 55) + '…' : v.trigger_detail}
                  </span>
                </div>

                {/* Expanded content */}
                {expanded === v.timelineKey && !v.isLatest && v.content && (
                  <div className="mt-2 terminal-block text-[10px] max-h-32 overflow-y-auto">
                    {v.content.split('\n').map((line, i) => (
                      <div key={i} className={cn(
                        line.startsWith('##') && 'line-header',
                        line.startsWith('version:') || line.startsWith('created:') ? 'line-key' : '',
                        line.startsWith('#') && !line.startsWith('##') ? 'text-[#a1a1aa]' : ''
                      )}>
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#1c1c1f]">
        <Button variant="ghost" size="sm" fullWidth onClick={onViewFull} className="text-[#52525b] text-[11px] hover:text-[#f59e0b]">
          View full skill file & diff →
        </Button>
      </div>
    </Card>
  )
}
