import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const appShellPrefixes = ["/dashboard", "/admin", "/my", "/integrations"];
  const usesAppShell = appShellPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isPublicProposalView = pathname.startsWith("/proposal/") || pathname.startsWith("/preview/proposal/");
  const isSsoLogin = pathname === "/sso-login";
  const hideHeader = usesAppShell || isPublicProposalView || isSsoLogin;
  const hideFooter =
    usesAppShell || pathname.startsWith("/proposals") || pathname.startsWith("/p") || isPublicProposalView || isSsoLogin;
  const isProposalEditor = /^\/proposals\/[^/]+\/edit\/?$/.test(pathname);
  return (
    <div className={isProposalEditor ? "proposal-editor-shell grid h-dvh grid-rows-[auto_minmax(0,1fr)]" : "flex min-h-screen flex-col"}>
      {!hideHeader && <Header />}
      <main className={isProposalEditor ? "relative min-h-0" : "flex-1"}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
