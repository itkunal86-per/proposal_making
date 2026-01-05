import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { listSystemTemplates, convertSystemTemplateToProposal, createSystemTemplate, getSystemTemplateDetails, type SystemTemplate } from "@/services/systemTemplatesService";
import { createProposal, deleteProposal, type Proposal } from "@/services/proposalsService";

export default function AdminSystemTemplates() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preview, setPreview] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    refreshTemplates();
  }, []);

  async function refreshTemplates() {
    setIsLoading(true);
    const data = await listSystemTemplates();
    setTemplates(data);
    setIsLoading(false);
  }

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

  async function onEdit(template: SystemTemplate) {
    try {
      const proposal = convertSystemTemplateToProposal(template);
      const created = await createProposal(proposal);
      toast({ title: "Template opened for editing" });
      nav(`/proposals/${created.id}/edit`);
    } catch (error) {
      toast({ title: "Error opening template", variant: "destructive" });
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteProposal(id);
      toast({ title: "Template deleted successfully" });
      setDeleteConfirmId(null);
      await refreshTemplates();
    } catch (error) {
      toast({ title: "Error deleting template", variant: "destructive" });
    }
  }

  async function handleCreateTemplate() {
    if (!templateTitle.trim()) {
      setCreateError("Template title is required");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const result = await createSystemTemplate(templateTitle);
      if (result.success) {
        toast({ title: "Template created successfully" });
        setIsCreateDialogOpen(false);
        setTemplateTitle("");
        await refreshTemplates();
      } else {
        setCreateError(result.error || "Failed to create template");
      }
    } catch (error) {
      setCreateError("Error creating template");
      console.error(error);
    } finally {
      setIsCreating(false);
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>Add Template</Button>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>
                        {t.status === "Active" && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {t.status === "Inactive" && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(t.updatedAt || Date.now()).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(t)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreview(convertSystemTemplateToProposal(t))}>
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteConfirmId(t.id)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
              <DialogDescription>
                Create a new system template by entering a title.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {createError}
                </div>
              )}

              <div>
                <Label htmlFor="template-title" className="text-sm font-medium">
                  Template Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-title"
                  placeholder="e.g., Marketing Proposal"
                  value={templateTitle}
                  onChange={(e) => {
                    setTemplateTitle(e.target.value);
                    setCreateError("");
                  }}
                  disabled={isCreating}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setTemplateTitle("");
                    setCreateError("");
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={isCreating || !templateTitle.trim()}
                >
                  {isCreating ? "Creating..." : "Add Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && onDelete(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}
