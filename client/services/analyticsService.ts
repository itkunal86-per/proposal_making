import type { AnalyticsResponse } from "@shared/api";

export async function getAnalytics(params: { start: string; end: string }): Promise<AnalyticsResponse> {
  const res = await fetch("/data/analytics.json");
  if (!res.ok) throw new Error("Failed to load analytics");
  const data = (await res.json()) as AnalyticsResponse;

  // Filter series by date range if needed
  const startDate = new Date(params.start);
  const endDate = new Date(params.end);
  const filteredSeries = data.series.filter((point) => {
    const pointDate = new Date(point.date);
    return pointDate >= startDate && pointDate <= endDate;
  });

  return {
    ...data,
    series: filteredSeries,
  };
}
