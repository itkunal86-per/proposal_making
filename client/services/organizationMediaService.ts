import { getStoredToken } from "@/lib/auth";
import { apiConfig } from "@/lib/apiConfig";

export interface OrganizationMediaItem {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  category: "image" | "document";
  thumbnailUrl: string | null;
  previewUrl: string | null;
  expiresAt: string;
}

export interface OrganizationMediaList {
  page: number;
  perPage: number;
  total: number;
  organizationId?: number;
  logo: {
    organizationId: number;
    name: string;
    previewUrl: string | null;
    expiresAt: string;
  } | null;
  data: OrganizationMediaItem[];
}

async function authorizedGet(url: string) {
  const token = getStoredToken();
  if (!token) return { ok: false, status: 401, body: { error: "No authentication token available" } };
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

export async function fetchOrganizationMedia(proposalId: string, query: { q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.page) params.set("page", String(query.page));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const result = await authorizedGet(`${apiConfig.endpoints.proposals}/${proposalId}/organization-media${suffix}`);
  return {
    success: result.ok,
    status: result.status,
    data: result.ok ? result.body as OrganizationMediaList : undefined,
    error: result.ok ? undefined : (result.body.error || "Organization media could not be loaded"),
  };
}

export async function resolveOrganizationMedia(proposalId: string, fileIds: number[], includeLogo: boolean) {
  const token = getStoredToken();
  if (!token) return { success: false, error: "No authentication token available" };
  const response = await fetch(`${apiConfig.endpoints.proposals}/${proposalId}/organization-media/resolve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileIds, includeLogo }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: body.error || "Organization media could not be refreshed" };
  }
  return { success: true, data: body as { files?: Array<{ id: number; previewUrl?: string; expiresAt?: string; status?: string }>; logo?: { previewUrl?: string; expiresAt?: string; status?: string } | null } };
}
