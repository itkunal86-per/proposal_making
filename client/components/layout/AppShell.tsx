import { ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appPageTitle } from "@/lib/appCrumbs";
import { buildSidebarMenu } from "@/lib/sidebarNav";
import { useAuth } from "@/hooks/useAuth";
import AppSidebar from "./AppSidebar";
import "@/styles/pitch-app.css";

const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL ?? "https://pitchsuite.io/";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const menu = useMemo(() => buildSidebarMenu(user, MAIN_APP_URL), [user]);

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pitch-shell">
      {user && (
        <AppSidebar
          menu={menu}
          pathname={location.pathname}
          homeHref={MAIN_APP_URL}
          userName={user.name || user.email}
          userId={user.id}
          company={user.company}
          onSignOut={handleSignOut}
        />
      )}
      <div className="pitch-shell-main">
        <div className="pitch-shell-stage">
          <ThinHeader />
          <main className="pitch-app min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function ThinHeader() {
  const { pathname } = useLocation();

  return (
    <div className="pitch-shell-header">
      <div className="pitch-shell-header-content">
        <h1 className="pitch-shell-title">{appPageTitle(pathname)}</h1>
      </div>
    </div>
  );
}
