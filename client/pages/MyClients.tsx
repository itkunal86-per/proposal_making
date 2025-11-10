import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { type ClientRecord, type ClientStatus, type CreateClientResult, type UpdateClientResult, type DeleteClientResult, listClients, createClient, updateClient, deleteClient } from "@/services/clientsService";

export default function MyClients() {
  const [rows, setRows] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [openEdit, setOpenEdit] = useState<null | ClientRecord>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clientId: string; clientName: string }>({ open: false, clientId: "", clientName: "" });

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
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage your client directory and keep it up to date.</p>
          </div>
          <Button onClick={() => setOpenAdd(true)}>Add client</Button>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="q" className="text-xs text-muted-foreground">Search</Label>
              <Input id="q" value={search} onChange={(e) => setSearch(e.target.value)} className="w-72" placeholder="Name, email, company" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.company || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "active" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={() => setOpenEdit(r)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => showDeleteConfirm(r.id, r.name)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <AddDialog open={openAdd} onOpenChange={setOpenAdd} onSubmit={(p, cb) => onAdd({ ...p, onError: cb })} />
      <EditDialog open={!!openEdit} record={openEdit} onOpenChange={() => setOpenEdit(null)} onSubmit={(rec, cb) => onSave(rec, cb)} />
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
