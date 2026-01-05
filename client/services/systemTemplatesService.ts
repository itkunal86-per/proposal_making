import { getStoredToken } from "@/lib/auth";
import type { Proposal } from "./proposalsService";

const SYSTEM_TEMPLATES_ENDPOINT = "https://propai-api.hirenq.com/api/templates/system";

export interface SystemTemplate {
  id: string;
  title: string;
  description?: string;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  sections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
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
      createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
      updatedAt: t.updated_at ? new Date(t.updated_at).getTime() : Date.now(),
      sections: t.sections || [],
    }));
  } catch (error) {
    console.error("Error fetching system templates:", error);
    return [];
  }
}

export function convertSystemTemplateToProposal(template: SystemTemplate): Proposal {
  return {
    id: template.id,
    title: template.title,
    client: "",
    status: "draft" as const,
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
