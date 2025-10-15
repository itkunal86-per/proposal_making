import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/data/users";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-b-primary" />
      <p className="text-sm text-muted-foreground">Loading workspace…</p>
    </div>
  );
}

export function RequireAuth() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (!roles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/dashboard" : "/my/proposals";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
