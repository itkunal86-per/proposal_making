import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

const MAIN_APP_URL =
  import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="app-loading">Loading…</div>

  if (!user) {
    // No local session — bounce to the main app, which will re-issue an SSO token.
    window.location.href = MAIN_APP_URL
    return null
  }

  return <>{children}</>
}
