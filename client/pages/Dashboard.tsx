import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppShell from "@/components/layout/AppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { AnalyticsResponse } from "@shared/api";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { getAnalytics } from "@/services/analyticsService";
import { TrendingUp, Users, FileText, Zap } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString();
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  useEffect(() => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  }, []);

  const [range, setRange] = useState<{ label: string; start: string; end: string }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return { label: "Last 30 days", start: toISO(start), end: toISO(end) };
  });
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = useMemo(() => [
    { label: "7 days", days: 6 },
    { label: "30 days", days: 29 },
    { label: "90 days", days: 89 },
  ], []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await getAnalytics({ start: range.start, end: range.end });
      setData(json);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [range.start, range.end]);
  useEffect(() => { const id = setInterval(fetchData, 10000); return () => clearInterval(id); }, [range.start, range.end]);

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
      <div className="container py-8 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="text-base text-muted-foreground mt-1">Insights across proposals, clients, AI usage, and revenue</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  size="sm"
                  variant="outline"
                  onClick={() => setPreset(p.days, p.label)}
                  className="border-border hover:bg-muted/50"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            title="Total Proposals"
            value={data ? fmt(data.totals.proposals) : "—"}
            href="/my/proposals"
            icon={<FileText className="w-5 h-5" />}
            color="from-blue-500 to-blue-600"
          />
          <Stat
            title="Acceptance Rate"
            value={data ? `${ratio}%` : "—"}
            subtitle={data ? `${fmt(data.totals.accepted)} accepted` : undefined}
            href="/my/proposals"
            icon={<TrendingUp className="w-5 h-5" />}
            color="from-green-500 to-green-600"
          />
          <Stat
            title="Active Clients"
            value={data ? fmt(data.totals.activeClients) : "—"}
            href="/my/clients"
            icon={<Users className="w-5 h-5" />}
            color="from-purple-500 to-purple-600"
          />
          <Stat
            title="AI Tokens Used"
            value={data ? fmt(data.totals.aiTokens) : "—"}
            icon={<Zap className="w-5 h-5" />}
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-white/80 to-muted/30 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Revenue</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {data ? `Total: $${fmt(data.totals.revenue)}` : "—"}
                </p>
              </div>
            </div>
            <Separator className="my-4 bg-border/40" />
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.series ?? []} margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} width={40} />
                  <Tooltip formatter={(v: any) => [`$${fmt(Number(v))}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/my/proposals" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full border-border hover:bg-muted/50 gap-2">
              <FileText className="w-4 h-4" />
              View Proposals
            </Button>
          </a>
          <a href="/my/clients" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full border-border hover:bg-muted/50 gap-2">
              <Users className="w-4 h-4" />
              View Clients
            </Button>
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  title,
  value,
  subtitle,
  href,
  icon,
  color = "from-primary to-accent"
}: {
  title: string;
  value: string;
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-white/80 to-muted/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-border/80 hover:from-white hover:to-muted/50 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2">
              <p className="text-3xl lg:text-4xl font-bold text-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </div>
          {icon && (
            <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${color} p-2.5 flex items-center justify-center text-white opacity-90 group-hover:opacity-100 transition-opacity`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) return <a href={href}>{content}</a>;
  return content;
}
