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
      <section className="container pb-20 pt-20 sm:pb-32 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Powered by AI & RAG
          </span>
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Proposals That Win
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-muted-foreground leading-relaxed">
            Create professional, personalized proposals in minutes. AI-powered content generation, smart templates, and secure e-signatures—everything you need to close deals faster.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={getStartedHref()}>
              <Button
                size="lg"
                className="h-12 px-8 bg-primary text-white shadow-lg hover:bg-primary/90"
              >
                Start Free
              </Button>
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              View Features →
            </a>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              iconGradient="from-blue-600 to-blue-400"
              title="AI-Powered Content"
              desc="Generate customized proposal sections with facts sourced from your knowledge base."
            />
            <Feature
              iconGradient="from-purple-600 to-purple-400"
              title="Professional Templates"
              desc="Pre-built templates with consistent branding, pricing, and formatting."
            />
            <Feature
              iconGradient="from-green-600 to-green-400"
              title="Send & Track"
              desc="Send proposals, track engagement, and collect e-signatures securely."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-20 sm:py-32 border-t">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight">
            Simple workflow
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From briefing to signature in three simple steps.
          </p>
        </div>
        <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3">
          <Step
            n="1"
            title="Brief"
            desc="Input your opportunity details. AI understands requirements and accesses your knowledge base."
          />
          <Step
            n="2"
            title="Compose"
            desc="AI drafts each section with source citations. Customize, adjust pricing, and brand your proposal."
          />
          <Step
            n="3"
            title="Send & Close"
            desc="Send with one click, track opens and engagement, and collect legally-binding e-signatures."
          />
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="container py-20 sm:py-32">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <h3 className="text-4xl font-bold tracking-tight">
              Everything you need to win
            </h3>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-4">
                <Check className="mt-1 size-5 text-primary shrink-0" />
                <span className="text-base text-muted-foreground">
                  <strong className="text-foreground">Accurate content:</strong> AI pulls verified facts from your knowledge base with full citations.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="mt-1 size-5 text-primary shrink-0" />
                <span className="text-base text-muted-foreground">
                  <strong className="text-foreground">Team collaboration:</strong> Role-based access, approval workflows, and version control.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="mt-1 size-5 text-primary shrink-0" />
                <span className="text-base text-muted-foreground">
                  <strong className="text-foreground">Reusable assets:</strong> Template library, pricing modules, and content blocks.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="mt-1 size-5 text-primary shrink-0" />
                <span className="text-base text-muted-foreground">
                  <strong className="text-foreground">Detailed analytics:</strong> Track opens, engagement time, and conversion metrics.
                </span>
              </li>
            </ul>
            <div className="mt-10">
              <a href={getStartedHref()}>
                <Button className="h-11 px-6 bg-primary text-white shadow hover:bg-primary/90">
                  Get Started Free
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg dark:from-slate-900 dark:to-slate-800">
              <div className="grid gap-6 sm:grid-cols-2">
                <Stat label="Faster creation" value="72%" />
                <Stat label="Avg. win rate" value="+18%" />
                <Stat label="Time to send" value="8 min" />
                <Stat label="Less revision" value="-90%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-32 pt-20 border-t">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-12 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:gap-8">
            <div>
              <h3 className="text-4xl font-bold sm:text-5xl">
                Ready to close more deals?
              </h3>
              <p className="mt-4 text-lg text-white/80">
                Start creating winning proposals with AI today. No credit card required.
              </p>
            </div>
            <a href={getStartedHref()}>
              <Button
                size="lg"
                className="h-12 px-8 bg-white text-slate-900 font-semibold shadow-lg hover:bg-white/90"
              >
                Start Free →
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
    <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-br from-white to-slate-50 p-6 hover:shadow-md transition-shadow dark:from-slate-950 dark:to-slate-900">
      <div
        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${iconGradient}`}
      />
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="relative flex flex-col gap-4 rounded-xl border bg-gradient-to-br from-white to-slate-50 p-8 text-center hover:shadow-md transition-shadow dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-lg font-bold text-white">
        {n}
      </div>
      <div>
        <h4 className="text-xl font-semibold text-foreground">{title}</h4>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/50 backdrop-blur p-6 text-center dark:bg-slate-800/50">
      <div className="text-4xl font-bold text-primary">{value}</div>
      <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
