import { Fragment, ReactNode, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { buildAppCrumbs } from "@/lib/appCrumbs";
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
          <ThinFooter />
        </div>
      </div>
    </div>
  );
}

function ThinHeader() {
  const { pathname } = useLocation();
  const crumbs = buildAppCrumbs(pathname, MAIN_APP_URL);

  return (
    <div className="pitch-shell-header sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-background/80 px-4 text-sm backdrop-blur">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="font-medium text-foreground">App</span>
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.href}-${index}`}>
            <span>{index === 0 ? "•" : "/"}</span>
            {crumb.external ? (
              <a href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </a>
            ) : (
              <Link to={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </Fragment>
        ))}
      </div>
      <div className="text-muted-foreground">v1.0</div>
    </div>
  );
}

function ThinFooter() {
  return (
    <div className="pitch-shell-footer flex h-10 items-center justify-between border-t px-4 text-xs text-muted-foreground">
      <span>© {new Date().getFullYear()} Pitchsuite</span>
      <span>All systems normal</span>
    </div>
  );
}
