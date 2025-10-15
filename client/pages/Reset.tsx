import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Reset() {
  return (
    <section className="relative">
      <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we’ll send you a reset link.
          </p>
          <form className="mt-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input id="email" type="email" autoComplete="email" />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white">
              Send reset link
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
