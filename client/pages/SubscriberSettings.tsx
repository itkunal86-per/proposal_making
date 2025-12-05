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
  const [data, setData] = useState<ProfileData>({
    fullname: "",
    company: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const response = await fetchSettings();
    if (response.success && response.data) {
      setData({
        fullname: response.data.fullname ?? "",
        company: response.data.company ?? "",
        email: response.data.email ?? "",
      });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to load settings",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const response = await updateSettings({
      fullname: data.fullname,
      company: data.company,
      email: data.email,
    });

    if (response.success) {
      toast({ title: "Settings saved" });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to save settings",
        variant: "destructive",
      });
    }
    setSaving(false);
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
