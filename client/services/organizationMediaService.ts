import { getStoredToken } from "@/lib/auth";
import { apiConfig } from "@/lib/apiConfig";

export interface OrganizationMediaItem {
  id: number;
  dealId: number;
  name: string;
  mimeType: string;
  size: number;
  category: "image" | "document";
  thumbnailUrl: string | null;
  previewUrl: string | null;
  expiresAt: string;
}

export interface DealMediaGroup {
  dealId: number;
  total: number;
  data: OrganizationMediaItem[];
}

export interface OrganizationMediaList {
  page: number;
  perPage: number;
  total: number;
  groups: DealMediaGroup[];
}

export interface DealMediaResolveResult {
  fileId: number;
  dealId: number;
  previewUrl?: string;
  expiresAt?: string;
  status?: string;
}

async function authorizedGet(url: string) {
  const token = getStoredToken();
  if (!token) return { ok: false, status: 401, body: { error: "No authentication token available" } };
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

export async function fetchOrganizationMedia(proposalId: string, query: { q?: string; page?: number; type?: "image" | "document" }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.page) params.set("page", String(query.page));
  if (query.type) params.set("type", query.type);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const result = await authorizedGet(`${apiConfig.endpoints.proposals}/${proposalId}/deal-media${suffix}`);
  return {
    success: result.ok,
    status: result.status,
    data: result.ok ? result.body as OrganizationMediaList : undefined,
    error: result.ok ? undefined : (result.body.error || "Deal media could not be loaded"),
  };
}

export async function resolveOrganizationMedia(proposalId: string, references: Array<{ fileId: number; dealId: number }>) {
  const token = getStoredToken();
  if (!token) return { success: false, error: "No authentication token available" };
  const response = await fetch(`${apiConfig.endpoints.proposals}/${proposalId}/deal-media/resolve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ references }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: body.error || "Deal media could not be refreshed" };
  }
  return { success: true, data: body as { expiresIn?: number; results?: DealMediaResolveResult[] } };
}
