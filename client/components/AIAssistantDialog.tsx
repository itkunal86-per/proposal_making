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
import { generateAIContent } from "@/services/aiGenerationService";

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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAIWrite = async (
    action: "generate" | "rewrite" | "summarize" | "translate",
    promptText: string
  ) => {
    if (!promptText.trim()) {
      toast({ title: "Please enter a prompt" });
      return;
    }

    if (!activeSection && targetElementType !== "title") {
      toast({ title: "No section selected" });
      return;
    }

    setIsLoading(true);
    try {
      const aiResponse = await generateAIContent(promptText);

      const updatedProposal = { ...proposal };

      if (targetElementType === "title") {
        updatedProposal.title = aiResponse;
      } else if (targetElementType === "section-title" && activeSection) {
        updatedProposal.sections = proposal.sections.map((s) =>
          s.id === activeSection!.id ? { ...s, title: aiResponse } : s
        );
      } else if (targetElementType === "section-content" && activeSection) {
        let newContent = aiResponse;
        if (action !== "generate") {
          newContent = `${activeSection.content}\n\n${aiResponse}`;
        }

        updatedProposal.sections = proposal.sections.map((s) =>
          s.id === activeSection!.id ? { ...s, content: newContent } : s
        );
      }

      onUpdateProposal(updatedProposal);
      setPrompt("");
      toast({ title: "Content generated successfully" });
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
      toast({ title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const elementPreview = getElementPreview();
  const isEnabled = activeSection || targetElementType === "title";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>

        {!isEnabled && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              No element selected. Please select an element from the proposal to use AI features.
            </p>
          </div>
        )}

        {isEnabled && elementPreview && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <Label className="text-xs font-semibold block text-slate-700">
                {elementPreview.label}
              </Label>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {elementPreview.value.substring(0, 150)}
                {elementPreview.value.length > 150 ? "..." : ""}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ai-prompt" className="text-xs font-semibold">
                Prompt
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder={
                  targetElementType === "title"
                    ? "Enter new title or describe what you want..."
                    : targetElementType === "section-title"
                    ? "Enter new section title or describe what you want..."
                    : "Tell the AI what you'd like to generate, rewrite, summarize, or translate..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAIWrite("generate", prompt)}
                disabled={!isEnabled}
              >
                Generate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAIWrite("rewrite", prompt)}
                disabled={!isEnabled}
              >
                Rewrite
              </Button>
              {targetElementType === "section-content" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAIWrite("summarize", prompt)}
                    disabled={!isEnabled}
                  >
                    Summarize
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAIWrite("translate", prompt)}
                    disabled={!isEnabled}
                  >
                    Translate
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
