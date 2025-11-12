import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  type Proposal,
  type ProposalSection,
  type ProposalStatus,
  addComment,
  addSection,
  getProposal,
  reorderSection,
  removeSection,
  updateProposal,
  valueTotal,
} from "@/services/proposalsService";
import { type ClientRecord, listClients } from "@/services/clientsService";
import { ProposalPreview } from "@/components/ProposalPreview";
import { PropertiesPanel } from "@/components/PropertiesPanel";

export default function ProposalEditor() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Proposal | null>(null);
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const found = await getProposal(id);
      if (!found) {
        nav("/proposals");
        return;
      }
      setP(found);

      try {
        setIsLoadingClients(true);
        const clientsList = await listClients();
        setClients(clientsList);
      } catch (error) {
        console.error("Failed to load clients:", error);
      } finally {
        setIsLoadingClients(false);
      }
    })();
  }, [id, nav]);

  function commit(next: Proposal, keepVersion = false, note?: string) {
    setP(next);
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void updateProposal(next, { keepVersion, note });
      setSaving(false);
    }, 400);
  }

  if (!p) return null;

  const section = p.sections[current];

  function addMedia(url: string, type: "image" | "video") {
    const s: ProposalSection = {
      ...section,
      media: [...(section.media ?? []), { url, type }],
    };
    const next: Proposal = {
      ...p,
      sections: p.sections.map((x, i) => (i === current ? s : x)),
    };
    commit(next);
  }

  function aiWrite(
    action: "generate" | "rewrite" | "summarize" | "translate",
    prompt: string,
  ) {
    let content = section.content;
    if (action === "generate") content = `${content}\n\nGenerated: ${prompt}`;
    if (action === "rewrite") content = `${content}\n\nRewritten: ${prompt}`;
    if (action === "summarize")
      content =
        content.slice(0, Math.max(80, Math.floor(content.length * 0.5))) +
        "...";
    if (action === "translate")
      content = `${content}\n\n[Translated] ${prompt}`;
    const s: ProposalSection = { ...section, content };
    const next: Proposal = {
      ...p,
      sections: p.sections.map((x, i) => (i === current ? s : x)),
    };
    commit(next, true, `${action} via assistant`);
    toast({ title: "AI assistant applied" });
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Input
                  value={p.title}
                  onChange={(e) => commit({ ...p, title: e.target.value })}
                  className="w-[28rem]"
                />
                <Select
                  value={p.client}
                  onValueChange={(value) => commit({ ...p, client: value })}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name} ({client.company || "No company"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={p.status}
                  onValueChange={(v: ProposalStatus) =>
                    commit({ ...p, status: v })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                {saving ? "Saving..." : "Saved"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr_380px]">
          {/* Left nav */}
          <Card className="p-3 h-fit">
            <div className="text-xs font-semibold">Sections</div>
            <Separator className="my-2" />
            <div className="space-y-1">
              {p.sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(i)}
                  className={`w-full rounded px-2 py-1 text-left text-sm hover:bg-muted ${i === current ? "bg-muted" : ""}`}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  const title = `Section ${p.sections.length + 1}`;
                  await addSection(p, title);
                  const np = await getProposal(p.id);
                  if (np) setP(np);
                  setCurrent(p.sections.length);
                }}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () =>
                  current > 0 && (await reorderSection(p, current, current - 1))
                }
              >
                Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () =>
                  current < p.sections.length - 1 &&
                  (await reorderSection(p, current, current + 1))
                }
              >
                Down
              </Button>
            </div>
            <div className="mt-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const id = p.sections[current].id;
                  await removeSection(p, id);
                  const np = await getProposal(p.id);
                  if (np) setP(np);
                  setCurrent(Math.max(0, current - 1));
                }}
              >
                Remove
              </Button>
            </div>

            <Separator className="my-3" />
            <div className="text-xs font-semibold">Navigation</div>
            <div className="mt-2 space-y-1 text-sm">
              <Link
                className="block text-primary hover:underline"
                to={`/proposals/${p.id}/settings`}
              >
                Settings
              </Link>
              <Link
                className="block text-primary hover:underline"
                to={`/proposals`}
              >
                Back to list
              </Link>
            </div>
          </Card>

          {/* Visual Editor Preview */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <ProposalPreview
              proposal={p}
              selectedElementId={selectedElementId}
              onSelectElement={(id, type) => {
                setSelectedElementId(id);
                setSelectedElementType(type);
              }}
            />
          </div>

          {/* Properties Panel */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <PropertiesPanel
              proposal={p}
              selectedElementId={selectedElementId}
              selectedElementType={selectedElementType}
              onUpdateProposal={(updated) => commit(updated)}
              onRemoveMedia={() => {
                setSelectedElementId(null);
                setSelectedElementType(null);
              }}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
