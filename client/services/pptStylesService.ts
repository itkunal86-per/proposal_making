import { getStoredToken } from "@/lib/auth";
import { apiConfig } from "@/lib/apiConfig";

export interface StyleConfig {
  fonts: {
    body: {
      size: number;
      family: string;
      weight: string;
    };
    heading: {
      size: number;
      family: string;
      weight: string;
    };
  };
  colors: {
    body: string;
    accent: string;
    heading: string;
    background: string;
  };
}

export interface PPTStyle {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  title_font: string;
  body_font: string;
  title_font_size: string;
  body_font_size: string;
  title_font_color: string;
  body_font_color: string;
  layout_type: string;
  style_config: StyleConfig;
  preview_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePPTStyleInput {
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  title_font: string;
  body_font: string;
  title_font_size: number;
  body_font_size: number;
  title_font_color: string;
  body_font_color: string;
  layout_type: string;
  style_config: StyleConfig;
  is_active: number;
}

export async function listPPTStyles(): Promise<PPTStyle[]> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      "https://propai-api.hirenq.com/api/ppt/styles/all",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch PPT styles");
  } catch (error) {
    console.error("Error fetching PPT styles:", error);
    throw error;
  }
}

export async function createPPTStyle(input: CreatePPTStyleInput): Promise<PPTStyle> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      "https://propai-api.hirenq.com/api/ppt/styles",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to create PPT style");
  } catch (error) {
    console.error("Error creating PPT style:", error);
    throw error;
  }
}

export async function getPPTStyleById(styleId: number): Promise<PPTStyle> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `https://propai-api.hirenq.com/api/ppt/styles/${styleId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch PPT style");
  } catch (error) {
    console.error("Error fetching PPT style:", error);
    throw error;
  }
}

export async function updatePPTStyle(
  styleId: number,
  input: CreatePPTStyleInput
): Promise<PPTStyle> {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `https://propai-api.hirenq.com/api/ppt/styles/${styleId}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to update PPT style");
  } catch (error) {
    console.error("Error updating PPT style:", error);
    throw error;
  }
}
