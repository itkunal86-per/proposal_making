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

export default function ProposalEditor() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Proposal | null>(null);
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
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
                <Input
                  placeholder="Client"
                  value={p.client}
                  onChange={(e) => commit({ ...p, client: e.target.value })}
                  className="w-64"
                />
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

        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr_320px]">
          {/* Left nav */}
          <Card className="p-3">
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

          {/* Editor */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={section.title}
                onChange={(e) => {
                  const next: Proposal = {
                    ...p,
                    sections: p.sections.map((x, i) =>
                      i === current ? { ...section, title: e.target.value } : x,
                    ),
                  };
                  commit(next);
                }}
                className="w-80"
              />
              <div className="text-sm">
                Total: ${valueTotal(p).toLocaleString()}
              </div>
            </div>
            <Textarea
              value={section.content}
              onChange={(e) => {
                const next: Proposal = {
                  ...p,
                  sections: p.sections.map((x, i) =>
                    i === current ? { ...section, content: e.target.value } : x,
                  ),
                };
                commit(next);
              }}
              className="mt-3 min-h-[360px]"
            />
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="img">Insert image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="img"
                    placeholder="https://..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const url = (e.target as HTMLInputElement).value.trim();
                        if (url) {
                          addMedia(url, "image");
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(
                        "img",
                      ) as HTMLInputElement;
                      const url = el.value.trim();
                      if (url) {
                        addMedia(url, "image");
                        el.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vid">Insert video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="vid"
                    placeholder="https://..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const url = (e.target as HTMLInputElement).value.trim();
                        if (url) {
                          addMedia(url, "video");
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(
                        "vid",
                      ) as HTMLInputElement;
                      const url = el.value.trim();
                      if (url) {
                        addMedia(url, "video");
                        el.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {section.media && section.media.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {section.media.map((m, i) => (
                  <div key={i} className="rounded border p-2">
                    <div className="text-xs text-muted-foreground">
                      {m.type.toUpperCase()}
                    </div>
                    {m.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt="media"
                        className="mt-1 h-40 w-full rounded object-cover"
                      />
                    ) : (
                      <video
                        src={m.url}
                        controls
                        className="mt-1 h-40 w-full rounded object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Assistant */}
          <Card className="p-4">
            <div className="text-sm font-semibold">AI Assistant</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Prompt-based content tools
            </p>
            <Separator className="my-2" />
            <Textarea
              id="prompt"
              placeholder="Describe what you want..."
              className="min-h-[120px]"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                onClick={() =>
                  aiWrite(
                    "generate",
                    (document.getElementById("prompt") as HTMLTextAreaElement)
                      .value,
                  )
                }
              >
                Generate
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  aiWrite(
                    "rewrite",
                    (document.getElementById("prompt") as HTMLTextAreaElement)
                      .value,
                  )
                }
              >
                Rewrite
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  aiWrite(
                    "summarize",
                    (document.getElementById("prompt") as HTMLTextAreaElement)
                      .value,
                  )
                }
              >
                Summarize
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  aiWrite(
                    "translate",
                    (document.getElementById("prompt") as HTMLTextAreaElement)
                      .value,
                  )
                }
              >
                Translate
              </Button>
            </div>

            <Separator className="my-3" />
            <div className="text-sm font-semibold">Comments</div>
            <div className="mt-2 flex gap-2">
              <Input id="cmt" placeholder="Add a comment" />
              <Button
                onClick={async () => {
                  const el = document.getElementById("cmt") as HTMLInputElement;
                  const v = el.value.trim();
                  if (v) {
                    await addComment(p, section.id, "you", v);
                    el.value = "";
                    const np = await getProposal(p.id);
                    if (np) setP(np);
                  }
                }}
              >
                Post
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {(section.comments ?? []).map((c) => (
                <div key={c.id} className="rounded border p-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()} • {c.author}
                  </div>
                  <div className="text-sm">{c.text}</div>
                </div>
              ))}
            </div>

            <Separator className="my-3" />
            <div className="text-sm font-semibold">Version history</div>
            <div className="mt-2 space-y-2">
              {p.versions.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No versions yet.
                </div>
              )}
              {p.versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(v.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.note || "Saved"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await updateProposal(v.data);
                      const np = await getProposal(v.data.id);
                      if (np) setP(np);
                      toast({ title: "Version restored" });
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
