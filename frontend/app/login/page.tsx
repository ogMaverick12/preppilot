'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithTelegram, loginAsDemo, loginWithPassword, registerWithPassword } from '@/lib/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [passwordMode, setPasswordMode] = useState<'login' | 'register'>('login')
  const [authMode, setAuthMode] = useState<'email' | 'telegram'>('email')
  const [loading, setLoading] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleTelegramLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter your Telegram username')
      return
    }
    setLoading(true)
    setActiveProvider('telegram')
    setError('')
    const success = await loginWithTelegram(username.trim().replace('@', ''))
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Could not connect. Please try again.')
    }
    setLoading(false)
    setActiveProvider(null)
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    if (passwordMode === 'register' && !displayName.trim()) {
      setError('Enter your name')
      return
    }
    setLoading(true)
    setActiveProvider('password')
    setError('')
    const success = passwordMode === 'register'
      ? await registerWithPassword({ email: email.trim(), password, displayName: displayName.trim() })
      : await loginWithPassword(email.trim(), password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError(passwordMode === 'register' ? 'Could not create account.' : 'Invalid email or password.')
    }
    setLoading(false)
    setActiveProvider(null)
  }

  const handleDemo = async () => {
    setActiveProvider('demo')
    setLoading(true)
    await loginAsDemo()
  }

  function switchAuthMode(mode: 'email' | 'telegram') {
    setAuthMode(mode)
    setError('')
    setActiveProvider(null)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(245,158,11,0.06), transparent)' }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="PrepPilot" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
          <h1 className="font-display font-bold text-2xl text-[#fafafa]">
            Welcome to <span className="text-[#f59e0b]">PrepPilot</span>
          </h1>
          <p className="text-[#71717a] text-[14px] mt-1">
            Sign in to start your interview prep journey
          </p>
        </div>

        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4 mb-5">
          <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1 mb-4">
            <button type="button" onClick={() => switchAuthMode('email')}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all ${authMode === 'email' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}>
              Email Profile
            </button>
            <button type="button" onClick={() => switchAuthMode('telegram')}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all ${authMode === 'telegram' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}>
              Telegram
            </button>
          </div>

          {authMode === 'email' ? (
            <form onSubmit={handlePasswordAuth} className="space-y-3">
              <div className="flex gap-1 bg-[#1c1c1f] rounded-lg p-1">
                {(['login', 'register'] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => setPasswordMode(mode)}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${passwordMode === mode ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}>
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>
              {passwordMode === 'register' && (
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2.5 text-[#fafafa] text-[14px] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2.5 text-[#fafafa] text-[14px] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Local password"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2.5 text-[#fafafa] text-[14px] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all"
              />
              {error && <p className="text-[#ef4444] text-[13px]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] text-[#09090b] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeProvider === 'password'
                  ? 'Connecting...'
                  : passwordMode === 'register' ? 'Create Local Account' : 'Continue with Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTelegramLogin} className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] text-[14px]">@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_telegram_username"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-8 pr-4 py-2.5 text-[#fafafa] text-[14px] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-all"
                />
              </div>
              {error && <p className="text-[#ef4444] text-[13px]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] text-[#09090b] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeProvider === 'telegram' ? 'Connecting...' : 'Continue with Telegram'}
              </button>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={() => switchAuthMode(authMode === 'email' ? 'telegram' : 'email')}
          className="w-full text-[#71717a] hover:text-[#f59e0b] text-[12px] transition-colors mb-5"
        >
          {authMode === 'email' ? 'Use Telegram username instead' : 'Use email profile instead'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#27272a]" />
          <span className="text-[#52525b] text-[11px] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#27272a]" />
        </div>

        {/* Demo mode */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full border border-[#27272a] text-[#a1a1aa] py-2.5 rounded-lg text-[13px] hover:border-[#3f3f46] hover:text-[#fafafa] transition-all disabled:opacity-50"
        >
          {activeProvider === 'demo' ? 'Loading Demo...' : 'Try Demo Mode'}
        </button>

        <p className="text-center text-[#52525b] text-[11px] mt-6">
          Local profiles stay on this machine. Hermes learns separately for each email.
        </p>
      </div>
    </div>
  )
}
