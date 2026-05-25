'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Check, Cpu, Loader2, Plus, X } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useHermesStatus, useUserProfile, useUpdateSettings } from '@/lib/hooks'

const STYLES = [
  { key: 'analogical',   label: 'Analogical',    desc: 'Through real-world metaphors and examples' },
  { key: 'visual',       label: 'Visual',         desc: 'Through diagrams and step-by-step state' },
  { key: 'mathematical', label: 'Mathematical',   desc: 'Through formal analysis and proofs' },
  { key: 'code-first',   label: 'Code-First',     desc: 'Through annotated code before prose' },
  { key: 'balanced',     label: 'Balanced',       desc: 'Adapt based on my ratings over time' },
]
const LEVELS = ['beginner', 'intermediate', 'advanced']
const ROLES = ['student', 'developer', 'career-switcher', 'open-source contributor']
const TRACKS = ['interviews', 'gsoc', 'gssoc', 'unstop', 'open-source', 'system-design']

function SectionLabel({ children }: { children: string }) {
  return <p className="text-[11px] text-[#52525b] uppercase tracking-widest font-medium mb-4 mt-8 first:mt-0">{children}</p>
}

export default function SettingsPage() {
  const { user } = useAuth()
  const userId = user?.id
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId)
  const { data: hermesStatus } = useHermesStatus()
  const updateSettings = useUpdateSettings(userId)

  const [displayName, setDisplayName] = useState('')
  const [level, setLevel] = useState('intermediate')
  const [developerRole, setDeveloperRole] = useState('student')
  const [primaryStack, setPrimaryStack] = useState('python')
  const [targetTrack, setTargetTrack] = useState('interviews')
  const [style, setStyle] = useState('balanced')
  const [time, setTime] = useState('08:00')
  const [timeBudget, setTimeBudget] = useState(60)
  const [tz, setTz] = useState('Asia/Kolkata')
  const [companies, setCompanies] = useState<string[]>([])
  const [compInput, setCompInput] = useState('')
  const [notifications, setNotifications] = useState({
    daily_problems: true, weekly_reports: true, streak_alerts: true, skill_updates: true,
  })
  const [saved, setSaved] = useState(false)

  // Populate from API profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.telegram_username || profile.email || '')
      setLevel(profile.experience_level || 'intermediate')
      setDeveloperRole(profile.developer_role || 'student')
      setPrimaryStack(profile.primary_stack || 'python')
      setTargetTrack(profile.target_track || 'interviews')
      setStyle(profile.explanation_style || 'balanced')
      setTime(profile.preferred_time || '08:00')
      setTimeBudget(profile.daily_time_budget || 60)
      setTz(profile.timezone || 'Asia/Kolkata')
      setCompanies(profile.target_companies || [])
      if (profile.notification_preferences) {
        setNotifications(prev => ({ ...prev, ...profile.notification_preferences }))
      }
    }
  }, [profile])

  function addCompany() {
    if (compInput.trim() && !companies.includes(compInput.trim())) {
      setCompanies([...companies, compInput.trim()])
      setCompInput('')
    }
  }

  async function saveSettings() {
    updateSettings.mutate({
      display_name: displayName,
      experience_level: level,
      developer_role: developerRole,
      primary_stack: primaryStack,
      target_track: targetTrack,
      explanation_style: style,
      daily_time_budget: timeBudget,
      preferred_time: time,
      timezone: tz,
      target_companies: companies,
      notification_preferences: notifications,
    }, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  }

  if (profileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl fade-up">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-[#fafafa] mb-1">Settings</h1>
          <p className="text-[#71717a] text-[14px]">Your coaching profile · Hermes uses this to personalize everything</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
        <Card>
          <SectionLabel>Developer Profile</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Display name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="input-dark w-full" />
            </div>
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Email</label>
              <input value={profile?.email || ''} readOnly className="input-dark w-full opacity-70" />
            </div>
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Role</label>
              <select value={developerRole} onChange={e => setDeveloperRole(e.target.value)} className="select-dark w-full">
                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Primary stack</label>
              <input value={primaryStack} onChange={e => setPrimaryStack(e.target.value)} placeholder="Python, React, Java..." className="input-dark w-full" />
            </div>
            <div className="col-span-2">
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Target track</label>
              <select value={targetTrack} onChange={e => setTargetTrack(e.target.value)} className="select-dark w-full">
                {TRACKS.map(track => <option key={track} value={track}>{track}</option>)}
              </select>
            </div>
          </div>

          {/* Experience Level */}
          <SectionLabel>Experience Level</SectionLabel>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={cn('p-3 rounded-xl border text-[13px] font-medium capitalize transition-all',
                  level === l ? 'bg-[#1c1500] border-[#f59e0b] text-[#f59e0b]' : 'bg-[#1c1c1f] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]')}>
                {level === l && <Check size={11} className="inline mr-1.5 mb-0.5" />}{l}
              </button>
            ))}
          </div>

          {/* Target Companies */}
          <div className="h-px bg-[#1c1c1f] my-6" />
          <SectionLabel>Target Companies</SectionLabel>
          <div className="flex flex-wrap gap-2 mb-3">
            {companies.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1f] border border-[#27272a] rounded-lg text-[#d4d4d8] text-[12px]">
                {c}
                <button onClick={() => setCompanies(companies.filter(x => x !== c))} className="text-[#52525b] hover:text-[#ef4444] transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={compInput} onChange={e => setCompInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCompany()}
              placeholder="Add company..." className="flex-1 bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#f59e0b] transition-colors" />
            <Button variant="secondary" size="sm" onClick={addCompany} className="gap-1"><Plus size={12} /> Add</Button>
          </div>

          {/* Schedule */}
          <div className="h-px bg-[#1c1c1f] my-6" />
          <SectionLabel>Daily Schedule</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Problem delivery time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[#f59e0b] font-mono text-[15px] outline-none focus:border-[#f59e0b] transition-colors" />
            </div>
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Daily time budget</label>
              <input type="number" min={10} max={240} value={timeBudget} onChange={e => setTimeBudget(Number(e.target.value))}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[#f59e0b] font-mono text-[15px] outline-none focus:border-[#f59e0b] transition-colors" />
            </div>
            <div>
              <label className="text-[12px] text-[#71717a] mb-1.5 block">Timezone</label>
              <select value={tz} onChange={e => setTz(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#f59e0b] transition-colors cursor-pointer">
                <option value="Asia/Kolkata">IST — India</option>
                <option value="America/New_York">ET — New York</option>
                <option value="America/Los_Angeles">PT — Los Angeles</option>
                <option value="Europe/London">GMT — London</option>
                <option value="Asia/Singapore">SGT — Singapore</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          {/* Coaching Style */}
          <div className="h-px bg-[#1c1c1f] my-6" />
          <SectionLabel>Coaching Style</SectionLabel>
          <p className="text-[12px] text-[#71717a] mb-3 -mt-2">How do you understand new concepts best?</p>
          <div className="space-y-2">
            {STYLES.map(s => (
              <button key={s.key} onClick={() => setStyle(s.key)}
                className={cn('w-full text-left p-4 rounded-xl border transition-all',
                  style === s.key ? 'bg-[#1c1500] border-[#f59e0b]' : 'bg-[#1c1c1f] border-[#27272a] hover:border-[#3f3f46]')}>
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    style === s.key ? 'border-[#f59e0b] bg-[#f59e0b]' : 'border-[#3f3f46]')}>
                    {style === s.key && <div className="w-1.5 h-1.5 rounded-full bg-[#09090b]" />}
                  </div>
                  <div>
                    <p className={cn('text-[13px] font-medium', style === s.key ? 'text-[#f59e0b]' : 'text-[#d4d4d8]')}>{s.label}</p>
                    <p className="text-[11px] text-[#52525b] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="h-px bg-[#1c1c1f] my-6" />
          <SectionLabel>Notifications</SectionLabel>
          <div className="space-y-3">
            {([
              { key: 'daily_problems', label: 'Daily problem delivery', sub: 'Local practice reminder preference' },
              { key: 'weekly_reports', label: 'Weekly coaching report', sub: 'Sunday morning progress summary' },
              { key: 'skill_updates', label: 'Skill update alerts', sub: 'When Hermes improves a skill version' },
              { key: 'streak_alerts', label: 'Streak reminders', sub: "If you haven't submitted by 8 PM" },
            ] as const).map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] text-[#d4d4d8] font-medium">{n.label}</p>
                  <p className="text-[11px] text-[#52525b] mt-0.5">{n.sub}</p>
                </div>
                <ToggleSwitch on={notifications[n.key]} onToggle={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))} />
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="mt-8">
            <Button variant="primary" size="lg" fullWidth onClick={saveSettings}
              disabled={updateSettings.isPending}
              className={cn('transition-all', saved && 'bg-green-500 hover:bg-green-500')}>
              {updateSettings.isPending ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : saved ? <><Check size={15} /> Saved</>
                : 'Save Preferences'}
            </Button>
          </div>
        </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <SectionLabel>Hermes Connection</SectionLabel>
            <div className="flex items-center gap-2 mb-3">
              {hermesStatus?.status === 'healthy'
                ? <Check size={16} className="text-green-400" />
                : <AlertTriangle size={16} className="text-[#f59e0b]" />}
              <div>
                <p className="text-[#fafafa] text-[13px] font-medium">
                  Local Hermes foundation
                </p>
                <p className="text-[#52525b] text-[11px]">
                  {hermesStatus?.wsl_hermes?.connected ? 'WSL Hermes connected' : 'Local heuristic mode active'}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-[12px]">
              <StatusRow label="Backend" value={hermesStatus?.backend || 'checking'} />
              <StatusRow label="Database" value={hermesStatus?.database?.url_kind || 'unknown'} />
              <StatusRow label="Memory" value={hermesStatus?.database?.memory_ready ? 'ready' : 'warming up'} />
              <StatusRow label="WSL" value={hermesStatus?.wsl_hermes?.connected ? hermesStatus.wsl_hermes.distro : 'not connected'} />
              <StatusRow label="Hermes CLI" value={hermesStatus?.wsl_hermes?.version || 'checking'} />
              <StatusRow label="Inference" value={hermesStatus?.hosted_inference?.mode === 'hosted_llm' ? 'optional LLM' : 'heuristic'} />
              <StatusRow label="Telegram" value={hermesStatus?.telegram?.configured ? 'configured' : 'off'} />
            </div>
            {!!hermesStatus?.issues?.length && (
              <div className="mt-3 bg-[#451a03]/50 border border-[#78350f]/50 rounded-lg p-3">
                {hermesStatus.issues.map(issue => <p key={issue} className="text-[#fbbf24] text-[11px]">{issue}</p>)}
              </div>
            )}
          </Card>

          <Card>
            <SectionLabel>Assessment</SectionLabel>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#1c1500] flex items-center justify-center">
                <Cpu size={18} className="text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-[#fafafa] text-[13px] font-medium capitalize">{profile?.hermes_level || 'uncalibrated'}</p>
                <p className="text-[#52525b] text-[11px]">Hermes-derived level</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#1c1c1f] overflow-hidden">
              <div className="h-full bg-[#f59e0b]" style={{ width: `${Math.min(100, ((profile?.assessment_completed_sessions || 0) / 3) * 100)}%` }} />
            </div>
            <p className="text-[#71717a] text-[12px] mt-2">
              {profile?.assessment_completed_sessions || 0}/3 calibration problems complete
            </p>
          </Card>
        </div>
        </div>
      </div>
    </AppShell>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1c1c1f] pb-2 last:border-b-0">
      <span className="text-[#52525b]">{label}</span>
      <span className="text-[#d4d4d8] font-mono">{value}</span>
    </div>
  )
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={cn('w-10 h-5 rounded-full transition-all shrink-0 relative', on ? 'bg-[#f59e0b]' : 'bg-[#27272a]')}>
      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', on ? 'left-5' : 'left-0.5')} />
    </button>
  )
}
