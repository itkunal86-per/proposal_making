import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  getProposalDetails,
} from "@/services/proposalsService";
import { type ClientRecord, listClients } from "@/services/clientsService";
import { GenerateProposalDialog } from "@/components/GenerateProposalDialog";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
import { TemplateSelectionModal } from "@/components/TemplateSelectionModal";
import { convertSystemTemplateToProposal, type SystemTemplate } from "@/services/systemTemplatesService";
import { Wand2, MoreVertical, FileText } from "lucide-react";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border border-slate-200",
  sent: "bg-blue-100 text-blue-700 border border-blue-200",
  accepted: "bg-green-100 text-green-700 border border-green-200",
  declined: "bg-red-100 text-red-700 border border-red-200",
};

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
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [newProposalId, setNewProposalId] = useState<string | null>(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
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

    if (result.data) {
      const proposalId = result.data.id;
      console.log("Proposal created with id:", proposalId);
      setNewProposalId(proposalId);
      setShowTemplateSelection(true);
    }

    await refresh();
  }

  async function handleTemplateSelected(template: SystemTemplate | null) {
    if (!newProposalId) return;

    try {
      if (template) {
        // Convert template to proposal and apply it
        const templateProposal = convertSystemTemplateToProposal(template);
        const updatedProposal: Proposal = {
          ...templateProposal,
          id: newProposalId,
          title: formData.title || templateProposal.title,
          client: formData.client_id ? formData.client_id : "",
        };

        await updateProposal(updatedProposal);
        await persistProposal(updatedProposal);
      }

      // Navigate to editor
      nav(`/proposals/${newProposalId}/edit`);
      setNewProposalId(null);
    } catch (error) {
      console.error("Error applying template:", error);
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      });
      nav(`/proposals/${newProposalId}/edit`);
      setNewProposalId(null);
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

  async function onPreview(proposalId: string) {
    try {
      setIsLoadingPreview(true);
      const details = await getProposalDetails(proposalId);
      if (details) {
        setPreviewProposal(details);
      } else {
        toast({ title: "Failed to load proposal", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error loading proposal", variant: "destructive" });
    } finally {
      setIsLoadingPreview(false);
    }
  }

  return (
    <AppShell>
      <section className="container py-8 px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">My Proposals</h1>
              <p className="text-base text-muted-foreground mt-1">Create and manage proposals you own</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleOpenGenerateDialog}
                className="gap-2 border-border hover:bg-muted/50"
              >
                <Wand2 className="h-4 w-4" />
                AI Generate
              </Button>
              <Button
                onClick={handleOpenCreateDialog}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-shadow"
              >
                <span>+</span>
                New proposal
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Input
              id="q"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title, client, or owner..."
              className="w-full pl-4 pr-4 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        {pageRows.length > 0 ? (
          <>
            <div className="rounded-lg border border-border bg-white/50 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent bg-muted/30">
                    <TableHead className="font-semibold text-foreground">Title</TableHead>
                    <TableHead className="font-semibold text-foreground">Client</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Created By</TableHead>
                    <TableHead className="font-semibold text-foreground">Updated</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((proposal) => (
                    <TableRow
                      key={proposal.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <button
                          onClick={() => nav(`/proposals/${proposal.id}/edit`)}
                          className="text-primary hover:underline truncate max-w-xs"
                        >
                          {proposal.title}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {proposal.client || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusStyles[proposal.status] || statusStyles.draft}`}
                        >
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {proposal.createdBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(proposal.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => onPreview(proposal.id)}
                              disabled={isLoadingPreview}
                              className="cursor-pointer"
                            >
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => nav(`/proposals/${proposal.id}/edit`)}
                              className="cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDuplicate(proposal.id)}
                              className="cursor-pointer"
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteClick(proposal.id)}
                              className="text-destructive cursor-pointer focus:text-destructive"
                            >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 py-2 text-sm font-medium text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-lg font-medium text-foreground">No proposals yet</p>
              <p className="text-sm text-muted-foreground">Create your first proposal to get started</p>
              <Button onClick={handleOpenCreateDialog} className="mt-4">
                Create Proposal
              </Button>
            </div>
          </div>
        )}
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
