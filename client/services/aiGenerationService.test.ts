import { afterEach, describe, expect, it, vi } from "vitest";
import { shouldOpenProposalTitleDialog } from "../lib/proposalCreationFlow";

vi.mock("@/lib/auth", () => ({
  getStoredToken: () => "token",
}));

import { apiConfig } from "@/lib/apiConfig";
import {
  generateAIContent,
  generateProposalFromTemplate,
  generationTimeouts,
  GenerationOutcomeUnknownError,
  pollProposalStatus,
  ProposalGenerationFailedError,
  runCreationTitleSubmit,
} from "./aiGenerationService";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  generationTimeouts.enqueueMs = 30_000;
  generationTimeouts.statusMs = 15_000;
  generationTimeouts.assistantMs = 45_000;
  vi.unstubAllGlobals();
});

describe("phase 1A proposal generation", () => {
  it("stops polling when status is failed", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: "failed" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(pollProposalStatus(7, 10, 1)).rejects.toBeInstanceOf(ProposalGenerationFailedError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stops polling on failed when the body has only status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ status: "failed" })));

    await expect(pollProposalStatus(7, 10, 1)).rejects.toThrow("Proposal generation failed");
  });

  it("returns when status is completed", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ status: "completed" })));

    await expect(pollProposalStatus(7, 3, 1)).resolves.toMatchObject({ status: "completed" });
  });

  it("retries one status timeout and then accepts completed", async () => {
    generationTimeouts.statusMs = 20;
    let calls = 0;
    vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => {
      calls += 1;
      if (calls === 1) {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const error = new Error("The operation was aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      }
      return Promise.resolve(jsonResponse({ status: "completed" }));
    }));

    await expect(pollProposalStatus(7, 5, 1)).resolves.toMatchObject({ status: "completed" });
    expect(calls).toBe(2);
  });

  it("does not claim failure or send another request when enqueue is aborted", async () => {
    generationTimeouts.enqueueMs = 20;
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = await generateProposalFromTemplate({
      session_id: 1,
      template_id: 2,
      title: "Website",
    }).then(
      () => {
        throw new Error("enqueue resolved");
      },
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(GenerationOutcomeUnknownError);
    expect(String((error as Error).message).toLowerCase()).not.toContain("generation failed");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries an enqueue HTTP 500 at most five times", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: "unavailable" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateProposalFromTemplate({
      session_id: 1,
      template_id: 2,
      title: "Website",
    })).rejects.toThrow(/unavailable/);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("manual create never calls generate-from-template", async () => {
    const generate = vi.fn();
    const applyManualTemplate = vi.fn(async () => undefined);

    await runCreationTitleSubmit({
      useAiGeneration: shouldOpenProposalTitleDialog("manual"),
      applyManualTemplate,
      generateFromTemplate: generate,
    });

    expect(applyManualTemplate).toHaveBeenCalledOnce();
    expect(generate).not.toHaveBeenCalled();
  });

  it("returns slot selection without polling for a proposal id", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/api/chat/proposal/generate-from-template");
      return jsonResponse({
        state: "needs_slot_selection",
        slots: [{
          section_index: 0,
          text_index: 0,
          element_id: "52n146j",
          preview: "New Website. More Leads.",
          suggestion: "protected",
          slot_id: "0:0:52n146j",
        }],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateProposalFromTemplate({
      session_id: 1,
      template_id: 3,
      title: "Website",
    });

    expect(result.state).toBe("needs_slot_selection");
    expect(result.proposal_id).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("AI assistant generation", () => {
  it("posts to the configured Laravel endpoint", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(apiConfig.endpoints.aiGenerate);
      expect(String(input)).not.toContain("propai-api.hirenq.com");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ prompt: "Write a title" });
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer token");
      return jsonResponse({ status: true, message: "AI response generated", data: "<p>Hello</p>" });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAIContent("Write a title")).resolves.toBe("<p>Hello</p>");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows the server error and does not retry", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      status: false,
      message: "AI generation failed. Please try again.",
    }, 502));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAIContent("Write a title")).rejects.toThrow("AI generation failed. Please try again.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("turns a hung request into a timeout error", async () => {
    generationTimeouts.assistantMs = 20;
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    }));

    await expect(generateAIContent("Write a title")).rejects.toThrow("The AI request timed out. Please try again.");
  });

  it("does not report a timeout when the caller cancels the request", async () => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    }));

    const pending = generateAIContent("Write a title", controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
