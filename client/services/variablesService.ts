import { getStoredToken } from "@/lib/auth";

export interface Variable {
  id: number;
  user_id: number;
  proposal_id: string;
  variable_name: string;
  variable_value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVariableResponse {
  message: string;
  variable: Variable;
}

export interface ApiError {
  error: string;
  issues?: Record<string, string[]>;
}

const API_BASE = "https://propai-api.hirenq.com/api";

export async function createVariable(proposalId: string, variableName: string): Promise<{
  data: Variable | null;
  error: string | null;
}> {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        data: null,
        error: "Authentication token not found. Please log in again.",
      };
    }

    const response = await fetch(`${API_BASE}/variables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        proposal_id: proposalId,
        variable_name: variableName,
      }),
    });

    const responseData: CreateVariableResponse | ApiError = await response.json();

    if (!response.ok) {
      const errorData = responseData as ApiError;
      if (errorData.issues) {
        const firstIssue = Object.values(errorData.issues)[0]?.[0];
        return {
          data: null,
          error: firstIssue || errorData.error || "Failed to create variable",
        };
      }
      return {
        data: null,
        error: errorData.error || "Failed to create variable",
      };
    }

    const successData = responseData as CreateVariableResponse;
    return {
      data: successData.variable,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Network error. Please try again.";
    return {
      data: null,
      error: errorMessage,
    };
  }
}
