import { getStoredToken } from "@/lib/auth";

const UPLOAD_ENDPOINT = "https://propai-api.hirenq.com/api/upload/media";

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
