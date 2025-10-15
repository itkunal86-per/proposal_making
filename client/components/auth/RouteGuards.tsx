import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/data/users";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Access restricted</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
        <Button onClick={() => (window.location.href = fallback)}>Go back</Button>
      </div>
    );
  }

  return <Outlet />;
}
