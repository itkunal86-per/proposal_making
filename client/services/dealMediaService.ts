import { getStoredToken } from "@/lib/auth";
import { apiConfig } from "@/lib/apiConfig";

export interface DealMediaItem {
  id: number;
  dealId: number;
  dealIds: number[];
  name: string;
  mimeType: string;
  type: "image" | "video" | "audio" | "document";
  url: string | null;
  thumbnailUrl: string | null;
  size: number | null;
}

export interface DealMediaList {
  organizationId: number | null;
  data: DealMediaItem[];
}

export async function fetchDealMedia(proposalId: string): Promise<{
  success: boolean;
  data?: DealMediaList;
  error?: string;
}> {
  const token = getStoredToken();
  if (!token) {
    return { success: false, error: "No authentication token available" };
  }

  const response = await fetch(`${apiConfig.endpoints.proposals}/${proposalId}/deal-media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success !== true || !Array.isArray(body.data)) {
    return {
      success: false,
      error: typeof body.error === "string" ? body.error : "Deal attachments could not be loaded",
    };
  }

  return {
    success: true,
    data: {
      organizationId: typeof body.organizationId === "number" ? body.organizationId : null,
      data: body.data as DealMediaItem[],
    },
  };
}
