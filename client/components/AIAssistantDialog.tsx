import React, { useState, useRef } from "react";
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
import { Proposal } from "@/services/proposalsService";
import { toast } from "@/hooks/use-toast";
import { generateAIContent } from "@/services/aiGenerationService";

interface HtmlRendererProps {
  content: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ content }) => {
  const result: JSX.Element[] = [];
  let lastIndex = 0;
  const regex = /{!!\s*([\s\S]*?)\s*!!}/g;
  let match;
  let keyCounter = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        result.push(
          <React.Fragment key={`text-${keyCounter++}`}>
            {textBefore}
          </React.Fragment>
        );
      }
    }

    const htmlContent = match[1];
    result.push(
      <span
        key={`html-${keyCounter++}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    result.push(
      <React.Fragment key={`text-${keyCounter++}`}>
        {content.substring(lastIndex)}
      </React.Fragment>
    );
  }

  return result.length > 0 ? <>{result}</> : <span className="text-gray-400">No content</span>;
};

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichContentEditor: React.FC<RichContentEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText || "";
    onChange(newContent);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="space-y-2">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className={`border rounded-md p-3 bg-white text-sm min-h-[200px] max-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
        }}
      >
        {value}
      </div>
      <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
        <div className="text-xs font-semibold text-gray-700 mb-2">Preview:</div>
        <div className="text-sm text-gray-800 [&_*]:all-auto">
          <HtmlRenderer content={value} />
        </div>
      </div>
    </div>
  );
};

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
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [editableContent, setEditableContent] = useState("");

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
      setAiContent(aiResponse);
      setEditableContent(aiResponse);
      setPrompt("");
      toast({ title: "Content generated successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
      toast({ title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToProposal = () => {
    if (!editableContent.trim()) {
      toast({ title: "Content is empty" });
      return;
    }

    if (!activeSection && targetElementType !== "title") {
      toast({ title: "No section selected" });
      return;
    }

    const updatedProposal = { ...proposal };

    if (targetElementType === "title") {
      updatedProposal.title = editableContent;
    } else if (targetElementType === "section-title" && activeSection) {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, title: editableContent } : s
      );
    } else if (targetElementType === "section-content" && activeSection) {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, content: editableContent } : s
      );
    }

    onUpdateProposal(updatedProposal);
    setAiContent(null);
    setEditableContent("");
    setPrompt("");
    toast({ title: "Content added to proposal" });
    onOpenChange(false);
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

        {isEnabled && (
          <div className="space-y-4">
            {aiContent && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Content</Label>
                  <RichContentEditor
                    value={editableContent}
                    onChange={setEditableContent}
                    placeholder="Edit the generated content here..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddToProposal}
                    className="flex-1"
                  >
                    Add to Proposal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAiContent(null);
                      setEditableContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {elementPreview && !aiContent && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <Label className="text-xs font-semibold block text-slate-700">
                  {elementPreview.label}
                </Label>
                <div className="text-sm text-slate-700 mt-2 [&_*]:all-auto">
                  <HtmlRenderer content={elementPreview.value} />
                </div>
              </div>
            )}

            {!aiContent && (
              <>
                {elementPreview && <Separator />}

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
                    disabled={!isEnabled || isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAIWrite("rewrite", prompt)}
                    disabled={!isEnabled || isLoading}
                  >
                    {isLoading ? "Rewriting..." : "Rewrite"}
                  </Button>
                  {targetElementType === "section-content" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleAIWrite("summarize", prompt)}
                        disabled={!isEnabled || isLoading}
                      >
                        {isLoading ? "Summarizing..." : "Summarize"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAIWrite("translate", prompt)}
                        disabled={!isEnabled || isLoading}
                      >
                        {isLoading ? "Translating..." : "Translate"}
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
