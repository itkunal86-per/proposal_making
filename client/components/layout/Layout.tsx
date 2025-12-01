import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const appShellPrefixes = ["/dashboard", "/admin", "/my", "/integrations"];
  const usesAppShell = appShellPrefixes.some((prefix) => pathname.startsWith(prefix));
  const hideHeader = usesAppShell;
  const hideFooter =
    usesAppShell || pathname.startsWith("/proposals") || pathname.startsWith("/p");
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
