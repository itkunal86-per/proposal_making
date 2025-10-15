import { Button } from "@/components/ui/button";

export default function GetStarted() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(800px_400px_at_80%_-100px,rgba(34,211,238,0.25),transparent)]" />
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create your first AI-powered proposal
          </h1>
          <p className="mt-4 text-muted-foreground">
            Onboarding coming soon. In the meantime, click below to explore the
            demo experience.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button className="bg-gradient-to-r from-primary to-cyan-500 text-white shadow hover:opacity-90">
              Launch Demo
            </Button>
            <a href="/" className="text-sm text-primary hover:underline">
              Back to home
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
