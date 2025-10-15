import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import type { LoginResponse } from "@shared/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      // const res = await fetch("/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password, remember }),
      // });
      // const data = (await res.json()) as LoginResponse | { error?: string };
      // if (!res.ok) {
      //   setErrors({ form: (data as any).error || "Login failed" });
      //   return;
      // }
      // const token = (data as LoginResponse).token;

      //const token = (data as LoginResponse).token;
      const storage = remember ? localStorage : sessionStorage;
      //storage.setItem("auth_token", token);
      storage.setItem("auth_email", email);
      toast({ title: "Welcome back", description: "Login successful" });
      window.location.href = "/dashboard";
    } catch (err) {
      setErrors({ form: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(800px_400px_at_80%_-100px,rgba(34,211,238,0.25),transparent)]" />
      <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue creating AI‑powered proposals.
          </p>
          {errors.form && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {errors.form}
            </div>
          )}
          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                />
                Remember me
              </label>
              <a href="/reset" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <a href="/register" className="text-primary hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
