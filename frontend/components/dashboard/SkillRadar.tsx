'use client'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import { TOPIC_META } from '@/lib/mock-data'
import { Card, SectionHeader } from '@/components/ui'
import { getDifficultyStyle } from '@/lib/utils'

interface RadarDataPoint {
  topic: string
  key: string
  score: number
  attempts: number
  difficulty?: string
}

interface SkillRadarProps {
  data?: RadarDataPoint[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const diff = getDifficultyStyle(d.difficulty || 'easy')
  return (
    <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl p-3 shadow-lg min-w-[160px]">
      <p className="text-[#fafafa] font-medium text-sm mb-1.5">{d.topic}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#71717a]">Score</span>
          <span className="font-mono font-semibold text-[#f59e0b]">{d.score}/100</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#71717a]">Attempts</span>
          <span className="font-mono text-[#d4d4d8]">{d.attempts}</span>
        </div>
        <div className="flex justify-between items-center text-[12px] mt-1">
          <span className="text-[#71717a]">Level</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ color: diff.color, background: diff.bg }}>
            {d.difficulty || 'easy'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SkillRadar({ data: propData }: SkillRadarProps) {
  const radarData = propData || []
  const hasData = radarData.some(d => d.score > 0)
  const data = radarData.map(d => ({ ...d, fullMark: 100 }))
  const avg = radarData.length > 0
    ? Math.round(radarData.reduce((a, b) => a + b.score, 0) / radarData.length)
    : 0

  return (
    <Card className="h-full">
      <SectionHeader
        title="Skill Levels"
        meta={`${radarData.length} topics`}
        action={
          <span className="text-[11px] text-[#52525b]">
            Avg <span className="text-[#f59e0b] font-mono font-semibold">{avg}</span>
          </span>
        }
      />

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1c1c1f] flex items-center justify-center mb-3">
            <span className="text-[#52525b] text-xl">📊</span>
          </div>
          <p className="text-[#52525b] text-[13px] font-medium">No skill data yet</p>
          <p className="text-[#3f3f46] text-[11px] mt-1">Solve a few problems to see your skill map</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#27272a" strokeDasharray="0" />
              <PolarAngleAxis
                dataKey="topic"
                tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90} domain={[0, 100]} tick={false} axisLine={false}
                tickCount={5}
              />
              <Radar
                dataKey="score"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="#f59e0b"
                fillOpacity={0.12}
                dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#f59e0b', r: 5, stroke: '#451a03', strokeWidth: 2 }}
                animationBegin={200}
                animationDuration={900}
                animationEasing="ease-out"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Topic pills */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {radarData.map(d => {
              const meta = TOPIC_META[d.key]
              return (
                <div
                  key={d.key}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[#1c1c1f] cursor-default"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta?.color }} />
                    <span className="text-[#a1a1aa] truncate" style={{ maxWidth: '80px' }}>{d.topic}</span>
                  </div>
                  <span className="font-mono font-semibold shrink-0 ml-1" style={{ color: meta?.color }}>{d.score}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
