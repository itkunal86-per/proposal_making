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
import { useEffect, useMemo, useState, useRef } from "react";
import { MoreHorizontal, Upload } from "lucide-react";
import { listSystemTemplates, convertSystemTemplateToProposal, createSystemTemplate, getSystemTemplateDetails, deleteSystemTemplate, type SystemTemplate } from "@/services/systemTemplatesService";
import { createProposal, type Proposal } from "@/services/proposalsService";
import { getStoredToken } from "@/lib/auth";

export default function AdminSystemTemplates() {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [previewImageTemplateId, setPreviewImageTemplateId] = useState<string | null>(null);
  const [previewImageUpload, setPreviewImageUpload] = useState<File | null>(null);
  const [isUploadingPreviewImage, setIsUploadingPreviewImage] = useState(false);

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
      const details = await getSystemTemplateDetails(String(template.id));
      if (!details) {
        toast({ title: "Failed to load template details", variant: "destructive" });
        return;
      }

      const proposal = convertSystemTemplateToProposal(details);
      // Save to localStorage so ProposalEditor can access it
      localStorage.setItem(`template_draft_${template.id}`, JSON.stringify(proposal));

      toast({ title: "Template opened for editing" });
      // Create a unique ID for this template edit session
      const editSessionId = `template_${template.id}_${Date.now()}`;
      nav(`/proposals/${editSessionId}/edit?templateId=${template.id}`);
    } catch (error) {
      console.error("Error opening template:", error);
      toast({ title: "Error opening template", variant: "destructive" });
    }
  }

  async function onDelete(id: string) {
    try {
      const result = await deleteSystemTemplate(id);
      if (result.success) {
        toast({ title: "Template deleted successfully" });
        setDeleteConfirmId(null);
        await refreshTemplates();
      } else {
        toast({ title: result.error || "Error deleting template", variant: "destructive" });
      }
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
        await refreshTemplates();

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
                            <DropdownMenuItem onClick={() => onAddPreviewImage(t.id)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Add Preview Image
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
      </section>
    </AppShell>
  );
}
