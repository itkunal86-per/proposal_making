import { getStoredToken } from "@/lib/auth";

const API_BASE = "https://propai-api.hirenq.com/api";

export interface SignatoryData {
  id?: number;
  user_id?: string;
  proposal_id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSignatoryRequest {
  proposal_id: string;
  name: string;
  email: string;
  order: number;
  role: string;
}

export interface CreateSignatoryResponse {
  message: string;
  signature: SignatoryData;
}

export interface GetSignatoriesResponse {
  proposal_id: string;
  signatures: SignatoryData[];
}

export interface DeleteSignatoryResponse {
  message: string;
  signature_id: string;
}

/**
 * Create a new signatory for a proposal
 * POST /api/signatures
 */
export async function createSignatory(data: CreateSignatoryRequest): Promise<{ success: boolean; data?: SignatoryData; error?: string }> {
  try {
    const token = getStoredToken();
    if (!token) {
      return { success: false, error: "No authentication token available" };
    }

    const response = await fetch(`${API_BASE}/signatures`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Create signatory error:", errorData);
      return {
        success: false,
        error: errorData?.message || `Failed to create signatory: ${response.statusText}`,
      };
    }

    const result: CreateSignatoryResponse = await response.json();
    return {
      success: true,
      data: result.signature,
    };
  } catch (error) {
    console.error("Create signatory exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create signatory",
    };
  }
}

/**
 * Fetch all signatories for a proposal
 * GET /api/proposal/signatures/{proposal_id}
 */
export async function getSignatories(proposalId: string): Promise<{ success: boolean; data?: SignatoryData[]; error?: string }> {
  try {
    const token = getStoredToken();
    if (!token) {
      return { success: false, error: "No authentication token available" };
    }

    const response = await fetch(`${API_BASE}/proposal/signatures/${proposalId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Get signatories error:", errorData);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch signatories: ${response.statusText}`,
      };
    }

    const result: GetSignatoriesResponse = await response.json();
    return {
      success: true,
      data: result.signatures || [],
    };
  } catch (error) {
    console.error("Get signatories exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch signatories",
    };
  }
}

/**
 * Delete a signatory
 * DELETE /api/signatures/{signature_id}
 */
export async function deleteSignatory(signatureId: number | string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = getStoredToken();
    if (!token) {
      return { success: false, error: "No authentication token available" };
    }

    const response = await fetch(`${API_BASE}/signatures/${signatureId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Delete signatory error:", errorData);
      return {
        success: false,
        error: errorData?.message || `Failed to delete signatory: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete signatory exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete signatory",
    };
  }
}
