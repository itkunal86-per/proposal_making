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

  async function testConnection() {
    const apiKey = data.crm?.ghlApiKey?.trim() ?? "";
    const location = data.crm?.ghlLocationId?.trim() ?? "";
    if (!apiKey || !location) {
      toast({ title: "Enter API key and Location ID", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/integrations/ghl/test", {
        method: "POST",
        headers: { "x-ghl-key": apiKey, "x-ghl-location": location },
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Connection failed");
      toast({ title: "Connection OK" });
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
    }
  }

  async function syncNow() {
    const apiKey = data.crm?.ghlApiKey?.trim() ?? "";
    const location = data.crm?.ghlLocationId?.trim() ?? "";
    if (!apiKey || !location) {
      toast({ title: "Enter API key and Location ID", variant: "destructive" });
      return;
    }
    try {
      const { loadProposals } = await import("@/lib/proposalsStore");
      const { loadClients } = await import("@/lib/clientsStore");
      const proposals = data.crm?.syncProposals ? loadProposals().length : 0;
      const clients = data.crm?.syncClients ? loadClients().length : 0;
      const res = await fetch("/api/integrations/ghl/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposals, clients }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Sync failed");
      setData((d) => ({
        ...d,
        crm: { ...(d.crm ?? { ghlApiKey: "", ghlLocationId: "", syncClients: true, syncProposals: true }), lastSyncedAt: Date.now() },
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
          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </Card>

        {/* GoHighLevel CRM Integration */}
        <Card className="mt-6 p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">GoHighLevel CRM</h2>
            <p className="text-sm text-muted-foreground">Connect your GHL account to sync clients and proposals. Each user can connect their own account.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ghlKey">API Key</Label>
            <Input id="ghlKey" type="password" value={data.crm?.ghlApiKey ?? ""} onChange={(e) => setData((d) => ({ ...d, crm: { ...(d.crm ?? { ghlLocationId: "", syncClients: true, syncProposals: true }), ghlApiKey: e.target.value } }))} placeholder="Paste your GHL API key" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ghlLoc">Location ID</Label>
            <Input id="ghlLoc" value={data.crm?.ghlLocationId ?? ""} onChange={(e) => setData((d) => ({ ...d, crm: { ...(d.crm ?? { ghlApiKey: "", syncClients: true, syncProposals: true }), ghlLocationId: e.target.value } }))} placeholder="e.g. abc123" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={data.crm?.syncClients ?? true} onChange={(e) => setData((d) => ({ ...d, crm: { ...(d.crm ?? { ghlApiKey: "", ghlLocationId: "", syncProposals: true }), syncClients: e.target.checked } }))} /> Sync clients</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={data.crm?.syncProposals ?? true} onChange={(e) => setData((d) => ({ ...d, crm: { ...(d.crm ?? { ghlApiKey: "", ghlLocationId: "", syncClients: true }), syncProposals: e.target.checked } }))} /> Sync proposals</label>
          </div>
          <div className="text-xs text-muted-foreground">
            {data.crm?.lastSyncedAt ? `Last sync: ${new Date(data.crm.lastSyncedAt).toLocaleString()}` : "Not synced yet"}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={testConnection}>Test connection</Button>
            <Button onClick={syncNow}>Sync now</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </Card>

        {/* Subscription */}
        <Card className="mt-6 p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Subscription</h2>
            <p className="text-sm text-muted-foreground">Manage your plan. Changes apply to your user account (multi-tenant).</p>
          </div>
          <div className="grid gap-2 max-w-sm">
            <Label>Plan</Label>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={data.subscription?.plan ?? "free"}
              onChange={(e) => updatePlan(e.target.value as any)}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button onClick={save}>Update subscription</Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
