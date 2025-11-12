import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  sectionId?: string;
  elementId?: string;
  elementType?: string;
  onUpdateProposal: (proposal: Proposal) => void;
}

export const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  sectionId,
  elementId,
  elementType,
  onUpdateProposal,
}) => {
  const [prompt, setPrompt] = useState("");

  const section = sectionId
    ? proposal.sections.find((s) => s.id === sectionId)
    : null;

  // If elementId is provided, extract section from element ID
  let activeSection = section;
  let targetElementId = elementId;
  let targetElementType = elementType;

  if (elementId && !section) {
    // Extract section ID from element ID (e.g., "section-content-abc123" -> "abc123")
    if (elementId.includes("section-") || elementId.includes("media-")) {
      const parts = elementId.split("-");
      if (elementId.startsWith("section-")) {
        const sid = elementId.replace(/^section-(title|content)-/, "");
        activeSection = proposal.sections.find((s) => s.id === sid);
      } else if (elementId.startsWith("media-")) {
        const sid = elementId.split("-")[1];
        activeSection = proposal.sections.find((s) => s.id === sid);
      }
    }
  }

  const getElementPreview = (): { label: string; value: string } | null => {
    if (!targetElementType) return null;

    if (targetElementType === "title") {
      return { label: "Proposal Title", value: proposal.title };
    }
    if (targetElementType === "section-title" && activeSection) {
      return { label: "Section Title", value: activeSection.title };
    }
    if (targetElementType === "section-content" && activeSection) {
      return { label: "Section Content", value: activeSection.content };
    }
    if ((targetElementType === "image" || targetElementType === "video") && activeSection) {
      return {
        label: `${targetElementType.toUpperCase()} - ${activeSection.title}`,
        value: "Media content",
      };
    }
    return null;
  };

  const handleAIWrite = (
    action: "generate" | "rewrite" | "summarize" | "translate",
    promptText: string
  ) => {
    if (!promptText.trim()) {
      toast({ title: "Please enter a prompt" });
      return;
    }

    if (!activeSection) {
      toast({ title: "No section selected" });
      return;
    }

    const updatedProposal = { ...proposal };

    if (targetElementType === "title") {
      updatedProposal.title = promptText;
    } else if (targetElementType === "section-title") {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, title: promptText } : s
      );
    } else if (targetElementType === "section-content") {
      let newContent = activeSection.content;
      if (action === "generate") newContent = `${newContent}\n\nGenerated: ${promptText}`;
      if (action === "rewrite") newContent = `${newContent}\n\nRewritten: ${promptText}`;
      if (action === "summarize")
        newContent =
          newContent.slice(0, Math.max(80, Math.floor(newContent.length * 0.5))) +
          "...";
      if (action === "translate")
        newContent = `${newContent}\n\n[Translated] ${promptText}`;

      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, content: newContent } : s
      );
    }

    onUpdateProposal(updatedProposal);
    setPrompt("");
    toast({ title: `${action} via AI assistant` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>

        {!section && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              No section selected. Please select a section from the Sections panel to use AI features.
            </p>
          </div>
        )}

        {section && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">
                Current Section: {section.title}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {section.content.substring(0, 100)}
                {section.content.length > 100 ? "..." : ""}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ai-prompt" className="text-xs font-semibold">
                Describe what you want...
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder="Tell the AI what you'd like to generate, rewrite, summarize, or translate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAIWrite("generate", prompt)}
                disabled={!section}
              >
                Generate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("rewrite", prompt)}
                disabled={!section}
              >
                Rewrite
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("summarize", prompt)}
                disabled={!section}
              >
                Summarize
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("translate", prompt)}
                disabled={!section}
              >
                Translate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
