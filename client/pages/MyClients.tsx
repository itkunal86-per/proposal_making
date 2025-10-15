import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { ClientRecord, ClientStatus, createClient, deleteClient, loadClients, updateClient } from "@/lib/clientsStore";

export default function MyClients() {
  const [rows, setRows] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [openEdit, setOpenEdit] = useState<null | ClientRecord>(null);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    setRows(loadClients());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) =>
        !q ? true : [r.name, r.email, r.company ?? ""].some((v) => v.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return list;
  }, [rows, search, status]);

  function refresh() {
    setRows(loadClients());
  }

  function onAdd(payload: { name: string; email: string; company?: string; status: ClientStatus }) {
    if (!payload.name.trim() || !payload.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    createClient(payload);
    toast({ title: "Client added" });
    setOpenAdd(false);
    refresh();
  }

  function onSave(rec: ClientRecord) {
    updateClient(rec);
    toast({ title: "Client updated" });
    setOpenEdit(null);
    refresh();
  }

  function onDelete(id: string) {
    deleteClient(id);
    toast({ title: "Client deleted" });
    refresh();
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
                      <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <AddDialog open={openAdd} onOpenChange={setOpenAdd} onSubmit={onAdd} />
      <EditDialog open={!!openEdit} record={openEdit} onOpenChange={() => setOpenEdit(null)} onSubmit={onSave} />
    </AppShell>
  );
}

function AddDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (p: { name: string; email: string; company?: string; status: ClientStatus }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");

  function submit() {
    onSubmit({ name, email, company, status });
    setName("");
    setEmail("");
    setCompany("");
    setStatus("active");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
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

function EditDialog({ open, record, onOpenChange, onSubmit }: { open: boolean; record: ClientRecord | null; onOpenChange: () => void; onSubmit: (rec: ClientRecord) => void }) {
  const [draft, setDraft] = useState<ClientRecord | null>(null);

  useEffect(() => {
    setDraft(record ? { ...record } : null);
  }, [record]);

  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={draft.company ?? ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
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
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange()}>Cancel</Button>
            <Button onClick={() => draft && onSubmit(draft)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
