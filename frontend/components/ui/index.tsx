'use client'
import { cn } from '@/lib/utils'
import { getScoreColor, getDifficultyStyle, getStatusStyle } from '@/lib/utils'
import { TOPIC_META } from '@/lib/mock-data'
import React from 'react'

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'amber' | 'ghost'
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ className, variant = 'default', padding = 'md', children, ...props }: CardProps) {
  const padMap = { sm: 'p-4', md: 'p-5', lg: 'p-7', none: '' }
  const variantMap = {
    default: 'bg-[#111113] border border-[#27272a] hover:border-[#3f3f46] transition-colors',
    amber:   'bg-[#451a03] border border-[#78350f]',
    ghost:   'border border-[#27272a] bg-transparent',
  }
  return (
    <div
      className={cn('rounded-xl', variantMap[variant], padMap[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }: ButtonProps) {
  const variantMap = {
    primary:   'bg-[#f59e0b] text-[#09090b] font-semibold hover:bg-[#d97706] active:bg-[#b45309]',
    secondary: 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46] hover:bg-[#3f3f46]',
    ghost:     'bg-transparent text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-[#fafafa]',
    danger:    'bg-[#450a0a] text-[#f87171] border border-[#7f1d1d] hover:text-[#ef4444]',
  }
  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-100 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantMap[variant], sizeMap[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'difficulty' | 'status' | 'topic' | 'version' | 'default'
  difficulty?: 'easy' | 'medium' | 'hard'
  status?: string
  topic?: string
  className?: string
}

export function Badge({ children, variant = 'default', difficulty, status, topic, className }: BadgeProps) {
  let style: React.CSSProperties = {}
  let base = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium font-sans leading-none'

  if (variant === 'difficulty' && difficulty) {
    const s = getDifficultyStyle(difficulty)
    style = { color: s.color, background: s.bg, border: `1px solid ${s.border}` }
  } else if (variant === 'status' && status) {
    const s = getStatusStyle(status)
    style = { color: s.color, background: s.bg }
    children = s.label
  } else if (variant === 'topic' && topic) {
    const meta = TOPIC_META[topic]
    if (meta) style = { color: meta.color, background: meta.bg, borderLeft: `2px solid ${meta.color}`, paddingLeft: '6px' }
  } else if (variant === 'version') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#451a03] border border-[#78350f] text-[#fbbf24] font-mono text-[11px] font-medium shadow-glow-amber-sm', className)}>
        <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
        {children}
      </span>
    )
  }

  return <span className={cn(base, className)} style={style}>{children}</span>
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ score, showNumber = true, height = 6, width }: {
  score: number; showNumber?: boolean; height?: number; width?: string
}) {
  const color = getScoreColor(score)
  return (
    <div className={cn('flex items-center gap-2.5', width)}>
      {showNumber && (
        <span className="font-mono font-semibold text-sm tabular-nums" style={{ color }}>
          {score}
        </span>
      )}
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, background: '#27272a' }}>
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${score}%`, background: color, animationFillMode: 'forwards' }}
        />
      </div>
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <div className="flex-1 h-px bg-[#27272a]" />
        <span className="text-[11px] font-medium text-[#52525b] uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px bg-[#27272a]" />
      </div>
    )
  }
  return <div className={cn('h-px bg-[#27272a] my-4', className)} />
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, trend, icon }: {
  label: string; value: string | number; sub?: string; trend?: { value: number; label: string }; icon?: React.ReactNode
}) {
  const trendPos = trend && trend.value > 0
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-widest">{label}</span>
        {icon && <span className="text-[#52525b]">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-mono font-semibold text-3xl text-[#fafafa] leading-none">{value}</span>
        {trend && (
          <span className={cn('text-xs font-medium mb-0.5', trendPos ? 'text-green-400' : 'text-red-400')}>
            {trendPos ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
          </span>
        )}
      </div>
      {sub && <p className="text-[13px] text-[#71717a]">{sub}</p>}
    </Card>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, meta }: {
  title: string; action?: React.ReactNode; meta?: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-semibold text-[#fafafa]">{title}</h2>
        {meta && <span className="text-[11px] text-[#52525b] bg-[#1c1c1f] px-2 py-0.5 rounded-full">{meta}</span>}
      </div>
      {action}
    </div>
  )
}
