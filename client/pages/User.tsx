import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import AppShell from "@/components/layout/AppShell";

// Types
export type Role = "admin" | "editor" | "viewer";
export type Status = "active" | "invited" | "deactivated";
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: number;
}

interface InviteRecord {
  token: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const USERS_KEY = "app_users";
const INVITES_KEY = "app_invites";
const CURRENT_ROLE_KEY = "current_user_role"; // demo RBAC current user role

function loadUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadInvites(): InviteRecord[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InviteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveInvites(invites: InviteRecord[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

function getCurrentRole(): Role {
  const val = localStorage.getItem(CURRENT_ROLE_KEY) as Role | null;
  return val ?? "admin";
}

function setCurrentRole(role: Role) {
  localStorage.setItem(CURRENT_ROLE_KEY, role);
}

export default function User() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [role, setRole] = useState<Role>(getCurrentRole());
  const [filter, setFilter] = useState("");

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | UserRecord>(null);

  // Form state for add/edit
  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: Role;
    sendInvite: boolean;
  }>({
    name: "",
    email: "",
    role: "viewer",
    sendInvite: true,
  });

  useEffect(() => {
    const initial = loadUsers();
    if (initial.length === 0) {
      const seed: UserRecord[] = [
        {
          id: uuid(),
          name: "Sams Roy",
          email: "sams@example.com",
          role: "admin",
          status: "active",
          createdAt: Date.now() - 86400000 * 20,
        },
        {
          id: uuid(),
          name: "Jamie Lee",
          email: "jamie@example.com",
          role: "editor",
          status: "active",
          createdAt: Date.now() - 86400000 * 5,
        },
        {
          id: uuid(),
          name: "Ava Chen",
          email: "ava@example.com",
          role: "viewer",
          status: "invited",
          createdAt: Date.now() - 86400000 * 2,
        },
      ];
      saveUsers(seed);
      setUsers(seed);
    } else {
      setUsers(initial);
    }
    setInvites(loadInvites());
  }, []);

  useEffect(() => {
    setCurrentRole(role);
  }, [role]);

  const canManage = role === "admin";

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role, u.status].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [users, filter]);

  function upsertUser(u: UserRecord) {
    setUsers((prev) => {
      const next = prev.some((x) => x.id === u.id)
        ? prev.map((x) => (x.id === u.id ? u : x))
        : [u, ...prev];
      saveUsers(next);
      return next;
    });
  }

  function removeUser(id: string) {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      saveUsers(next);
      return next;
    });
    // Clean invites for that user
    setInvites((prev) => {
      const next = prev.filter((i) => i.userId !== id);
      saveInvites(next);
      return next;
    });
  }

  function createInvite(u: UserRecord) {
    const token = uuid();
    const rec: InviteRecord = {
      token,
      userId: u.id,
      email: u.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };
    setInvites((prev) => {
      const next = [rec, ...prev.filter((i) => i.userId !== u.id)];
      saveInvites(next);
      return next;
    });
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({
      title: "Invite link created",
      description: "Link copied to clipboard",
    });
    const updated: UserRecord = { ...u, status: "invited" };
    upsertUser(updated);
    return url;
  }

  function handleAdd() {
    if (!canManage) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and email are required",
      });
      return;
    }
    const exists = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase(),
    );
    if (exists) {
      toast({
        title: "Email exists",
        description: "Another user already uses this email",
      });
      return;
    }
    const user: UserRecord = {
      id: uuid(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: form.sendInvite ? ("invited" as Status) : ("active" as Status),
      createdAt: Date.now(),
    };
    upsertUser(user);
    setOpenAdd(false);
    if (form.sendInvite) createInvite(user);
    setForm({ name: "", email: "", role: "viewer", sendInvite: true });
  }

  function handleEditSave() {
    if (!openEdit || !canManage) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and email are required",
      });
      return;
    }
    const dup = users.some(
      (u) =>
        u.email.toLowerCase() === form.email.toLowerCase() &&
        u.id !== openEdit.id,
    );
    if (dup) {
      toast({
        title: "Email exists",
        description: "Another user already uses this email",
      });
      return;
    }
    const updated: UserRecord = {
      ...openEdit,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
    };
    upsertUser(updated);
    setOpenEdit(null);
  }

  function openEditDialog(u: UserRecord) {
    setForm({ name: u.name, email: u.email, role: u.role, sendInvite: false });
    setOpenEdit(u);
  }

  function changeRole(u: UserRecord, r: Role) {
    if (!canManage) return;
    upsertUser({ ...u, role: r });
  }

  function toggleActive(u: UserRecord) {
    if (!canManage) return;
    const status: Status =
      u.status === "deactivated" ? "active" : "deactivated";
    upsertUser({ ...u, status });
  }

  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const invited = users.filter((u) => u.status === "invited").length;

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage members, roles and invitations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Act as: Admin</SelectItem>
                <SelectItem value="editor">Act as: Editor</SelectItem>
                <SelectItem value="viewer">Act as: Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button disabled={!canManage}>Add user</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add user</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v: Role) =>
                        setForm((f) => ({ ...f, role: v }))
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="invite"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={form.sendInvite}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sendInvite: e.target.checked }))
                      }
                    />
                    <Label htmlFor="invite">Send invite link</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAdd} disabled={!canManage}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total users</div>
            <div className="mt-1 text-2xl font-semibold">{total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="mt-1 text-2xl font-semibold">{active}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Invited</div>
            <div className="mt-1 text-2xl font-semibold">{invited}</div>
          </Card>
        </div>

        <Card className="mt-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search name, email, role, status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-72"
              />
            </div>
          </div>
          <Separator className="my-4" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {canManage ? (
                        <Select
                          value={u.role}
                          onValueChange={(v: Role) => changeRole(u, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{u.role}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === "active"
                            ? "default"
                            : u.status === "invited"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canManage}
                          >
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>User</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(u)}
                            disabled={!canManage}
                          >
                            Edit
                          </DropdownMenuItem>
                          {u.status !== "deactivated" ? (
                            <DropdownMenuItem
                              onClick={() => toggleActive(u)}
                              disabled={!canManage}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => toggleActive(u)}
                              disabled={!canManage}
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              const url = createInvite(u);
                              void url;
                            }}
                            disabled={!canManage}
                          >
                            Send invite link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ConfirmDelete
                            onConfirm={() => removeUser(u.id)}
                            disabled={!canManage}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Dialog open={!!openEdit} onOpenChange={(o) => !o && setOpenEdit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name2">Name</Label>
                <Input
                  id="name2"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email2">Email</Label>
                <Input
                  id="email2"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v: Role) =>
                    setForm((f) => ({ ...f, role: v }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSave} disabled={!canManage}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}

function ConfirmDelete({
  onConfirm,
  disabled,
}: {
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={disabled}
          className="w-full cursor-default select-none rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent disabled:opacity-50"
        >
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The user will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
