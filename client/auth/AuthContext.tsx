import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'

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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<AuthUser>('/api/user')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    try {
      await api.post('/logout')
    } finally {
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
