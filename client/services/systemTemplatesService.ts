import { getStoredToken } from "@/lib/auth";
import type { Proposal } from "./proposalsService";

const SYSTEM_TEMPLATES_ENDPOINT = "https://propai-api.hirenq.com/api/templates/system";

export interface SystemTemplate {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status?: "Active" | "Inactive";
  createdAt?: number;
  updatedAt?: number;
  sections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

export async function getSystemTemplateDetails(templateId: string): Promise<SystemTemplate | null> {
  const token = getStoredToken();
  if (!token) {
    console.error("No authentication token available");
    return null;
  }

  try {
    const response = await fetch(`${SYSTEM_TEMPLATES_ENDPOINT}/details/${templateId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch template details: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    const template: SystemTemplate = {
      id: data.id || String(Math.random()),
      title: data.title || "Untitled",
      description: data.description || "",
      content: data.content || "",
      status: data.status || "Active",
      createdAt: data.createdAt || (data.created_at ? new Date(data.created_at).getTime() : Date.now()),
      updatedAt: data.updatedAt || (data.updated_at ? new Date(data.updated_at).getTime() : Date.now()),
      sections: data.sections || [],
    };

    return template;
  } catch (error) {
    console.error("Error fetching template details:", error);
    return null;
  }
}

export async function listSystemTemplates(): Promise<SystemTemplate[]> {
  const token = getStoredToken();
  if (!token) {
    console.error("No authentication token available");
    return [];
  }

  try {
    const response = await fetch(SYSTEM_TEMPLATES_ENDPOINT, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch system templates: ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // The API might return templates as an array or wrapped in a data field
    const templates = Array.isArray(data) ? data : (data?.data || data?.templates || []);

    return templates.map((t: any) => ({
      id: t.id || t.template_id || String(Math.random()),
      title: t.title || t.name || "Untitled",
      description: t.description || "",
      content: t.content || "",
      status: t.status || "Active",
      createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
      updatedAt: t.updated_at ? new Date(t.updated_at).getTime() : Date.now(),
      sections: t.sections || [],
    }));
  } catch (error) {
    console.error("Error fetching system templates:", error);
    return [];
  }
}

export interface CreateTemplateResult {
  success: boolean;
  data?: SystemTemplate;
  error?: string;
}

export async function createSystemTemplate(title: string): Promise<CreateTemplateResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const response = await fetch(SYSTEM_TEMPLATES_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.message || errorData?.error || "Failed to create template";
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();

    const template: SystemTemplate = {
      id: data.id || data.template_id || String(Math.random()),
      title: data.title || title,
      description: data.description || "",
      content: data.content || "",
      status: data.status || "Active",
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      sections: data.sections || [],
    };

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error creating system template:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export function convertSystemTemplateToProposal(template: SystemTemplate): Proposal {
  // Map system template status to proposal status
  // Active -> draft, Inactive -> sent
  const proposalStatus: "draft" | "sent" = template.status === "Inactive" ? "sent" : "draft";

  return {
    id: template.id,
    title: template.title,
    client: "",
    status: proposalStatus,
    createdBy: "System",
    createdAt: template.createdAt || Date.now(),
    updatedAt: template.updatedAt || Date.now(),
    sections: template.sections?.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      styling: {
        fontSize: 14,
        fontFamily: "Inter",
        lineHeight: 1.5,
        textColor: "#000000",
        backgroundColor: "#ffffff",
      },
    })) || [],
    pricing: {
      items: [],
      currencySymbol: "$",
      showPricingTable: false,
    },
    settings: {
      headerImage: undefined,
      footerText: "",
      approvalFlow: "Single approver",
      sharing: {
        public: false,
        token: undefined,
        allowComments: true,
      },
    },
  };
}
