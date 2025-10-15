import { Button } from "@/components/ui/button";

export default function Header() {
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
          <a href="/login">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-cyan-500 text-white shadow hover:opacity-90"
            >
              Get Started
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
