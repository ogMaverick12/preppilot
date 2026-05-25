'use client'
/**
 * Auth utilities — wraps NextAuth for use across the app.
 * Provides a simple hook and helpers for login/logout/session access.
 */
import { useSession, signIn, signOut } from 'next-auth/react'

export interface PrepPilotUser {
  id: string
  name: string
  email: string
  image?: string | null
}

/**
 * Hook to access the current authenticated user.
 * Returns { user, isAuthenticated, isLoading }.
 */
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user
      ? {
          id: (session.user as any).id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || null,
        }
      : null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session,
  }
}

export async function loginWithTelegram(username: string) {
  const result = await signIn('telegram', {
    username,
    redirect: false,
  })
  return result?.ok ?? false
}

export async function loginWithPassword(email: string, password: string) {
  const result = await signIn('password', {
    email,
    password,
    redirect: false,
  })
  return result?.ok ?? false
}

export async function registerWithPassword(data: {
  email: string
  password: string
  displayName: string
}) {
  const result = await signIn('password', {
    email: data.email,
    password: data.password,
    displayName: data.displayName,
    mode: 'register',
    redirect: false,
  })
  return result?.ok ?? false
}

export async function loginAsDemo() {
  await signIn('demo', { callbackUrl: '/dashboard' })
}

export async function logout() {
  await signOut({ callbackUrl: '/login' })
}
