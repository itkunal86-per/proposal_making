import { Proposal, ProposalSection } from "./proposalsService";
import { getStoredToken } from "@/lib/auth";

interface GenerateProposalRequest {
  prompt: string;
  clientName?: string;
  companyName?: string;
}

interface GenerateProposalResponse {
  title: string;
  sections: Array<{
    title: string;
    content: string;
    layout?: "single" | "two-column" | "three-column";
  }>;
}

interface ProposalAIResponse {
  status: boolean;
  message: string;
  data: string;
}

interface ChatInitRequest {
  message: string;
  input_type: "website" | "document" | "text";
  url?: string;
  file?: File | null;
}

interface ProposalIntent {
  Description: string;
  Goals: string[];
}

interface ProposalRequirements {
  [key: string]: string;
}

interface ProposalIntentData {
  ProposalIntent: ProposalIntent;
  Requirements: ProposalRequirements;
  ProposalType: string;
}

interface ChatInitResponse {
  status: boolean;
  session_id: number;
  proposal_intent: {
    ProposalIntent: ProposalIntent;
    Requirements: ProposalRequirements;
    ProposalType: string;
  };
}

interface GenerateFromTemplateRequest {
  session_id: number;
  template_id: string | number;
  title: string;
}

interface GenerateFromTemplateResponse {
  proposal_id: number;
  version: number;
}

export async function generateProposalFromPrompt(
  request: GenerateProposalRequest
): Promise<GenerateProposalResponse> {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY environment variable."
    );
  }

  const systemPrompt = `You are an expert proposal writer. Generate a professional proposal structure and content based on the user's prompt.

Return a JSON object with the following structure:
{
  "title": "Proposal Title",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content with detailed information",
      "layout": "single"
    }
  ]
}

Guidelines:
- Create 5-8 sections for a comprehensive proposal
- Include sections like Overview, Scope, Timeline, Pricing (if relevant), Why Choose Us, Next Steps
- Make content professional and detailed (200-300 words per section)
- Use clear, persuasive language
- Structure content for maximum impact`;

  const userPrompt = `Create a proposal for: ${request.prompt}${
    request.clientName ? `\nClient Name: ${request.clientName}` : ""
  }${request.companyName ? `\nCompany: ${request.companyName}` : ""}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Failed to generate proposal from OpenAI"
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const generated: GenerateProposalResponse = JSON.parse(content);
    return generated;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again.");
    }
    throw error;
  }
}

export async function generateProposalContent(
  baseProposal: Proposal,
  prompt: string
): Promise<Proposal> {
  const generated = await generateProposalFromPrompt({
    prompt,
    clientName: baseProposal.client,
  });

  const updatedProposal: Proposal = {
    ...baseProposal,
    title: generated.title,
    sections: generated.sections.map((section, index) => {
      const id = baseProposal.sections[index]?.id || crypto.randomUUID();
      const layout = section.layout || "single";
      const columnCount =
        layout === "two-column" ? 2 : layout === "three-column" ? 3 : 0;
      const columnContents = columnCount > 0 ? Array(columnCount).fill("") : undefined;
      const columnStyles = columnCount > 0 ? Array(columnCount).fill({
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
      }) : undefined;
      const columnGap = columnCount > 0 ? 0 : undefined;

      return {
        id,
        title: section.title,
        content: section.content,
        layout: layout as "single" | "two-column" | "three-column",
        columnContents,
        columnStyles,
        columnGap,
        media: [],
        comments: [],
        titleStyles: undefined,
        contentStyles: undefined,
      };
    }),
  };

  return updatedProposal;
}

export async function generateAIContent(prompt: string): Promise<string> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await fetch("https://propai-api.hirenq.com/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || `AI generation failed with status ${response.status}`
      );
    }

    const data: ProposalAIResponse = await response.json();

    if (!data.status) {
      throw new Error(data.message || "AI generation failed");
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI content: ${error.message}`);
    }
    throw new Error("Failed to generate AI content: Unknown error");
  }
}

export async function initializeProposalChat(
  request: ChatInitRequest
): Promise<ChatInitResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const formData = new FormData();
    formData.append("message", request.message);
    formData.append("input_type", request.input_type);

    if (request.url) {
      formData.append("url", request.url);
    }

    if (request.file) {
      formData.append("file", request.file);
    } else {
      formData.append("file", "");
    }

    const response = await fetch("https://propai-api.hirenq.com/api/chat/init", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || `Chat initialization failed with status ${response.status}`
      );
    }

    const data: ChatInitResponse = await response.json();

    if (!data.status) {
      throw new Error("Chat initialization failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize proposal chat: ${error.message}`);
    }
    throw new Error("Failed to initialize proposal chat: Unknown error");
  }
}

export async function generateProposalFromTemplate(
  request: GenerateFromTemplateRequest
): Promise<GenerateFromTemplateResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await fetch("https://propai-api.hirenq.com/api/chat/proposal/generate-from-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: request.session_id,
        template_id: request.template_id,
        title: request.title,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || error.error || `Failed to generate proposal with status ${response.status}`
      );
    }

    const data: GenerateFromTemplateResponse = await response.json();

    if (!data.proposal_id) {
      throw new Error("No proposal ID returned from API");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate proposal from template: ${error.message}`);
    }
    throw new Error("Failed to generate proposal from template: Unknown error");
  }
}
