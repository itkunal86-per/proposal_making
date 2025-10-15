import AppShell from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUTH_USERS } from "@/data/users";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(AUTH_USERS);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((u) => [u.name, u.email, u.company, u.role].some((v) => (v ?? "").toLowerCase().includes(q)));
  }, [rows, query]);

  function addUser() {
    const name = prompt("Full name");
    const email = name ? prompt("Email") : null;
    if (!name || !email) return;
    const next = {
      id: Math.random().toString(36).slice(2),
      name,
      email,
      password: "changeme",
      role: "subscriber" as const,
      company: "",
    };
    setRows((r) => [next, ...r]);
    toast({ title: "User added", description: `${name} (${email})` });
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage application users and roles.</p>
          </div>
          <Button onClick={addUser}>Add user</Button>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="q" className="text-xs text-muted-foreground">Search</Label>
            <Input id="q" value={query} onChange={(e) => setQuery(e.target.value)} className="w-80" placeholder="Name, email, company, role" />
          </div>

          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.company ?? "—"}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
