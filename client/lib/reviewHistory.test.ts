import { describe, expect, it } from "vitest";
import {
  reviewActionLabel,
  reviewActorLabel,
  reviewStatusTone,
  reviewStatusTransition,
} from "./reviewHistory";

describe("review history presentation", () => {
  it("labels known review actions and falls back for unknown ones", () => {
    expect(reviewActionLabel("rework_requested")).toBe("Rework requested");
    expect(reviewActionLabel("submitted_for_review")).toBe("Submitted for review");
    expect(reviewActionLabel("custom_action")).toBe("Custom Action");
  });

  it("uses the actor name, then email, and does not invent a role", () => {
    expect(reviewActorLabel({ name: "Ada Lovelace", email: "ada@example.com" })).toBe("Ada Lovelace");
    expect(reviewActorLabel({ name: " ", email: "ada@example.com" })).toBe("ada@example.com");
    expect(reviewActorLabel(null)).toBe("Unknown user");
  });

  it("maps approval, rework, review, and signature tones from stored fields", () => {
    expect(reviewStatusTone({ action: "approved", new_status: "approved" })).toBe("approved");
    expect(reviewStatusTone({ action: "rework_requested", new_status: "rework_requested" })).toBe("rework");
    expect(reviewStatusTone({ action: "submitted_for_review", new_status: "in_review" })).toBe("review");
    expect(reviewStatusTone({ action: "signed", new_status: "approved" })).toBe("signed");
    expect(reviewStatusTone({ action: "signed", new_status: null })).toBe("signed");
  });

  it("shows a status change only when the stored statuses differ", () => {
    expect(reviewStatusTransition({
      action: "submitted_for_review",
      previous_status: "draft",
      new_status: "in_review",
    })).toBe("Draft → In Review");
    expect(reviewStatusTransition({
      action: "comment",
      previous_status: "approved",
      new_status: "approved",
    })).toBeNull();
  });
});
