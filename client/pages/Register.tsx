import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <section className="relative">
      <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your tenant
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your workspace to draft, manage, and send proposals.
          </p>
          <form className="mt-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input id="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white">
              Register
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
