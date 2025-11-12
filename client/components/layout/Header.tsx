import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, signOut, status } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-cyan-500" />
          <span className="text-lg font-semibold tracking-tight">
            Proposal AI
          </span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {status === "ready" && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
                title={user.email}
              >
                {user.email.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg z-50">
                  <div className="border-b px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">
                      {user.email}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <a href="/my/settings" onClick={() => setDropdownOpen(false)}>
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login">
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-cyan-500 text-white shadow hover:opacity-90"
              >
                Get Started
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
