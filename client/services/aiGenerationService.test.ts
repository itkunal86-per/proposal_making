import { afterEach, describe, expect, it, vi } from "vitest";
import { shouldOpenProposalTitleDialog } from "../lib/proposalCreationFlow";

vi.mock("@/lib/auth", () => ({
  getStoredToken: () => "token",
}));

import {
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
});
