import { getStoredToken } from "@/lib/auth";

const UPLOAD_ENDPOINT = "https://propai-api.hirenq.com/api/upload/media";
const FETCH_MEDIA_ENDPOINT = "https://propai-api.hirenq.com/api/proposal/media";
const DELETE_MEDIA_ENDPOINT = "https://propai-api.hirenq.com/api/proposal/media";

export interface MediaItem {
  id: number;
  type: "image" | "video";
  url: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalMediaRecord {
  id: number;
  media_id: string;
  proposal_id: string;
  created_at: string;
  updated_at: string;
  media: MediaItem[];
}

export interface FetchProposalMediaResponse {
  proposal_id: string;
  media: ProposalMediaRecord[];
}

export interface UploadMediaResponse {
  message: string;
  external_response: {
    success: boolean;
    file_url: string;
    relative_path: string;
  };
  media_record: {
    user_id: string;
    type: "image" | "video";
    url: string;
    path: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export interface UploadMediaError {
  error: string;
  details: string;
}

export async function fetchProposalMedia(
  proposalId: string
): Promise<{
  success: boolean;
  data?: FetchProposalMediaResponse;
  error?: string;
}> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const url = `${FETCH_MEDIA_ENDPOINT}/${proposalId}`;
    console.log("Fetching media from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData: any = {};

      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          const text = await response.text();
          console.error("Failed to fetch media - text response:", text);
          errorData = { error: text || "Server error" };
        }
      } else {
        const text = await response.text();
        console.error("Failed to fetch media - non-JSON response:", text);
        errorData = { error: text || "Server error" };
      }

      console.error("Failed to fetch media:", response.status, errorData);
      return {
        success: false,
        error: errorData.error || errorData.message || `Failed to fetch media (${response.status})`,
      };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("Unexpected response format:", text);
      return {
        success: false,
        error: "Unexpected response format from server",
      };
    }

    const data: FetchProposalMediaResponse = await response.json();

    // Ensure media array exists
    if (!data.media) {
      data.media = [];
    }

    console.log("Fetched proposal media:", data);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Network error fetching media:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function deleteProposalMedia(
  mediaId: number | string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const response = await fetch(`${DELETE_MEDIA_ENDPOINT}/${mediaId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to delete media",
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Media deleted successfully",
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function uploadMediaToProposal(
  file: File,
  proposalId: string
): Promise<{
  success: boolean;
  data?: UploadMediaResponse;
  error?: string;
}> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("proposal_id", proposalId);

    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: UploadMediaError = await response.json().catch(() => ({
        error: "Upload failed. Contact to administrator.",
        details: "Unknown error",
      }));
      return {
        success: false,
        error: errorData.error || "Upload failed",
      };
    }

    const data: UploadMediaResponse = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}
