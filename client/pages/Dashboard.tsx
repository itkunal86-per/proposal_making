import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppShell from "@/components/layout/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { AnalyticsResponse } from "@shared/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function fmt(n: number) {
  return n.toLocaleString();
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  // Auth guard
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    //if (!token) window.location.href = "/login";
  }, []);

  const [range, setRange] = useState<{
    label: string;
    start: string;
    end: string;
  }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return { label: "Last 30 days", start: toISO(start), end: toISO(end) };
  });
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = useMemo(
    () => [
      { label: "7 days", days: 6 },
      { label: "30 days", days: 29 },
      { label: "90 days", days: 89 },
    ],
    [],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analytics?start=${range.start}&end=${range.end}`,
      );
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = (await res.json()) as AnalyticsResponse;
      setData(json);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range.start, range.end]);
  useEffect(() => {
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [range.start, range.end]);

  const ratio = useMemo(() => {
    if (!data) return 0;
    const { accepted, declined } = data.totals;
    const total = accepted + declined || 1;
    return Math.round((accepted / total) * 100);
  }, [data]);

  const setPreset = (days: number, label: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setRange({ label: `Last ${label}`, start: toISO(start), end: toISO(end) });
  };

  return (
    <AppShell>
      <div className="container pt-6 pb-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Insights across proposals, clients, AI usage, and revenue.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {presets.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="outline"
                onClick={() => setPreset(p.days, p.label)}
              >
                {p.label}
              </Button>
            ))}
            <Select
              onValueChange={(v) => {
                if (v === "custom") return;
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={range.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{range.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Total proposals"
            value={data ? fmt(data.totals.proposals) : "—"}
            href="/proposals"
          />
          <Stat
            title="Accepted / Declined"
            value={
              data
                ? `${fmt(data.totals.accepted)} / ${fmt(data.totals.declined)} (${ratio}%)`
                : "—"
            }
            href="/proposals"
          />
          <Stat
            title="Active clients"
            value={data ? fmt(data.totals.activeClients) : "—"}
            href="/clients"
          />
          <Stat
            title="AI usage (tokens)"
            value={data ? fmt(data.totals.aiTokens) : "—"}
          />
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <span className="text-sm text-muted-foreground">
              Total: {data ? `$${fmt(data.totals.revenue)}` : "—"}
            </span>
          </div>
          <Separator className="my-4" />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.series ?? []}
                margin={{ left: 8, right: 8 }}
              >
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${v / 1000}k`}
                  width={40}
                />
                <Tooltip
                  formatter={(v: any) => [`$${fmt(Number(v))}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="/proposals">
            <Button variant="outline">View proposals</Button>
          </a>
          <a href="/clients">
            <Button variant="outline">View clients</Button>
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <Card className="p-5">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
  if (href) return <a href={href}>{content}</a>;
  return content;
}
