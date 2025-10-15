import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const hideHeader = pathname.startsWith("/dashboard") || pathname.startsWith("/user");
  const hideFooter =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/user") ||
    pathname.startsWith("/proposals") ||
    pathname.startsWith("/p");
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
