import AppShell from "@/components/layout/AppShell";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getProposal, toggleShare, updateProposal, valueTotal, type Proposal } from "@/services/proposalsService";

export default function ProposalSettings() {
  const { id = "" } = useParams();
  const [p, setP] = useState<Proposal | null>(null);

  useEffect(() => {
    (async () => setP((await getProposal(id)) ?? null))();
  }, [id]);
  if (!p) return null;

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Proposal Settings</h1>
          <Link className="text-sm text-primary hover:underline" to={`/proposals/${p.id}/edit`}>
            Back to editor
          </Link>
        </div>
        <Card className="mt-4 p-4">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Taxes</TabsTrigger>
              <TabsTrigger value="approval">Approval flow</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={p.title} onChange={(e) => void updateProposal({ ...p, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" value={p.client} onChange={(e) => void updateProposal({ ...p, client: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due">Due date</Label>
                <Input
                  id="due"
                  type="date"
                  value={p.settings.dueDate || ""}
                  onChange={(e) => void updateProposal({
                    ...p,
                    settings: { ...p.settings, dueDate: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea placeholder="Internal notes" />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Input value={p.pricing.currency} onChange={(e) => void updateProposal({ ...p, pricing: { ...p.pricing, currency: e.target.value } })} />
              </div>
              <div className="grid gap-2">
                <Label>Tax rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={p.pricing.taxRate}
                  onChange={(e) => void updateProposal({
                    ...p,
                    pricing: { ...p.pricing, taxRate: Number(e.target.value) },
                  })}
                />
              </div>
              <Separator />
              <div className="text-sm">Total: ${valueTotal(p).toLocaleString()}</div>
            </TabsContent>

            <TabsContent value="approval" className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label>Approval flow</Label>
                <Input value={p.settings.approvalFlow || ""} onChange={(e) => void updateProposal({ ...p, settings: { ...p.settings, approvalFlow: e.target.value } })} />
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Client view</div>
                  <div className="text-xs text-muted-foreground">Secure access with a tokenized link.</div>
                </div>
                {p.settings.sharing.public ? (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      const next = await toggleShare(p, false);
                      setP(next);
                      navigator.clipboard?.writeText("");
                      toast({ title: "Sharing disabled" });
                    }}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      const next = await toggleShare(p, true);
                      setP(next);
                      const url = `${window.location.origin}/p/${next.settings.sharing.token}`;
                      navigator.clipboard?.writeText(url);
                      toast({ title: "Sharing enabled", description: "Link copied to clipboard" });
                    }}
                  >
                    Enable & Copy Link
                  </Button>
                )}
              </div>
              {p.settings.sharing.public && (
                <div className="rounded border p-3 text-sm">
                  Share link: {" "}
                  <a className="text-primary hover:underline" href={`/p/${p.settings.sharing.token}`} target="_blank">
                    {window.location.origin}/p/{p.settings.sharing.token}
                  </a>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </section>
    </AppShell>
  );
}
