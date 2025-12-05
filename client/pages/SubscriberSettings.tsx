import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchSettings, updateSettings } from "@/services/settingsService";

interface ProfileData {
  fullname: string;
  company: string;
  email: string;
}

export default function SubscriberSettings() {
  const { user } = useAuth();
  const key = useMemo(() => (user ? `subscriber_settings_${user.id}` : "subscriber_settings_anonymous"), [user]);
  const [data, setData] = useState<ProfileData>({
    name: "",
    company: "",
    email: "",
    subscription: {
      plan: "free",
    },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileData;
        setData({
          name: parsed.name ?? "",
          company: parsed.company ?? "",
          email: parsed.email ?? "",
          subscription: {
            plan: parsed.subscription?.plan ?? "free",
            updatedAt: parsed.subscription?.updatedAt,
          },
        });
      } else if (user) {
        setData({
          name: user.name ?? "",
          company: user.company ?? "",
          email: user.email ?? "",
          subscription: {
            plan: "free",
          },
        });
      }
    } catch {}
  }, [key, user]);

  function save() {
    localStorage.setItem(key, JSON.stringify(data));
    toast({ title: "Settings saved" });
  }

  function updatePlan(plan: "free" | "pro" | "business") {
    setData((d) => ({ ...d, subscription: { ...d.subscription, plan, updatedAt: Date.now() } }));
    setTimeout(() => save(), 0);
  }

  return (
    <AppShell>
      <section className="container py-6">
        <h1 className="text-2xl font-bold">My Settings</h1>
        <p className="text-muted-foreground">Manage your profile and subscription.</p>

        {/* Profile */}
        <Card className="mt-4 p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={data.name ?? ""} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={data.company ?? ""} onChange={(e) => setData((d) => ({ ...d, company: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email ?? ""} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} />
          </div>
          <Separator />

          <div className="flex justify-end">
            <Button onClick={save}>Save Settings</Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
