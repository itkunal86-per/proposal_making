import { FileText, Sparkles, Send, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function HowItWorks() {
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

      {/* Header */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl">
            From Brief to Signed Proposal in Minutes
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            A streamlined workflow that gets proposals done faster without sacrificing quality.
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="container pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="relative">
                <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-2xl font-bold text-white">
                  1
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold">Describe Your Opportunity</h3>
                  <p className="mt-4 text-muted-foreground">
                    Tell the AI about the opportunity or paste an RFP. Provide context about the client, project scope, and key requirements.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What happens:</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>AI analyzes the RFP and identifies key requirements</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>System maps requirements to your knowledge base</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Automatically selects the best template for this proposal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Identifies gaps and suggests supporting materials</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-primary rotate-90 md:rotate-0" />
            </div>

            {/* Step 2 */}
            <div className="grid gap-10 md:grid-cols-2 md:items-center md:auto-cols-fr">
              <div className="space-y-4 md:order-2">
                <h3 className="text-lg font-semibold">What happens:</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>AI drafts each section with verified citations</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Edit sections inline without losing formatting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Add pricing tables, custom sections, and attachments</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Brand styling applied automatically throughout</span>
                  </li>
                </ul>
              </div>
              <div className="relative md:order-1">
                <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-400 text-2xl font-bold text-white">
                  2
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <Sparkles className="h-12 w-12 text-cyan-500 mb-4" />
                  <h3 className="text-2xl font-bold">Compose & Customize</h3>
                  <p className="mt-4 text-muted-foreground">
                    Review AI-generated content, edit sections, and add your customizations. Apply branding and pricing with a few clicks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-primary rotate-90 md:rotate-0" />
            </div>

            {/* Step 3 */}
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="relative">
                <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-primary text-2xl font-bold text-white">
                  3
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <Send className="h-12 w-12 text-fuchsia-500 mb-4" />
                  <h3 className="text-2xl font-bold">Send & Track</h3>
                  <p className="mt-4 text-muted-foreground">
                    Share the proposal with custom branding. Track opens, engagement, and collect e-signatures.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What happens:</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Proposal sent with your custom branding</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Real-time notifications on opens and clicks</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Collect e-signatures directly in the proposal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Detailed analytics on prospect engagement</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-primary rotate-90 md:rotate-0" />
            </div>

            {/* Step 4 */}
            <div className="grid gap-10 md:grid-cols-2 md:items-center md:auto-cols-fr">
              <div className="space-y-4 md:order-2">
                <h3 className="text-lg font-semibold">What happens:</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Signatures verified and legally binding</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Automatic document storage in your CRM</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Signed documents delivered to both parties</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">✓</span>
                    <span>Deal closed and ready for execution</span>
                  </li>
                </ul>
              </div>
              <div className="relative md:order-1">
                <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-2xl font-bold text-white">
                  4
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-sm">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-2xl font-bold">Close the Deal</h3>
                  <p className="mt-4 text-muted-foreground">
                    Collect signatures and automatically store signed agreements. Your proposal is now a signed contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Savings Section */}
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-r from-primary to-cyan-500 p-8 text-white shadow-lg md:p-12">
          <h2 className="text-3xl font-bold">See the Time Savings</h2>
          <p className="mt-4 text-white/90">
            Our users report significant improvements in proposal creation speed and quality.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold">72%</div>
              <div className="mt-2 text-sm text-white/80">Faster creation</div>
            </div>
            <div>
              <div className="text-3xl font-bold">18%</div>
              <div className="mt-2 text-sm text-white/80">Higher win rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">8 min</div>
              <div className="mt-2 text-sm text-white/80">Average send time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Ready to streamline your proposal process?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start creating better proposals faster with Proposal AI.
          </p>
          <a href={getStartedHref()}>
            <Button
              size="lg"
              className="mt-8 h-12 px-8 bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg hover:opacity-90"
            >
              Get Started
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
