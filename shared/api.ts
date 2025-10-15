/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: { email: string };
}

export type ISODate = string; // YYYY-MM-DD

export interface AnalyticsQuery {
  start: ISODate;
  end: ISODate;
}

export interface SeriesPoint {
  date: ISODate;
  revenue: number;
}

export interface AnalyticsResponse {
  totals: {
    proposals: number;
    accepted: number;
    declined: number;
    activeClients: number;
    aiTokens: number;
    revenue: number;
  };
  series: SeriesPoint[];
}
