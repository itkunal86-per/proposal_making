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
  message?: string;
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
    // First check for SSO user in localStorage
    const ssoUserRaw = localStorage.getItem('sso_auth_user');
    console.log('AuthProvider: checking SSO user in localStorage:', ssoUserRaw);

    if (ssoUserRaw) {
      try {
        const ssoUser = JSON.parse(ssoUserRaw);
        console.log('AuthProvider: parsed SSO user:', ssoUser);

        // Convert SSO user format to AuthenticatedUser
        const convertedUser: AuthenticatedUser = {
          id: ssoUser.id.toString(),
          email: ssoUser.email,
          name: ssoUser.name,
          role: (ssoUser.org?.role as any) || 'user', // Map SSO role or default to 'user'
          company: ssoUser.org?.name || undefined,
        };
        console.log('AuthProvider: converted SSO user to:', convertedUser);
        setUser(convertedUser);
        setStatus("ready");
        return;
      } catch (err) {
        console.log('AuthProvider: failed to parse SSO user:', err);
        // Fall through to check local auth
      }
    }

    // Fall back to local auth
    const stored = getStoredAuth();
    console.log('AuthProvider: checking local auth:', stored?.user);
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

  const signUp = useCallback<AuthContextValue["signUp"]>(async ({
    name,
    email,
    password,
    company,
    phone,
    remember,
  }) => {
    const { user, token, error, fieldErrors, message } = await apiRegister({
      name,
      email,
      password,
      company,
      phone,
    });
    // If there's an actual error, return failure
    if (error) {
      return {
        success: false,
        error: error,
        fieldErrors,
      };
    }
    // Success if message exists (email verification flow) or if user exists
    if (message || user) {
      return { success: true, user: user || undefined, message };
    }
    // Fallback error case
    return {
      success: false,
      error: "Registration failed",
      fieldErrors,
    };
  }, []);

  const signOut = useCallback(async () => {
    clearAuth();
    // Clear SSO session from localStorage
    localStorage.removeItem('sso_auth_user');
    setUser(null);

    // If there's an SSO session, call logout on API and redirect to main app
    try {
      // Try to call logout endpoint if we have an API available
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok || response.status === 401) {
        // Session cleared or already expired
        const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io';
        window.location.href = mainAppUrl;
      }
    } catch {
      // If API call fails, just clear locally and stay on app
      // (user will redirect on next action)
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ status, user, signIn, signUp, signOut }), [
    signIn,
    signUp,
    signOut,
    status,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}

export { useAuthContext };
