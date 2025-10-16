import type { AnalyticsResponse } from "@shared/api";

export async function getAnalytics(params: { start: string; end: string }): Promise<AnalyticsResponse> {
  const res = await fetch(`/api/analytics?start=${params.start}&end=${params.end}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return (await res.json()) as AnalyticsResponse;
}
