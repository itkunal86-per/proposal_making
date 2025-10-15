import { RequestHandler } from "express";
import { z } from "zod";
import type { AnalyticsResponse } from "@shared/api";

const qSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function daysBetween(start: Date, end: Date) {
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
}

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export const handleAnalytics: RequestHandler = (req, res) => {
  const parsed = qSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid date range" });
  const { start, end } = parsed.data;
  const startD = new Date(start + "T00:00:00Z");
  const endD = new Date(end + "T00:00:00Z");
  const days = daysBetween(startD, endD);
  const rand = seededRandom(startD.getUTCDate() + endD.getUTCDate());

  const baseRevenue = 1200 + rand() * 800;
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(startD.getTime());
    d.setUTCDate(startD.getUTCDate() + i);
    const spike = i % 7 === 0 ? 1.6 : 1;
    const revenue = Math.round((baseRevenue + rand() * 600) * spike);
    return { date: d.toISOString().slice(0, 10), revenue };
  });

  const proposals = Math.round(days * (20 + rand() * 30));
  const accepted = Math.round(proposals * (0.58 + rand() * 0.1));
  const declined = Math.max(0, proposals - accepted);
  const activeClients = Math.round(40 + rand() * 120);
  const aiTokens = Math.round(proposals * 120 + rand() * 5000);
  const revenue = series.reduce((sum, p) => sum + p.revenue, 0);

  const payload: AnalyticsResponse = {
    totals: { proposals, accepted, declined, activeClients, aiTokens, revenue },
    series,
  };
  res.json(payload);
};
