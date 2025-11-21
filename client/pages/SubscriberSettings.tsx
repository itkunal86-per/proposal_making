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
  crm?: {
    ghlApiKey: string;
    ghlLocationId: string;
    syncClients: boolean;
    syncProposals: boolean;
    lastSyncedAt?: number;
  };
  subscription?: {
    plan: "free" | "pro" | "business";
    updatedAt?: number;
  };
}

export default function SubscriberSettings() {
  const { user } = useAuth();
  const key = useMemo(() => (user ? `subscriber_settings_${user.id}` : "subscriber_settings_anonymous"), [user]);
  const [data, setData] = useState<ProfileData>({
    name: "",
    company: "",
    email: "",
    crm: {
      ghlApiKey: "",
      ghlLocationId: "",
      syncClients: true,
      syncProposals: true,
    },
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
          name: parsed.name || "",
          company: parsed.company || "",
          email: parsed.email || "",
          crm: parsed.crm || {
            ghlApiKey: "",
            ghlLocationId: "",
            syncClients: true,
            syncProposals: true,
          },
          subscription: parsed.subscription || {
            plan: "free",
          },
        });
      } else if (user) {
        setData({
          name: user.name,
          company: user.company || "",
          email: user.email,
          crm: {
            ghlApiKey: "",
            ghlLocationId: "",
            syncClients: true,
            syncProposals: true,
          },
          subscription: {
            plan: "free",
          },
        });
      }
    } catch {}
  }, [key, user]);

  async function testConnection() {
    const apiKey = data.crm.ghlApiKey.trim();
    const location = data.crm.ghlLocationId.trim();
    if (!apiKey || !location) {
      toast({ title: "Enter API key and Location ID", variant: "destructive" });
      return;
    }
    try {
      // Mock connection test - simulate API validation
      if (!apiKey.startsWith("ghl_")) {
        throw new Error("Invalid API key format");
      }
      // Simulate a successful connection check
      toast({ title: "Connection OK" });
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
    }
  }

  async function syncNow() {
    const apiKey = data.crm.ghlApiKey.trim();
    const location = data.crm.ghlLocationId.trim();
    if (!apiKey || !location) {
      toast({ title: "Enter API key and Location ID", variant: "destructive" });
      return;
    }
    try {
      const { listProposals } = await import("@/services/proposalsService");
      const { listClients } = await import("@/services/clientsService");
      const proposals = data.crm.syncProposals ? (await listProposals()).length : 0;
      const clients = data.crm.syncClients ? (await listClients()).length : 0;

      // Mock sync - in production this will connect to your Laravel API
      setData((d) => ({
        ...d,
        crm: { ...d.crm, lastSyncedAt: Date.now() },
      }));
      toast({ title: "Sync scheduled", description: `${clients} clients, ${proposals} proposals` });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    }
  }

  function save() {
    localStorage.setItem(key, JSON.stringify(data));
    toast({ title: "Settings saved" });
  }

  function updatePlan(plan: "free" | "pro" | "business") {
    setData((d) => ({ ...d, subscription: { plan, updatedAt: Date.now() } }));
    setTimeout(() => save(), 0);
  }

  return (
    <AppShell>
      <section className="container py-6">
        <h1 className="text-2xl font-bold">My Settings</h1>
        <p className="text-muted-foreground">Manage your profile, CRM integration, and subscription.</p>

        {/* Profile */}
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

          {/* CRM */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">CRM Integration</h2>
            <div className="grid gap-2">
              <Label>GHL API key</Label>
              <Input value={data.crm.ghlApiKey} onChange={(e) => setData((d) => ({ ...d, crm: { ...d.crm, ghlApiKey: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Location ID</Label>
              <Input value={data.crm.ghlLocationId} onChange={(e) => setData((d) => ({ ...d, crm: { ...d.crm, ghlLocationId: e.target.value } }))} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm"><input type="checkbox" className="mr-2" checked={data.crm.syncClients} onChange={(e) => setData((d) => ({ ...d, crm: { ...d.crm, syncClients: e.target.checked } }))} /> Sync clients</label>
              <label className="text-sm"><input type="checkbox" className="mr-2" checked={data.crm.syncProposals} onChange={(e) => setData((d) => ({ ...d, crm: { ...d.crm, syncProposals: e.target.checked } }))} /> Sync proposals</label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={testConnection}>Test connection</Button>
              <Button onClick={syncNow}>Sync now</Button>
            </div>
            {data.crm?.lastSyncedAt && (
              <div className="text-xs text-muted-foreground">Last synced: {new Date(data.crm.lastSyncedAt).toLocaleString()}</div>
            )}
          </div>

          <Separator />

          {/* Subscription */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Subscription</h2>
            <div className="flex gap-2">
              {(["free", "pro", "business"] as const).map((p) => (
                <Button key={p} variant={data.subscription?.plan === p ? "default" : "outline"} onClick={() => updatePlan(p)}>
                  {p}
                </Button>
              ))}
            </div>
            {data.subscription?.updatedAt && (
              <div className="text-xs text-muted-foreground">Updated: {new Date(data.subscription.updatedAt).toLocaleString()}</div>
            )}
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
