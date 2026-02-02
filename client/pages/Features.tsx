import { Check, Zap, Lock, BarChart3, Users, Palette } from "lucide-react";

export default function Features() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1400px_700px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(900px_450px_at_80%_-150px,rgba(34,211,238,0.25),transparent)]" />

      {/* Header */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl">
            Powerful Features for Modern Sales Teams
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Everything you need to create, manage, and send winning proposals faster with AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="container pb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="RAG Content Generation"
            description="Generate tailored proposal sections by sourcing verified facts from your docs, CRM, and past wins. AI citations keep everything trustworthy and on-brand."
          />
          <FeatureCard
            icon={Palette}
            title="Smart Templates"
            description="Reusable templates auto-filled by AI—branding, pricing, and statements kept in sync. Start with pre-built templates or create custom ones."
          />
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Role-based collaboration and approvals. Assign reviewers, track changes, and maintain version history throughout the proposal workflow."
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics & Insights"
            description="Track engagement with detailed analytics: opens, time on page, drop-off insights, and section-level engagement metrics."
          />
          <FeatureCard
            icon={Lock}
            title="Secure E-Signatures"
            description="Collect legally-binding e-signatures directly in proposals. Get notified instantly when clients sign and track signature status."
          />
          <FeatureCard
            icon={Zap}
            title="One-Click Sending"
            description="Share proposals with custom branding. Track opens, clicks, and engagement in real-time with shareable links."
          />
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="container pb-16 sm:pb-24">
        <div className="space-y-16">
          {/* Feature 1 */}
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                AI-Powered Content with RAG
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Let AI draft your proposals by pulling verified information from your knowledge base.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Retrieval-Augmented Generation (RAG) technology</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Pull facts from documents, CRM, and past proposals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Automatic citations for compliance and trust</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Reduce brand drift by 90%</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-40 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10"></div>
                <p className="text-sm text-muted-foreground">RAG-powered content generation interface</p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:auto-cols-fr">
            <div className="rounded-xl border bg-card p-6 shadow-sm md:order-2">
              <div className="space-y-4">
                <div className="h-40 rounded-lg bg-gradient-to-br from-cyan-500/10 to-emerald-400/10"></div>
                <p className="text-sm text-muted-foreground">Template management dashboard</p>
              </div>
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-bold">
                Reusable Template Library
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Build your proposal template library once, reuse forever.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Pre-built templates for common industries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Custom branding and styling per template</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Pricing tables and content blocks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Version control and template updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Advanced Analytics
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Know exactly how prospects engage with your proposals.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Real-time engagement tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Opens, clicks, and time-on-page metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Section-level engagement analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-primary shrink-0" />
                  <span className="text-sm">Drop-off insights to improve conversions</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-40 rounded-lg bg-gradient-to-br from-fuchsia-500/10 to-primary/10"></div>
                <p className="text-sm text-muted-foreground">Analytics and insights dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Why teams love Proposal AI</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience the difference with our comprehensive feature set
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Faster creation" value="-72%" />
            <StatCard label="Win rate improvement" value="+18%" />
            <StatCard label="Time to send" value="8 min" />
            <StatCard label="Brand consistency" value="+90%" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
