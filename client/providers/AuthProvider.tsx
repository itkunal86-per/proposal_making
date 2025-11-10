import {
  clearAuth,
  getStoredAuth,
  persistAuth,
  apiAuthenticate,
  apiRegister,
  type AuthenticatedUser,
} from "@/lib/auth";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SignInResult {
  success: boolean;
  error?: string;
  user?: AuthenticatedUser;
}

interface SignUpResult {
  success: boolean;
  error?: string;
  user?: AuthenticatedUser;
  fieldErrors?: Record<string, string[]>;
}

interface AuthContextValue {
  status: "loading" | "ready";
  user: AuthenticatedUser | null;
  signIn: (params: { email: string; password: string; remember: boolean }) => Promise<SignInResult>;
  signUp: (params: { name: string; email: string; password: string; company: string; phone: string; remember: boolean }) => Promise<SignUpResult>;
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
    const { user, token, error } = await apiAuthenticate(email, password);
    if (!user || error) {
      return { success: false, error: error || "Login failed" };
    }
    persistAuth(user, token ?? undefined, remember);
    setUser(user);
    return { success: true, user };
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
