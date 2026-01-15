import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { listSystemTemplates, type SystemTemplate, deleteSystemTemplate, copyProposalFromTemplate, convertSystemTemplateToProposal, getSystemTemplateDetails, createProposalFromTemplate } from "@/services/systemTemplatesService";
import { createProposal } from "@/services/proposalsService";
import { Label } from "@/components/ui/label";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
import { MoreVertical, FileText, Upload } from "lucide-react";
import { getStoredToken } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-200",
  Active: "bg-green-100 text-green-700 border border-green-200",
  inactive: "bg-slate-100 text-slate-700 border border-slate-200",
  Inactive: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function MyTemplates() {
  const { user } = useAuth();
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SystemTemplate | null>(null);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [createProposalDialogOpen, setCreateProposalDialogOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate | null>(null);
  const [previewImageTemplateId, setPreviewImageTemplateId] = useState<string | null>(null);
  const [previewImageUpload, setPreviewImageUpload] = useState<File | null>(null);
  const [isUploadingPreviewImage, setIsUploadingPreviewImage] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setIsLoading(true);
      const templatesList = await listSystemTemplates();
      setTemplates(templatesList);
    } catch (error) {
      toast({ title: "Failed to load templates", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return templates;
    }
    return templates.filter((t) => [t.title, t.status || ""].some((v) => v.toLowerCase().includes(q)));
  }, [templates, search]);

  const sortedTemplates = useMemo(() => {
    return filteredTemplates.sort((a, b) => {
      const aDate = a.updatedAt || a.createdAt || 0;
      const bDate = b.updatedAt || b.createdAt || 0;
      return bDate - aDate;
    });
  }, [filteredTemplates]);

  const totalPages = Math.max(1, Math.ceil(sortedTemplates.length / pageSize));
  const pageRows = sortedTemplates.slice((page - 1) * pageSize, page * pageSize);

  function onDeleteClick(id: string) {
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    try {
      setIsDeleting(true);
      const result = await deleteSystemTemplate(deleteConfirmId);
      if (result.success) {
        toast({ title: "Template deleted" });
        await loadTemplates();
      } else {
        toast({ title: result.error || "Failed to delete template", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting template", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  }

  async function handlePreviewTemplate(template: SystemTemplate) {
    try {
      setIsLoadingPreview(true);

      // If template doesn't have sections, fetch full details
      if (!template.sections || template.sections.length === 0) {
        const fullTemplate = await getSystemTemplateDetails(template.id);
        if (fullTemplate) {
          setPreviewTemplate(fullTemplate);
          return;
        }
      }

      // Use template as-is if it already has sections
      setPreviewTemplate(template);
    } catch (error) {
      console.error("Error loading template:", error);
      toast({ title: "Error loading template", variant: "destructive" });
    } finally {
      setIsLoadingPreview(false);
    }
  }

  function handleCreateProposal(template: SystemTemplate) {
    setSelectedTemplate(template);
    setProposalTitle(template.title);
    setCreateProposalDialogOpen(true);
  }

  async function confirmCreateProposal() {
    if (!selectedTemplate || !proposalTitle.trim()) {
      toast({ title: "Please enter a proposal title", variant: "destructive" });
      return;
    }

    try {
      setIsCreatingProposal(true);

      // Call the new API to create proposal from template
      const newProposal = await createProposalFromTemplate(String(selectedTemplate.id), proposalTitle);

      if (!newProposal || !newProposal.id) {
        throw new Error("Failed to create proposal from template");
      }

      toast({
        title: "Success",
        description: "Proposal created from template successfully",
      });

      // Close dialog and reset state
      setCreateProposalDialogOpen(false);
      setProposalTitle("");
      setSelectedTemplate(null);

      // Navigate to the proposal editor
      nav(`/proposals/${newProposal.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create proposal",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProposal(false);
    }
  }

  function onAddPreviewImage(templateId: string) {
    setPreviewImageTemplateId(templateId);
    setPreviewImageUpload(null);
  }

  function handlePreviewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: "Please select an image file", variant: "destructive" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Image must be less than 5MB", variant: "destructive" });
        return;
      }

      setPreviewImageUpload(file);
    }
  }

  async function handleUploadPreviewImage() {
    if (!previewImageUpload || !previewImageTemplateId) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }

    setIsUploadingPreviewImage(true);

    try {
      const token = getStoredToken();
      if (!token) {
        toast({ title: "Authentication required", variant: "destructive" });
        setIsUploadingPreviewImage(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', previewImageUpload);
      formData.append('template_id', previewImageTemplateId);

      const response = await fetch('https://propai-api.hirenq.com/api/templates/system/preview-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Success response
      if (data.external_response?.success && data.template) {
        toast({
          title: "Success",
          description: "Preview image uploaded successfully",
        });

        // Refresh templates to show updated preview image
        await loadTemplates();

        // Close dialog and reset state
        setPreviewImageTemplateId(null);
        setPreviewImageUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading preview image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload preview image";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingPreviewImage(false);
    }
  }

  return (
    <AppShell>
      <section className="container py-8 px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">My Templates</h1>
              <p className="text-base text-muted-foreground mt-1">Browse and manage your templates</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title or status..."
              className="w-full pl-4 pr-4 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : pageRows.length > 0 ? (
          <>
            <div className="rounded-lg border border-border bg-white/50 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent bg-muted/30">
                    <TableHead className="w-16 font-semibold text-foreground">Preview</TableHead>
                    <TableHead className="font-semibold text-foreground">Title</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Created By</TableHead>
                    <TableHead className="font-semibold text-foreground">Created</TableHead>
                    <TableHead className="font-semibold text-foreground">Updated</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((template) => (
                    <TableRow
                      key={template.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="text-primary hover:underline truncate max-w-xs"
                        >
                          {template.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusStyles[template.status || ""] || statusStyles.active}`}
                        >
                          {template.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.createdBy || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {template.createdAt ? new Date(template.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : "—"}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handlePreviewTemplate(template)}
                              className="cursor-pointer"
                            >
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCreateProposal(template)}
                              disabled={isCreatingProposal}
                              className="cursor-pointer"
                            >
                              Create Proposal
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onAddPreviewImage(template.id)}
                              className="cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Add Preview Image
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteClick(template.id)}
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
              <p className="text-lg font-medium text-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground">Create your first template to get started</p>
            </div>
          </div>
        )}
      </section>

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

      {previewTemplate && (
        <ProposalPreviewModal
          proposal={convertSystemTemplateToProposal(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          isTemplate={true}
        />
      )}

      <Dialog open={createProposalDialogOpen} onOpenChange={setCreateProposalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Proposal from Template</DialogTitle>
            <DialogDescription>
              Enter a title for your new proposal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="proposal-title" className="text-sm font-medium">
                Proposal Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="proposal-title"
                placeholder="e.g., Website Redesign Proposal"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                disabled={isCreatingProposal}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setCreateProposalDialogOpen(false)}
                disabled={isCreatingProposal}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCreateProposal}
                disabled={isCreatingProposal || !proposalTitle.trim()}
              >
                {isCreatingProposal ? "Creating..." : "Create Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewImageTemplateId !== null} onOpenChange={(open) => !open && setPreviewImageTemplateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Preview Image</DialogTitle>
            <DialogDescription>
              Upload a preview image for this template. The image will be displayed in the template selection interface.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="preview-image" className="text-sm font-medium">
                Select Image <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label htmlFor="preview-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="preview-image"
                    type="file"
                    accept="image/*"
                    onChange={handlePreviewImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {previewImageUpload && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{previewImageUpload.name}</p>
                    <p className="text-xs text-blue-700">{(previewImageUpload.size / 1024 / 1024).toFixed(2)}MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewImageTemplateId(null);
                  setPreviewImageUpload(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploadingPreviewImage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadPreviewImage}
                disabled={!previewImageUpload || isUploadingPreviewImage}
              >
                {isUploadingPreviewImage ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
