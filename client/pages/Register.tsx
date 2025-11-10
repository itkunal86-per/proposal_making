import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string | string[];
    password?: string;
    company?: string;
    phone?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!name || name.trim().length === 0) next.name = "Name is required";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email";
    if (!password || password.length < 6) next.password = "Password must be at least 6 characters";
    if (!company || company.trim().length === 0) next.company = "Company name is required";
    if (!phone || phone.trim().length === 0) next.phone = "Phone number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        phone: phone.trim(),
        remember,
      });
      if (!result.success) {
        if (result.fieldErrors) {
          const fieldErrors: Record<string, string | string[]> = {};
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            fieldErrors[key] = messages.length === 1 ? messages[0] : messages;
          });
          setErrors(fieldErrors as typeof errors);
        } else {
          setErrors({ form: result.error || "Registration failed" });
        }
        return;
      }
      toast({ title: "Welcome!", description: "Registration successful" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent),radial-gradient(800px_400px_at_80%_-100px,rgba(34,211,238,0.25),transparent)]" />
      <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your tenant
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your workspace to draft, manage, and send proposals.
          </p>
          {errors.form && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {errors.form}
            </div>
          )}
          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                aria-invalid={!!errors.company}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
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
