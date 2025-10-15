import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { Proposal, createProposal, deleteProposal, duplicateProposal, loadProposals } from "@/lib/proposalsStore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function MyProposals() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setRows(loadProposals());
  }, []);

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

  function refresh() {
    setRows(loadProposals());
  }

  function onCreate() {
    const p = createProposal({ createdBy: user?.email ?? "you@example.com", title: "New Proposal" });
    toast({ title: "Proposal created" });
    refresh();
    nav(`/proposals/${p.id}/edit`);
  }

  function onDelete(id: string) {
    deleteProposal(id);
    toast({ title: "Proposal deleted" });
    refresh();
  }

  function onDuplicate(id: string) {
    const p = duplicateProposal(id);
    if (p) toast({ title: "Proposal duplicated" });
    refresh();
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Proposals</h1>
            <p className="text-muted-foreground">Create and manage proposals you own.</p>
          </div>
          <Button onClick={onCreate}>New proposal</Button>
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
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={() => nav(`/proposals/${r.id}/edit`)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => onDuplicate(r.id)}>Duplicate</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
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
    </AppShell>
  );
}
