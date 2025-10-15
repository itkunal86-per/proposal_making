import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  company?: string;
  email: string;
}

export default function SubscriberSettings() {
  const { user } = useAuth();
  const key = useMemo(() => (user ? `subscriber_settings_${user.id}` : "subscriber_settings_anonymous"), [user]);
  const [data, setData] = useState<ProfileData>({ name: "", company: "", email: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setData(JSON.parse(raw) as ProfileData);
      } else if (user) {
        setData({ name: user.name, company: user.company, email: user.email });
      }
    } catch {}
  }, [key, user]);

  function save() {
    localStorage.setItem(key, JSON.stringify(data));
    toast({ title: "Profile saved" });
  }

  return (
    <AppShell>
      <section className="container py-6">
        <h1 className="text-2xl font-bold">My Settings</h1>
        <p className="text-muted-foreground">Manage your profile information.</p>

        <Card className="mt-4 p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={data.company ?? ""} onChange={(e) => setData((d) => ({ ...d, company: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} />
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
