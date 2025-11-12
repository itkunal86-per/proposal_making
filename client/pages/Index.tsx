import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, status } = useAuth();

  const getStartedHref = () => {
    if (status === "ready" && user) {
      return user.role === "admin" ? "/dashboard" : "/my/proposals";
    }
    return "/login";
  };
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1400px_700px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(900px_450px_at_80%_-150px,rgba(34,211,238,0.25),transparent)]" />

      {/* Hero */}
      <section className="container pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-primary to-cyan-500" />
            AI Engine with Retrieval-Augmented Generation (RAG)
          </span>
          <h1 className="mt-6 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-6xl">
            AI-Powered Proposal Management System
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Create, manage, and send winning proposals faster. Let the AI engine
            suggest content, assemble templates, and personalize with RAG that
            pulls facts from your knowledge base.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/login">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg hover:opacity-90"
              >
                Get Started
              </Button>
            </a>
            <a
              href="#features"
              className="text-sm text-primary hover:underline"
            >
              See features
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl rounded-xl border bg-card/60 p-3 backdrop-blur">
          <div className="rounded-lg border bg-background p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3">
              <Feature
                iconGradient="from-primary to-cyan-500"
                title="RAG Content Generation"
                desc="Generate tailored proposal sections by sourcing verified facts from your docs, CRM, and past wins."
              />
              <Feature
                iconGradient="from-cyan-500 to-emerald-400"
                title="Smart Templates"
                desc="Reusable templates auto-filled by AI—branding, pricing, and statements kept in sync."
              />
              <Feature
                iconGradient="from-fuchsia-500 to-primary"
                title="Send, Track, E‑Sign"
                desc="One-click sending with analytics and secure e‑sign to close deals faster."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From brief to signed proposal in minutes.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          <Step
            n="1"
            title="Brief"
            desc="Describe the opportunity or paste an RFP. AI maps requirements and pulls relevant knowledge."
          />
          <Step
            n="2"
            title="Compose"
            desc="RAG drafts each section with citations. Edit inline, drop in pricing, and apply your brand."
          />
          <Step
            n="3"
            title="Send"
            desc="Share, track engagement, and collect legally‑binding e‑signatures."
          />
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="container pb-16 sm:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Built for speed, accuracy, and brand consistency
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 text-primary" />
                <span>
                  RAG citations keep content trustworthy and on‑brand.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 text-primary" />
                <span>Role‑based collaboration and approvals.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 text-primary" />
                <span>
                  Template libraries, pricing tables, and content blocks.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 text-primary" />
                <span>
                  Analytics: opens, time on page, and drop‑off insights.
                </span>
              </li>
            </ul>
            <div className="mt-8">
              <a href="/login">
                <Button className="bg-gradient-to-r from-primary to-cyan-500 text-white shadow hover:opacity-90">
                  Start free
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),rgba(34,211,238,0.08))]" />
              <div className="relative p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Stat label="Faster creation" value="-72%" />
                  <Stat label="Win rate" value="+18%" />
                  <Stat label="Time to send" value="8 min" />
                  <Stat label="Brand drift" value="-90%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary to-cyan-500 p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                Let AI draft your next proposal
              </h3>
              <p className="mt-1 text-white/90">
                Try the RAG‑powered workflow free.
              </p>
            </div>
            <a href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 bg-white text-primary hover:bg-white/90"
              >
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  iconGradient,
  title,
  desc,
}: {
  iconGradient: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border p-5">
      <div
        className={`h-10 w-10 shrink-0 rounded-md bg-gradient-to-br ${iconGradient}`}
      />
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white">
        {n}
      </div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
