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
  maxLength?: number;
  showEllipsis?: boolean;
}

const getPlainTextLength = (html: string): number => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText.length;
};

const truncateHtml = (html: string, maxLength: number): string => {
  let length = 0;
  const div = document.createElement("div");
  const parser = new DOMParser();

  try {
    const doc = parser.parseFromString(html, "text/html");
    let result = "";

    const walk = (node: Node): boolean => {
      if (length >= maxLength) return false;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const remaining = maxLength - length;
        if (text.length > remaining) {
          result += text.substring(0, remaining);
          length = maxLength;
          return false;
        }
        result += text;
        length += text.length;
        return true;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        result += `<${element.tagName.toLowerCase()}>`;

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          result = result.slice(0, -1) + ` ${attr.name}="${attr.value}">`;
        }

        for (let i = 0; i < node.childNodes.length; i++) {
          if (!walk(node.childNodes[i])) break;
        }

        result += `</${element.tagName.toLowerCase()}>`;
        return length < maxLength;
      }

      return true;
    };

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      if (!walk(doc.body.childNodes[i])) break;
    }

    return result;
  } catch (e) {
    return html.substring(0, maxLength);
  }
};

const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  content,
  maxLength,
  showEllipsis = true
}) => {
  const hasHTMLMarkup = /{!!\s*([\s\S]*?)\s*!!}/.test(content) || /<[^>]+>/.test(content);

  if (!content.trim()) {
    return <span className="text-gray-400">No content</span>;
  }

  let htmlToRender = content;
  let isTruncated = false;

  if (maxLength) {
    const textLength = getPlainTextLength(content);
    if (textLength > maxLength) {
      htmlToRender = truncateHtml(content, maxLength);
      isTruncated = true;
    }
  }

  if (/{!!\s*([\s\S]*?)\s*!!}/.test(htmlToRender)) {
    const regex = /{!!\s*([\s\S]*?)\s*!!}/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = regex.exec(htmlToRender)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = htmlToRender.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(
            <React.Fragment key={`text-${keyCounter++}`}>
              {textBefore}
            </React.Fragment>
          );
        }
      }

      parts.push(
        <span
          key={`html-${keyCounter++}`}
          dangerouslySetInnerHTML={{ __html: match[1] }}
        />
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < htmlToRender.length) {
      parts.push(
        <React.Fragment key={`text-end`}>
          {htmlToRender.substring(lastIndex)}
        </React.Fragment>
      );
    }

    return (
      <>
        {parts}
        {isTruncated && showEllipsis && <span className="text-gray-500">...</span>}
      </>
    );
  }

  if (hasHTMLMarkup) {
    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: htmlToRender }} />
        {isTruncated && showEllipsis && <span className="text-gray-500">...</span>}
      </>
    );
  }

  return (
    <>
      {htmlToRender}
      {isTruncated && showEllipsis && <span className="text-gray-500">...</span>}
    </>
  );
};

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  previewOnly?: boolean;
}

const RichContentEditor: React.FC<RichContentEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  previewOnly = false,
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

  if (previewOnly) {
    return (
      <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px] max-h-[400px] overflow-y-auto">
        <div className="text-sm text-gray-800 [&_*]:all-auto">
          <HtmlRenderer content={value} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        onInput={handleInput}
        onPaste={handlePaste}
        className={`border rounded-md p-3 bg-white text-sm min-h-[200px] max-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "bidi-override",
        }}
      >
        {value}
      </div>
      <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px] max-h-[300px] overflow-y-auto">
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

  // Extract section ID from elementId first, then fall back to sectionId
  let activeSection: typeof proposal.sections[0] | null = null;
  let targetElementId = elementId;
  let targetElementType = elementType;
  let elementIndex: number | null = null;

  if (elementId && (elementId.includes("section-") || elementId.includes("media-") || elementId.includes("shape-") || elementId.includes("table-") || elementId.includes("text-"))) {
    // Extract section ID from element ID
    if (elementId.startsWith("section-")) {
      const sid = elementId.replace(/^section-(title|content)-/, "");
      activeSection = proposal.sections.find((s) => s.id === sid) || null;
    } else if (elementId.startsWith("media-")) {
      const sid = elementId.split("-")[1];
      activeSection = proposal.sections.find((s) => s.id === sid) || null;
    } else if (elementId.startsWith("shape-") || elementId.startsWith("table-") || elementId.startsWith("text-")) {
      // Format: "shape-sectionId-index", "table-sectionId-index", or "text-sectionId-index"
      const parts = elementId.split("-");
      if (parts.length >= 3) {
        const sid = parts[1];
        elementIndex = parseInt(parts[2]);
        activeSection = proposal.sections.find((s) => s.id === sid) || null;
      }
    }
  }

  // Only use sectionId as fallback if we couldn't extract from elementId
  if (!activeSection && sectionId) {
    activeSection = proposal.sections.find((s) => String(s.id) === String(sectionId)) || null;
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
    if (targetElementType === "text" && activeSection && elementIndex !== null) {
      const textElement = (activeSection as any).texts?.[elementIndex];
      return {
        label: `Text Block - ${activeSection.title}`,
        value: textElement?.content || "Empty text block",
      };
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

  const stripHtmlTags = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerText || "";
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
    // Strip HTML tags for text elements
    const contentToAdd = targetElementType === "text" ? stripHtmlTags(editableContent) : editableContent;

    if (targetElementType === "title") {
      updatedProposal.title = contentToAdd;
    } else if (targetElementType === "section-title" && activeSection) {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, title: contentToAdd } : s
      );
    } else if (targetElementType === "section-content" && activeSection) {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id ? { ...s, content: contentToAdd } : s
      );
    } else if (targetElementType === "text" && activeSection && elementIndex !== null) {
      updatedProposal.sections = proposal.sections.map((s) =>
        s.id === activeSection!.id
          ? {
              ...s,
              texts: ((s as any).texts || []).map((text: any, idx: number) =>
                idx === elementIndex ? { ...text, content: contentToAdd } : text
              ),
            }
          : s
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
                  <Label className="text-xs font-semibold">Preview</Label>
                  <RichContentEditor
                    value={editableContent}
                    onChange={setEditableContent}
                    placeholder="Edit the generated content here..."
                    previewOnly={true}
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
                <div className="text-sm text-slate-700 mt-2 [&_*]:all-auto line-clamp-3">
                  <HtmlRenderer content={elementPreview.value} maxLength={200} showEllipsis={true} />
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
