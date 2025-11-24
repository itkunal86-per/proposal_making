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
      const columnStyles = columnCount > 0 ? Array(columnCount).fill({}) : undefined;
      const columnGap = columnCount > 0 ? 24 : undefined;

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
  try {
    const response = await fetch("https://propai-api.hirenq.com/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `AI generation failed with status ${response.status}`
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
