import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  type Proposal,
  createProposalApi,
  type CreateProposalInput,
  deleteProposal,
  duplicateProposal,
  listProposals,
  createProposal,
  updateProposal,
  persistProposal,
} from "@/services/proposalsService";
import { type ClientRecord, listClients } from "@/services/clientsService";
import { GenerateProposalDialog } from "@/components/GenerateProposalDialog";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
import { Wand2, MoreVertical } from "lucide-react";

export default function MyProposals() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [baseProposalForGeneration, setBaseProposalForGeneration] = useState<Proposal | null>(null);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<CreateProposalInput>({
    title: "",
    client_id: "",
    status: "draft",
    due_date: "",
  });

  useEffect(() => {
    (async () => setRows(await listProposals()))();
  }, []);

  async function loadClients() {
    try {
      setIsLoadingClients(true);
      const clientsList = await listClients();
      setClients(clientsList);
    } catch (error) {
      toast({ title: "Failed to load clients", variant: "destructive" });
    } finally {
      setIsLoadingClients(false);
    }
  }

  const handleOpenCreateDialog = async () => {
    await loadClients();
    setIsCreateDialogOpen(true);
  };

  const handleOpenGenerateDialog = async () => {
    await loadClients();
    const newProposal = await createProposal({
      title: "New Proposal",
      client: "",
    });
    setBaseProposalForGeneration(newProposal);
    setIsGenerateDialogOpen(true);
  };

  const handleProposalGenerated = async (generated: Proposal) => {
    try {
      await persistProposal(generated);
      await updateProposal(generated);
      await refresh();
      nav(`/proposals/${generated.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save generated proposal",
        variant: "destructive",
      });
    }
  };

  const mine = useMemo(() => {
    const email = user?.email?.toLowerCase();
    const list = rows.filter((p) => (email ? p.createdBy.toLowerCase() === email : true));
    const q = search.trim().toLowerCase();
    const filtered = !q
      ? list
      : list.filter((r) => [r.title, r.client, r.createdBy].some((v) => v.toLowerCase().includes(q)));
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [rows, user, search]);

  const totalPages = Math.max(1, Math.ceil(mine.length / pageSize));
  const pageRows = mine.slice((page - 1) * pageSize, page * pageSize);

  async function refresh() {
    setRows(await listProposals());
  }

  function handleFormChange(field: keyof CreateProposalInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleCreateProposal() {
    setCreateError(null);
    setFieldErrors({});
    setIsCreating(true);

    const result = await createProposalApi(formData);

    if (!result.success) {
      setCreateError(result.error || "Failed to create proposal");
      setFieldErrors(result.fieldErrors || {});
      setIsCreating(false);
      return;
    }

    toast({ title: "Proposal created successfully" });
    setFormData({ title: "", client_id: "", status: "draft", due_date: "" });
    setIsCreateDialogOpen(false);
    await refresh();

    if (result.data) {
      nav(`/my/proposals/${result.data.id}/edit`);
    }
  }

  function onDeleteClick(id: string) {
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    try {
      setIsDeleting(true);
      await deleteProposal(deleteConfirmId);
      toast({ title: "Proposal deleted" });
      await refresh();
    } catch (error) {
      toast({ title: "Failed to delete proposal", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  }

  async function onDuplicate(id: string) {
    try {
      const p = await duplicateProposal(id);
      if (p) {
        toast({ title: "Proposal duplicated successfully" });
        await refresh();
        nav(`/proposals/${p.id}/edit`);
      } else {
        toast({ title: "Failed to duplicate proposal", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error duplicating proposal", variant: "destructive" });
    }
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Proposals</h1>
            <p className="text-muted-foreground">Create and manage proposals you own.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenGenerateDialog}>
              <Wand2 className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
            <Button onClick={handleOpenCreateDialog}>New proposal</Button>
          </div>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="q" className="text-xs text-muted-foreground">Search</Label>
            <Input id="q" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-80" placeholder="Title, client, owner" />
          </div>

          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{r.client || "—"}</TableCell>
                    <TableCell className="capitalize">{r.status}</TableCell>
                    <TableCell>{new Date(r.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewProposal(r)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => nav(`/proposals/${r.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(r.id)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDeleteClick(r.id)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
        </Card>
      </section>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new proposal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                {createError}
              </div>
            )}

            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Proposal Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Website Redesign Project"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                disabled={isCreating}
                className={fieldErrors.title ? "border-red-500" : ""}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">
                Client <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleFormChange("client_id", value)}
                disabled={isCreating || isLoadingClients}
              >
                <SelectTrigger className={fieldErrors.client_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company || "No company"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.client_id && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.client_id[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="due_date" className="text-sm font-medium">
                Due Date (Optional)
              </Label>
              <Input
                id="due_date"
                type="date"
                placeholder="YYYY-MM-DD"
                value={formData.due_date}
                onChange={(e) => handleFormChange("due_date", e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProposal}
                disabled={isCreating || !formData.title || !formData.client_id}
              >
                {isCreating ? "Creating..." : "Create Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {baseProposalForGeneration && (
        <GenerateProposalDialog
          open={isGenerateDialogOpen}
          onOpenChange={setIsGenerateDialogOpen}
          baseProposal={baseProposalForGeneration}
          onProposalGenerated={handleProposalGenerated}
        />
      )}

      {previewProposal && (
        <ProposalPreviewModal
          proposal={previewProposal}
          onClose={() => setPreviewProposal(null)}
        />
      )}
    </AppShell>
  );
}
