import {
  authenticate,
  clearAuth,
  getStoredAuth,
  persistAuth,
  type AuthenticatedUser,
} from "@/lib/auth";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SignInResult {
  success: boolean;
  error?: string;
  user?: AuthenticatedUser;
}

interface AuthContextValue {
  status: "loading" | "ready";
  user: AuthenticatedUser | null;
  signIn: (params: { email: string; password: string; remember: boolean }) => Promise<SignInResult>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.user) {
      setUser(stored.user);
    }
    setStatus("ready");
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(async ({
    email,
    password,
    remember,
  }) => {
    const record = authenticate(email, password);
    if (!record) {
      return { success: false, error: "Invalid email or password" };
    }
    const authUser: AuthenticatedUser = {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
      company: record.company,
    };
    persistAuth(authUser, remember);
    setUser(authUser);
    return { success: true, user: authUser };
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ status, user, signIn, signOut }), [
    signIn,
    signOut,
    status,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
