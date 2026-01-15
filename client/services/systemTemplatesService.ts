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
  createdBy?: string;
  created_by?: number;
  sections?: Array<any>;
  preview_image?: string;
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
    console.log("getSystemTemplateDetails - Raw API response:", data);

    const createdBy = data.created_by !== undefined && data.created_by !== null
      ? (typeof data.created_by === 'string' ? parseInt(data.created_by, 10) : data.created_by)
      : 0;

    const template: SystemTemplate = {
      id: data.id || String(Math.random()),
      title: data.title || "Untitled",
      description: data.description || "",
      content: data.content || "",
      status: data.status || "Active",
      createdBy: data.createdBy || data.created_by || "0",
      created_by: createdBy,
      createdAt: data.createdAt || (data.created_at ? new Date(data.created_at).getTime() : Date.now()),
      updatedAt: data.updatedAt || (data.updated_at ? new Date(data.updated_at).getTime() : Date.now()),
      sections: data.sections || data.content?.sections || [],
      preview_image: data.preview_image,
    };

    console.log("getSystemTemplateDetails - Processed template:", {
      id: template.id,
      title: template.title,
      status: template.status,
      sectionsCount: template.sections?.length,
      sections: template.sections?.map((s: any) => ({
        id: s.id,
        title: s.title,
        textsCount: s.texts?.length,
        imagesCount: s.images?.length,
        shapesCount: s.shapes?.length,
      })),
    });

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

    return templates.map((t: any) => {
      // Parse created_by, handling different formats
      let createdBy = 0;
      if (t.created_by !== undefined && t.created_by !== null) {
        if (typeof t.created_by === 'string') {
          createdBy = parseInt(t.created_by, 10);
        } else if (typeof t.created_by === 'number') {
          createdBy = t.created_by;
        }
      }
      if (isNaN(createdBy)) createdBy = 0;

      return {
        id: t.id || t.template_id || String(Math.random()),
        title: t.title || t.name || "Untitled",
        description: t.description || "",
        content: t.content || "",
        status: t.status || "Active",
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
        updatedAt: t.updated_at ? new Date(t.updated_at).getTime() : Date.now(),
        created_by: createdBy,
        sections: t.sections || [],
        preview_image: t.preview_image,
      };
    });
  } catch (error) {
    console.error("Error fetching system templates:", error);
    return [];
  }
}

