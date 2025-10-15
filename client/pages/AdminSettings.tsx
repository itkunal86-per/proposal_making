import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AdminSettingsData {
  orgName: string;
  emailFrom: string;
  enableInvites: boolean;
}

const STORAGE_KEY = "admin_settings";

export default function AdminSettings() {
  const [data, setData] = useState<AdminSettingsData>({
    orgName: "",
    emailFrom: "",
    enableInvites: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as AdminSettingsData);
    } catch {}
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast({ title: "Settings saved" });
  }

  return (
    <AppShell>
      <section className="container py-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Organization-wide configuration.</p>

        <Card className="mt-4 p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org">Organization name</Label>
            <Input
              id="org"
              value={data.orgName}
              onChange={(e) => setData((d) => ({ ...d, orgName: e.target.value }))}
              placeholder="Acme Inc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="from">Email from address</Label>
            <Input
              id="from"
              type="email"
              value={data.emailFrom}
              onChange={(e) => setData((d) => ({ ...d, emailFrom: e.target.value }))}
              placeholder="noreply@acme.com"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable user invites</div>
              <div className="text-sm text-muted-foreground">Allow admins to invite new users via email.</div>
            </div>
            <Switch
              checked={data.enableInvites}
              onCheckedChange={(v) => setData((d) => ({ ...d, enableInvites: v }))}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
