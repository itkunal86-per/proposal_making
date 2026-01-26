import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listSubscriberUsers, type SubscriberUserRecord } from "@/services/subscriberUsersService";
import AddUserDialog from "@/components/AddUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Edit2, Trash2 } from "lucide-react";

export default function SubscriberUsers() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SubscriberUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const users = await listSubscriberUsers();
      setRows(users);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((u) =>
      [u.user.name, u.user.email, u.role.name, u.status].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage your team members and their roles.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            Add User
          </Button>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="q" className="text-xs text-muted-foreground">
              Search
            </Label>
            <Input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-80"
              placeholder="Name, email, role, status"
            />
          </div>

          <div className="overflow-x-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{u.user.name}</TableCell>
                      <TableCell>{u.user.email}</TableCell>
                      <TableCell>{u.role.name}</TableCell>
                      <TableCell>{u.status}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        <AddUserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUserCreated={fetchUsers}
        />
      </section>
    </AppShell>
  );
}
