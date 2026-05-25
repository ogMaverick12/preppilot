'use client'
import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Card, SectionHeader } from '@/components/ui'
import { cn } from '@/lib/utils'

const RANGES = ['7d', '14d', 'All'] as const

interface TrendDataPoint {
  date: string
  score: number
  topic: string
}

interface ScoreTrendProps {
  data?: TrendDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl p-3 shadow-lg">
      <p className="text-[#71717a] text-[11px] mb-1">{label}</p>
      <p className="text-[#f59e0b] font-mono font-semibold text-base">{payload[0].value}<span className="text-[#52525b] text-xs ml-0.5">/100</span></p>
      <p className="text-[#52525b] text-[11px] mt-0.5">{payload[0].payload.topic}</p>
    </div>
  )
}

export default function ScoreTrend({ data: propData }: ScoreTrendProps) {
  const [range, setRange] = useState<typeof RANGES[number]>('All')
  const allData = propData || []
  const data = range === '7d' ? allData.slice(-7)
             : range === '14d' ? allData.slice(-14)
             : allData
  const start = data[0]?.score ?? 0

  return (
    <Card>
      <SectionHeader
        title="Score Trend"
        action={
          <div className="flex gap-0.5 bg-[#1c1c1f] rounded-lg p-0.5">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-2.5 py-1 text-[11px] rounded-md transition-all font-medium',
                  range === r ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1f] flex items-center justify-center mb-3">
            <span className="text-[#52525b] text-lg">📈</span>
          </div>
          <p className="text-[#52525b] text-[13px] font-medium">No score data yet</p>
          <p className="text-[#3f3f46] text-[11px] mt-1">Complete sessions to track your progress</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1f" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false}
              interval={range === 'All' ? 3 : 1}
            />
            <YAxis
              domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false} tickCount={5}
            />
            {start > 0 && (
              <ReferenceLine
                y={start} stroke="#3f3f46" strokeDasharray="4 4"
                label={{ value: `Start (${start})`, fill: '#52525b', fontSize: 10, position: 'insideTopLeft' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="score"
              stroke="#f59e0b" strokeWidth={2}
              fill="url(#amberGrad)"
              dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#f59e0b', r: 5, stroke: '#451a03', strokeWidth: 2 }}
              animationDuration={800} animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
