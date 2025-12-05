import { getStoredToken } from "@/lib/auth";

const API_ENDPOINT = "https://propai-api.hirenq.com/api/settings";

export interface SettingsData {
  id: number;
  user_id: string;
  fullname: string;
  company: string;
  email: string;
  hubspot_api_key?: string;
  ghl_api_key?: string;
  location_id?: string;
  sync_clients?: string;
  sync_proposals?: string;
}

export interface FetchSettingsResponse {
  success: boolean;
  data?: SettingsData;
  error?: string;
}

export interface UpdateSettingsParams {
  fullname: string;
  company: string;
  email: string;
}

export interface IntegrationSettings {
  hubspot_api_key: string;
  ghl_api_key: string;
  location_id: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  data?: SettingsData;
  error?: string;
}

export async function fetchSettings(): Promise<FetchSettingsResponse> {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again.",
      };
    }

    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to fetch settings (${response.status})`,
      };
    }

    const data: SettingsData = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Network error fetching settings:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function updateSettings(params: UpdateSettingsParams): Promise<UpdateSettingsResponse> {
  try {
    const token = getStoredToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again.",
      };
    }

    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to update settings (${response.status})`,
      };
    }

    const data: SettingsData = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Network error updating settings:", err);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}
