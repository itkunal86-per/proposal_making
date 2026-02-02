export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-cyan-500" />
              <span className="text-base font-semibold">Proposal AI</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Create, manage, and send winning proposals. Enhanced with an AI
              engine powered by Retrieval-Augmented Generation (RAG).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:col-span-2 md:justify-items-end">
            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/how-it-works" className="hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy" className="hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Proposal AI. All rights reserved.</p>
          <p>Made for modern sales teams.</p>
        </div>
      </div>
    </footer>
  );
}
