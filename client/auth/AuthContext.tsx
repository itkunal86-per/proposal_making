import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'

const SSO_STORAGE_KEY = 'sso_auth_user'

export interface AuthUser {
  id: number
  name: string
  email: string
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(SSO_STORAGE_KEY) : null
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<AuthUser>('/user')
      .then((res) => {
        console.log('SSO user fetched:', res.data)
        setUser(res.data)
        localStorage.setItem(SSO_STORAGE_KEY, JSON.stringify(res.data))
      })
      .catch((err) => {
        console.log('SSO fetch failed:', err?.response?.status, err?.message)
        setUser(null)
        localStorage.removeItem(SSO_STORAGE_KEY)
      })
      .finally(() => setLoading(false))
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
