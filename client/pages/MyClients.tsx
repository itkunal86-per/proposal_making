import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MoreVertical, Users as UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type ClientRecord, type ClientStatus, type CreateClientResult, type UpdateClientResult, type DeleteClientResult, listClients, createClient, updateClient, deleteClient } from "@/services/clientsService";

export default function MyClients() {
  const [rows, setRows] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [openEdit, setOpenEdit] = useState<null | ClientRecord>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clientId: string; clientName: string }>({ open: false, clientId: "", clientName: "" });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => { (async () => setRows(await listClients()))(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (!q ? true : [r.name, r.email, r.company ?? ""].some((v) => v.toLowerCase().includes(q))))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return list;
  }, [rows, search, status]);

  async function refresh() {
    setRows(await listClients());
  }

  async function syncFromGHL() {
    setIsSyncing(true);
    try {
      const response = await fetch("https://propai-api.hirenq.com/api/clients/sync-from-ghl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      toast({
        title: data.message || "Clients synced successfully",
        description: `${data.count || 0} client(s) synced from GoHighLevel`,
      });
      await refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sync clients from GoHighLevel";
      toast({
        title: "Sync failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  async function onAdd(payload: { name: string; email: string; company?: string; status: ClientStatus; onError?: (errors: Record<string, string | string[]>) => void }) {
    if (!payload.name.trim() || !payload.email.trim()) {
      if (payload.onError) {
        payload.onError({ form: "Name and email are required" });
      }
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    const result = await createClient({
      name: payload.name,
      email: payload.email,
      company: payload.company,
      status: payload.status,
    });
    if (!result.success) {
      if (result.fieldErrors) {
        if (payload.onError) {
          payload.onError(result.fieldErrors);
        }
      } else {
        toast({ title: result.error || "Failed to add client", variant: "destructive" });
      }
      return;
    }
    toast({ title: "Client added" });
    setOpenAdd(false);
    await refresh();
  }

  async function onSave(rec: ClientRecord, onError?: (errors: Record<string, string | string[]>) => void) {
    const result = await updateClient(rec);
    if (!result.success) {
      if (result.fieldErrors) {
        if (onError) {
          onError(result.fieldErrors);
        }
      } else {
        toast({ title: result.error || "Failed to update client", variant: "destructive" });
      }
      return;
    }
    toast({ title: "Client updated" });
    setOpenEdit(null);
    await refresh();
  }

  function showDeleteConfirm(id: string, name: string) {
    setDeleteConfirm({ open: true, clientId: id, clientName: name });
  }

  async function confirmDelete() {
    const result = await deleteClient(deleteConfirm.clientId);
    setDeleteConfirm({ open: false, clientId: "", clientName: "" });
    if (!result.success) {
      toast({ title: result.error || "Failed to delete client", variant: "destructive" });
      return;
    }
    toast({ title: "Client deleted" });
    await refresh();
  }

  return (
    <AppShell>
      <section className="container py-8 px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Clients</h1>
              <p className="text-base text-muted-foreground mt-1">Manage your client directory and keep it up to date</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setOpenAdd(true)}
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-shadow"
              >
                <span>+</span>
                Add client
              </Button>
              <Button
                onClick={syncFromGHL}
                disabled={isSyncing}
                variant="outline"
                className="w-full sm:w-auto gap-2"
              >
                {isSyncing ? "Syncing..." : "Sync From GHL"}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              id="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-4 pr-4 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-40 h-11 border-border bg-white/50 backdrop-blur-sm focus:bg-white transition-colors">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table View */}
        {filtered.length > 0 ? (
          <div className="rounded-lg border border-border bg-white/50 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent bg-muted/30">
                  <TableHead className="font-semibold text-foreground">Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-foreground">Company</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Added</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <a href={`mailto:${client.email}`} className="hover:text-primary transition-colors">
                        {client.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.company || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={client.status === "active" ? "default" : "secondary"}
                        className={client.status === "active" ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100" : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-100"}
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(client.createdAt).toLocaleDateString(undefined, {
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
                            onClick={() => setOpenEdit(client)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => showDeleteConfirm(client.id, client.name)}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-lg font-medium text-foreground">No clients yet</p>
              <p className="text-sm text-muted-foreground">Add your first client to get started</p>
              <Button onClick={() => setOpenAdd(true)} className="mt-4">
                Add Client
              </Button>
            </div>
          </div>
        )}
      </section>

      <AddDialog open={openAdd} onOpenChange={setOpenAdd} onSubmit={(p, cb) => onAdd({ ...p, onError: cb })} />
      <EditDialog open={!!openEdit} record={openEdit} onOpenChange={() => setOpenEdit(null)} onSubmit={(rec, cb) => onSave(rec, cb)} />
      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => setDeleteConfirm({ ...deleteConfirm, open: v })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.clientName}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function AddDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (p: { name: string; email: string; company?: string; status: ClientStatus }, onError: (errors: Record<string, string | string[]>) => void) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    if (!open) {
      setErrors({});
      setName("");
      setEmail("");
      setCompany("");
      setStatus("active");
    }
  }, [open]);

  function submit() {
    setErrors({});
    onSubmit({ name, email, company, status }, (fieldErrors) => {
      setErrors(fieldErrors);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {errors.form && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {Array.isArray(errors.form) ? errors.form[0] : errors.form}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.name) ? errors.name[0] : errors.name}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.email) ? errors.email[0] : errors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-invalid={!!errors.company}
            />
            {errors.company && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.company) ? errors.company[0] : errors.company}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.status) ? errors.status[0] : errors.status}
              </p>
            )}
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ open, record, onOpenChange, onSubmit }: { open: boolean; record: ClientRecord | null; onOpenChange: () => void; onSubmit: (rec: ClientRecord, onError: (errors: Record<string, string | string[]>) => void) => void }) {
  const [draft, setDraft] = useState<ClientRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    setDraft(record ? { ...record } : null);
    setErrors({});
  }, [record, open]);

  if (!draft) return null;

  function submit() {
    setErrors({});
    onSubmit(draft, (fieldErrors) => {
      setErrors(fieldErrors);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {errors.form && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {Array.isArray(errors.form) ? errors.form[0] : errors.form}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.name) ? errors.name[0] : errors.name}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.email) ? errors.email[0] : errors.email}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={draft.company ?? ""}
              onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              aria-invalid={!!errors.company}
            />
            {errors.company && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.company) ? errors.company[0] : errors.company}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as ClientStatus })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.status) ? errors.status[0] : errors.status}
              </p>
            )}
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange()}>Cancel</Button>
            <Button onClick={submit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
