import { describe, expect, it } from "vitest";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { aiGenerateButtonClassName, newProposalButtonClassName } from "./proposalListButtons";

describe("proposal list buttons", () => {
  it("keeps AI Generate text dark when the outline hover background is light", () => {
    const classes = cn(buttonVariants({ variant: "outline", className: aiGenerateButtonClassName }));

    expect(classes).toContain("hover:text-foreground");
    expect(classes).toContain("hover:bg-muted");
    expect(classes).not.toContain("hover:text-accent-foreground");
    expect(classes).not.toContain("hover:bg-accent");
  });

  it("uses the theme primary class for New Proposal instead of the primary-to-accent gradient", () => {
    expect(newProposalButtonClassName).toContain("btn-theme-primary");
    expect(newProposalButtonClassName).not.toContain("from-primary");
    expect(newProposalButtonClassName).not.toContain("to-accent");
  });
});
