'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code2, LayoutDashboard, TrendingUp, BookOpen, Settings, Zap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { useAuth, logout } from '@/lib/auth'

const NAV = [
  { href: '/dashboard' as const, label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/solve' as const,     label: 'Solve',      icon: Code2           },
  { href: '/progress' as const,  label: 'Progress',   icon: TrendingUp      },
  { href: '/problems' as const,  label: 'Problems',   icon: BookOpen        },
  { href: '/settings' as const,  label: 'Settings',   icon: Settings        },
] as const

export default function Sidebar() {
  const path = usePathname()
  const { user } = useAuth()

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-[#09090b] border-r border-[#1c1c1f] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1c1c1f]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="PrepPilot" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-semibold text-[15px]">
            <span className="text-[#fafafa]">Prep</span>
            <span className="text-[#f59e0b]">Pilot</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-all duration-100 group',
                active
                  ? 'bg-[#451a03] text-[#f59e0b] font-medium border-l-2 border-[#f59e0b] pl-2.5'
                  : 'text-[#71717a] hover:text-[#d4d4d8] hover:bg-[#1c1c1f]'
              )}
            >
              <Icon size={15} className={active ? 'text-[#f59e0b]' : 'text-[#52525b] group-hover:text-[#71717a]'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-[#1c1c1f] space-y-3">
        {/* User info */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#09090b] text-[11px] font-bold">{initial}</span>
                </div>
              )}
              <span className="text-[#a1a1aa] text-[12px] truncate">{displayName}</span>
            </div>
            <button
              onClick={() => logout()}
              className="text-[#52525b] hover:text-[#ef4444] transition-colors p-1 flex-shrink-0"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}

        {/* Agent status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-[11px] text-[#52525b]">Agent active</span>
          </div>
          <Badge variant="version">v1.4</Badge>
        </div>

        {/* Hermes credit */}
        <div className="flex items-center gap-1.5 text-[#3f3f46] text-[10px]">
          <Zap size={10} />
          <span>Powered by Hermes Agent</span>
        </div>
      </div>
    </aside>
  )
}
