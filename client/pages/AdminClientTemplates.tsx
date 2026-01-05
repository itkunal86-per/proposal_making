import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { type Proposal, listProposals, duplicateProposal, toggleShare } from "@/services/proposalsService";

export default function AdminClientTemplates() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preview, setPreview] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await listProposals();
      // Filter templates that are created for specific clients (client templates)
      const clientTemplates = data.filter((p) => p.client && p.status === "draft");
      setTemplates(clientTemplates);
      setIsLoading(false);
    })();
  }, []);

  const clients = useMemo(() => {
    return Array.from(new Set(templates.map((t) => t.client).filter(Boolean)));
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates
      .filter((t) =>
        !q
          ? true
          : [t.title, t.client, t.createdBy].some((v) => v?.toLowerCase().includes(q)) ||
            t.sections.some((s) => s.title.toLowerCase().includes(q))
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [templates, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function onDuplicate(id: string) {
    try {
      const p = await duplicateProposal(id);
      if (p) {
        toast({ title: "Template duplicated successfully" });
        nav(`/proposals/${p.id}/edit`);
      } else {
        toast({ title: "Failed to duplicate template", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error duplicating template", variant: "destructive" });
    }
  }

  async function onExportPDF(p: Proposal) {
    try {
      const shared = await toggleShare(p, true);
      const url = `${window.location.origin}/p/${shared.settings.sharing.token}?print=1`;
      window.open(url, "_blank");
    } catch (error) {
      toast({ title: "Error exporting PDF", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <section className="container py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading client templates...</p>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Clients Templates</h1>
            <p className="text-muted-foreground">Library of client-specific proposal templates.</p>
          </div>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search title, client, author, section"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-72"
            />
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="ps" className="text-xs text-muted-foreground">Rows</Label>
              <select
                id="ps"
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1 text-sm w-24"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No client templates found.</p>
                <p className="text-xs text-muted-foreground mt-2">Client templates are draft proposals associated with specific clients.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.client || "—"}</TableCell>
                      <TableCell>{t.createdBy}</TableCell>
                      <TableCell>{new Date(t.updatedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => setPreview(t)}>
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => nav(`/proposals/${t.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDuplicate(t.id)}>
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onExportPDF(t)}>
                          Export PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {filtered.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </Card>

        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quick preview</DialogTitle>
            </DialogHeader>
            {preview && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{preview.title}</h2>
                <div className="text-sm text-muted-foreground">Client: {preview.client} • Owner: {preview.createdBy}</div>
                <Separator />
                {preview.sections.map((s) => (
                  <div key={s.id} className="space-y-1">
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.content}</p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}
