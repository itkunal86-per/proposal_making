import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Proposal,
  ProposalStatus,
  createProposal,
  deleteProposal,
  duplicateProposal,
  loadProposals,
  saveProposals,
  toggleShare,
} from "@/lib/proposalsStore";

export default function Proposals() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Proposal[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProposalStatus | "all">("all");
  const [client, setClient] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preview, setPreview] = useState<Proposal | null>(null);

  useEffect(() => {
    setRows(loadProposals());
  }, []);

  // Distinct clients for filter
  const clients = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.client).filter(Boolean)));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (client === "all" ? true : r.client === client))
      .filter((r) =>
        !q
          ? true
          : [r.title, r.client, r.createdBy].some((v) =>
              v.toLowerCase().includes(q),
            ) || r.sections.some((s) => s.title.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [rows, status, client, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function refresh() {
    setRows(loadProposals());
  }

  function onCreate() {
    const p = createProposal();
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

  function onExportPDF(p: Proposal) {
    const shared = toggleShare(p, true);
    saveProposals(loadProposals());
    const url = `${window.location.origin}/p/${shared.settings.sharing.token}?print=1`;
    window.open(url, "_blank");
  }

  return (
    <AppShell>
      <section className="container py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Proposals</h1>
            <p className="text-muted-foreground">
              Create, manage and export proposals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onCreate}>New proposal</Button>
          </div>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search title, client, author, section"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-72"
            />
            <Select
              value={status}
              onValueChange={(v: any) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={client}
              onValueChange={(v: any) => {
                setClient(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="ps" className="text-xs text-muted-foreground">
                Rows
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger id="ps" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{r.client || "—"}</TableCell>
                    <TableCell className="capitalize">{r.status}</TableCell>
                    <TableCell>{r.createdBy}</TableCell>
                    <TableCell>
                      {new Date(r.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreview(r)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => nav(`/proposals/${r.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDuplicate(r.id)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportPDF(r)}
                      >
                        Export PDF
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(r.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Card>

        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quick preview</DialogTitle>
            </DialogHeader>
            {preview && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{preview.title}</h2>
                <div className="text-sm text-muted-foreground">
                  Client: {preview.client || "��"} • Status: {preview.status}
                </div>
                <Separator />
                {preview.sections.map((s) => (
                  <div key={s.id} className="space-y-1">
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {s.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}
