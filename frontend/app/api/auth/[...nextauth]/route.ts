import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'password',
      name: 'Email Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        displayName: { label: 'Name', type: 'text' },
        mode: { label: 'Mode', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password || ''
        if (!email || !password) return null
        const path = credentials?.mode === 'register' ? '/auth/register' : '/auth/verify-password'
        const body = credentials?.mode === 'register'
          ? {
              email,
              password,
              display_name: credentials?.displayName || email.split('@')[0],
              timezone: 'Asia/Kolkata',
            }
          : { email, password }

        try {
          const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (!res.ok) return null
          const user = await res.json()
          return {
            id: user.id,
            name: user.display_name || user.email || email,
            email: user.email || email,
            image: user.avatar_url || null,
          }
        } catch (e) {
          console.error('Password auth error:', e)
          return null
        }
      },
    }),
    // Telegram username login (credentials-based)
    CredentialsProvider({
      id: 'telegram',
      name: 'Telegram',
      credentials: {
        username: { label: 'Telegram Username', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null
        const username = credentials.username.replace('@', '').trim()
        if (!username) return null

        try {
          // Try lookup first
          const lookupRes = await fetch(
            `${API_BASE}/users/lookup?telegram_username=${encodeURIComponent(username)}`
          )
          if (lookupRes.ok) {
            const user = await lookupRes.json()
            return {
              id: user.id,
              name: user.display_name || user.telegram_username || username,
              email: user.email || `${username}@telegram.preppilot`,
              image: user.avatar_url || null,
            }
          }

          // Create new user
          const createRes = await fetch(`${API_BASE}/users/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth_provider: 'telegram',
              telegram_id: `web_${Date.now()}`,
              telegram_username: username,
              experience_level: 'intermediate',
            }),
          })
          if (createRes.ok) {
            const user = await createRes.json()
            return {
              id: user.id,
              name: user.display_name || username,
              email: user.email || `${username}@telegram.preppilot`,
              image: user.avatar_url || null,
            }
          }
        } catch (e) {
          console.error('Telegram auth error:', e)
        }
        return null
      },
    }),
    // Demo mode
    CredentialsProvider({
      id: 'demo',
      name: 'Demo',
      credentials: {},
      async authorize() {
        try {
          const res = await fetch(`${API_BASE}/users/demo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          if (res.ok) {
            const user = await res.json()
            return {
              id: user.id,
              name: user.display_name || 'Aarav Demo',
              email: 'demo@preppilot.local',
              image: null,
            }
          }
        } catch (e) {
          console.error('Demo auth error:', e)
        }
        // Fallback demo user
        return {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@preppilot.local',
          image: null,
        }
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
})

export { handler as GET, handler as POST }
