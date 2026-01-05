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
import { listSystemTemplates, convertSystemTemplateToProposal, type SystemTemplate } from "@/services/systemTemplatesService";
import { duplicateProposal, toggleShare, type Proposal } from "@/services/proposalsService";

export default function AdminSystemTemplates() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preview, setPreview] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await listSystemTemplates();
      setTemplates(data);
      setIsLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates
      .filter((t) =>
        !q ? true : t.title.toLowerCase().includes(q) || (t.description?.toLowerCase() || "").includes(q)
      )
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [templates, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function onDuplicate(template: SystemTemplate) {
    try {
      const proposal = convertSystemTemplateToProposal(template);
      const duplicated = await duplicateProposal(proposal.id);
      if (duplicated) {
        toast({ title: "Template duplicated successfully" });
        nav(`/proposals/${duplicated.id}/edit`);
      } else {
        toast({ title: "Failed to duplicate template", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error duplicating template", variant: "destructive" });
    }
  }

  async function onExportPDF(template: SystemTemplate) {
    try {
      const proposal = convertSystemTemplateToProposal(template);
      const shared = await toggleShare(proposal, true);
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
            <p className="text-muted-foreground">Loading system templates...</p>
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
            <h1 className="text-2xl font-bold">System Templates</h1>
            <p className="text-muted-foreground">Library of reusable system proposal templates.</p>
          </div>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by title or description"
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
                <p className="text-muted-foreground">No system templates found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-muted-foreground">{t.description || "—"}</TableCell>
                      <TableCell>{t.sections?.length || 0}</TableCell>
                      <TableCell>{new Date(t.updatedAt || Date.now()).toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => setPreview(convertSystemTemplateToProposal(t))}>
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDuplicate(t)}>
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
                <div className="text-sm text-muted-foreground">Sections: {preview.sections.length}</div>
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
