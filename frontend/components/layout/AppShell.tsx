'use client'
import Sidebar from './Sidebar'
import AuthGuard from './AuthGuard'
import { cn } from '@/lib/utils'

export default function AppShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#09090b]">
        <Sidebar />
        <main className="flex-1 ml-[220px] min-h-screen">
          <div className={cn(wide ? 'w-full px-4 py-4' : 'max-w-[1280px] mx-auto px-8 py-8')}>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
