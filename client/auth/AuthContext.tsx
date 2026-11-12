import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'

const SSO_STORAGE_KEY = 'sso_auth_user'

export interface AuthUser {
  id: number
  name: string
  email: string
  user_type?: string | null
  role?: string | null
  avatarUrl: string | null
  org: { id: number | null; name: string | null; role: string | null; plan: string | null }
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  logout: async () => {},
})

function normalizeAuthUser(
  incoming: Partial<AuthUser> | null | undefined,
  previous: AuthUser | null,
): AuthUser | null {
  if (!incoming && !previous) return null

  const merged = {
    ...(previous ?? {}),
    ...(incoming ?? {}),
  } as AuthUser

  const orgSource = incoming && Object.prototype.hasOwnProperty.call(incoming, 'org')
    ? incoming.org
    : merged.org

  return {
    ...merged,
    avatarUrl: merged.avatarUrl ?? null,
    org: {
      id: orgSource?.id ?? null,
      name: orgSource?.name ?? null,
      role: orgSource?.role ?? null,
      plan: orgSource?.plan ?? null,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(SSO_STORAGE_KEY) : null
    if (!stored) return null
    try {
      return normalizeAuthUser(JSON.parse(stored) as AuthUser, null)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const applyPayload = (payload: Partial<AuthUser> | null) => {
      setUser((current) => {
        const next = normalizeAuthUser(payload, current)
        if (next) localStorage.setItem(SSO_STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }

    const applyStoredUser = () => {
      const stored = localStorage.getItem(SSO_STORAGE_KEY)
      if (!stored) return
      try {
        applyPayload(JSON.parse(stored) as AuthUser)
      } catch {
        localStorage.removeItem(SSO_STORAGE_KEY)
      }
    }

    window.addEventListener('sso-authenticated', applyStoredUser)

    if (window.location.pathname === '/sso-login') {
      setLoading(false)
      return () => {
        cancelled = true
        window.removeEventListener('sso-authenticated', applyStoredUser)
      }
    }

    api
      .get<AuthUser>('/api/user')
      .then((res) => {
        console.log('SSO user fetched:', res.data)
        if (!cancelled) applyPayload(res.data)
      })
      .catch((err) => {
        console.log('SSO fetch failed:', err?.response?.status, err?.message)
        if (cancelled) return
        setUser(null)
        localStorage.removeItem(SSO_STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      window.removeEventListener('sso-authenticated', applyStoredUser)
    }
  }, [])

  const logout = async () => {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem(SSO_STORAGE_KEY)
      window.location.href =
        import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