export async function getActiveSystemTemplates(): Promise<SystemTemplate[]> {
  const token = getStoredToken();
  if (!token) {
    console.error("getActiveSystemTemplates: No authentication token available");
    return [];
  }

  try {
    const url = `${SYSTEM_TEMPLATES_ENDPOINT}/active`;
    console.log("getActiveSystemTemplates: Fetching from", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("getActiveSystemTemplates: Response status", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`getActiveSystemTemplates: Failed to fetch: ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    console.log("getActiveSystemTemplates: Raw API response:", data);

    // The API might return templates as an array or wrapped in a data field
    const templates = Array.isArray(data) ? data : (data?.data || data?.templates || []);
    console.log("getActiveSystemTemplates: Parsed templates count:", templates.length);

    const result = templates.map((t: any) => {
      // Parse created_by, handling different formats
      let createdBy = 0;
      if (t.created_by !== undefined && t.created_by !== null) {
        if (typeof t.created_by === 'string') {
          createdBy = parseInt(t.created_by, 10);
        } else if (typeof t.created_by === 'number') {
          createdBy = t.created_by;
        }
      }
      if (isNaN(createdBy)) createdBy = 0;

      return {
        id: t.id || t.template_id || String(Math.random()),
        title: t.title || t.name || "Untitled",
        description: t.description || "",
        content: t.content || "",
        status: t.status || "Active",
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
        updatedAt: t.updated_at ? new Date(t.updated_at).getTime() : Date.now(),
        created_by: createdBy,
        sections: t.sections || [],
        preview_image: t.preview_image,
      };
    });

    console.log("getActiveSystemTemplates: Returning templates:", result);
    result.forEach(t => {
      console.log(`  - "${t.title}": created_by=${t.created_by} (system: ${t.created_by === 0}, saved: ${t.created_by > 0})`);
    });
    console.log("getActiveSystemTemplates: System templates count:", result.filter(t => t.created_by === 0).length);
    console.log("getActiveSystemTemplates: Saved templates count:", result.filter(t => t.created_by > 0).length);
    return result;
  } catch (error) {
    console.error("getActiveSystemTemplates: Error fetching:", error);
    return [];
  }
}

export interface CreateTemplateResult {
  success: boolean;
  data?: SystemTemplate;
  error?: string;
}

export interface UpdateTemplateResult {
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
      preview_image: data.preview_image,
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

export async function updateSystemTemplate(
  templateId: string,
  data: {
    title?: string;
    status?: "Active" | "Inactive";
    client?: string;
    client_id?: string;
    sections?: Array<{
      id: string;
      title: string;
      content: string;
      layout?: string;
      columnContents?: string[];
      [key: string]: any;
    }>;
    pricing?: {
      currency?: string;
      taxRate?: number;
      items?: Array<{
        id: string;
        label: string;
        qty: number;
        price: number;
      }>;
    };
    settings?: {
      dueDate?: string;
      approvalFlow?: string;
      sharing?: {
        public: boolean;
        token?: string;
        allowComments: boolean;
      };
    };
    signatories?: Array<{
      id: string;
      name: string;
      email: string;
      role?: string;
      order?: number;
    }>;
    createdBy?: string;
    createdAt?: number;
    updatedAt?: number;
    versions?: any[];
  }
): Promise<UpdateTemplateResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const response = await fetch(`${SYSTEM_TEMPLATES_ENDPOINT}/${templateId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.message || errorData?.error || "Failed to update template";
      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseData = await response.json();

    const template: SystemTemplate = {
      id: responseData.id || String(Math.random()),
      title: responseData.title || "Untitled",
      description: responseData.description || "",
      content: responseData.content || "",
      status: responseData.status || "Active",
      createdAt: responseData.createdAt || (responseData.created_at ? new Date(responseData.created_at).getTime() : Date.now()),
      updatedAt: responseData.updatedAt || (responseData.updated_at ? new Date(responseData.updated_at).getTime() : Date.now()),
      sections: responseData.sections || [],
      preview_image: responseData.preview_image,
    };

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Error updating system template:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export interface DeleteTemplateResult {
  success: boolean;
  error?: string;
}

export async function deleteSystemTemplate(templateId: string): Promise<DeleteTemplateResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const response = await fetch(`${SYSTEM_TEMPLATES_ENDPOINT}/${templateId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.message || errorData?.error || "Failed to delete template";
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting system template:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function copyProposalFromTemplate(templateId: string, proposalId: string): Promise<Proposal | null> {
  const token = getStoredToken();
  if (!token) {
    console.error("No authentication token available");
    return null;
  }

  try {
    const response = await fetch("https://propai-api.hirenq.com/api/proposal/copy-from-template", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        proposal_id: proposalId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to copy proposal from template: ${response.statusText}`, errorData);
      return null;
    }

    const data = await response.json();
    console.log("copyProposalFromTemplate - API response:", data);

    // The response should contain proposal details
    // Map the response to our Proposal type
    if (!data.id) {
      console.error("Invalid response from copy-from-template API", data);
      return null;
    }

    const proposal: Proposal = {
      id: data.id,
      title: data.title || "Untitled",
      client: data.client || "",
      client_id: data.client_id,
      status: data.status || "draft",
      createdBy: data.createdBy || data.created_by || "System",
      createdAt: data.createdAt || (data.created_at ? new Date(data.created_at).getTime() : Date.now()),
      updatedAt: data.updatedAt || (data.updated_at ? new Date(data.updated_at).getTime() : Date.now()),
      sections: data.sections || [],
      pricing: data.pricing || {
        currency: "$",
        items: [],
        taxRate: 0,
      },
      settings: data.settings || {
        approvalFlow: "Single approver",
        sharing: {
          public: false,
          token: undefined,
          allowComments: true,
        },
      },
      versions: data.versions || [],
      signatories: data.signatories || [],
    };

    return proposal;
  } catch (error) {
    console.error("Error copying proposal from template:", error);
    return null;
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
    client_id: undefined,
    status: proposalStatus,
    createdBy: template.createdBy || "System",
    createdAt: template.createdAt || Date.now(),
    updatedAt: template.updatedAt || Date.now(),
    sections: (template.sections || []).map((s: any) => ({
      id: s.id || "",
      title: s.title || "",
      content: s.content || "",
      layout: s.layout,
      columnContents: s.columnContents || [],
      columnStyles: s.columnStyles || [],
      media: s.media || [],
      contentStyles: s.contentStyles || {},
      titleStyles: s.titleStyles || {},
      texts: Array.isArray(s.texts) ? s.texts : [],
      shapes: Array.isArray(s.shapes) ? s.shapes : [],
      images: Array.isArray(s.images) ? s.images : [],
      tables: Array.isArray(s.tables) ? s.tables : [],
      signatureFields: Array.isArray(s.signatureFields) ? s.signatureFields : [],
      comments: s.comments || [],
      styling: {
        fontSize: 14,
        fontFamily: "Inter",
        lineHeight: 1.5,
        textColor: "#000000",
        backgroundColor: "#ffffff",
      },
    })),
    pricing: {
      currency: "$",
      items: [],
      taxRate: 0,
    },
    settings: {
      approvalFlow: "Single approver",
      sharing: {
        public: false,
        token: undefined,
        allowComments: true,
      },
    },
    versions: [],
    signatories: [],
  };
}

export async function createProposalFromTemplate(templateId: string, proposalTitle: string): Promise<Proposal | null> {
  const token = getStoredToken();
  if (!token) {
    console.error("No authentication token available");
    return null;
  }

  try {
    const response = await fetch("https://propai-api.hirenq.com/api/proposal/create-from-template", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: proposalTitle.trim(),
        template_id: parseInt(templateId),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to create proposal from template: ${response.statusText}`, errorData);
      return null;
    }

    const data = await response.json();
    console.log("createProposalFromTemplate - API response:", data);

    if (!data.id) {
      console.error("Invalid response from create-from-template API", data);
      return null;
    }

    const proposal: Proposal = {
      id: data.id,
      title: data.title || proposalTitle,
      client: "",
      client_id: data.client_id,
      status: data.status || "draft",
      createdBy: data.created_by || "System",
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      sections: data.sections || [],
      pricing: {
        currency: data.currency || "$",
        items: data.pricing?.items || [],
        taxRate: parseFloat(data.tax_rate || "0"),
      },
      settings: {
        approvalFlow: "Single approver",
        sharing: {
          public: data.sharing_token ? true : false,
          token: data.sharing_token,
          allowComments: true,
        },
      },
      versions: [],
      signatories: data.signatories || [],
    };

    return proposal;
  } catch (error) {
    console.error("Error creating proposal from template:", error);
    return null;
  }
}

export async function saveProposalAsTemplate(proposalData: any, templateTitle: string): Promise<SystemTemplate | null> {
  const token = getStoredToken();
  if (!token) {
    console.error("No authentication token available");
    return null;
  }

  try {
    const response = await fetch("https://propai-api.hirenq.com/api/templates/create-from-proposal", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proposal_id: proposalData.id,
        title: templateTitle.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to save template: ${response.statusText}`, errorData);
      return null;
    }

    const data = await response.json();

    const template: SystemTemplate = {
      id: data.id || String(Math.random()),
      title: data.title || templateTitle,
      description: data.description || "",
      content: data.content || "",
      status: data.status || "Active",
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      sections: data.sections || [],
      preview_image: data.preview_image,
    };

    return template;
  } catch (error) {
    console.error("Error saving proposal as template:", error);
    return null;
  }
}
