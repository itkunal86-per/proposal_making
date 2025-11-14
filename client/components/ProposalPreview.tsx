import React from "react";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ElementProps {
  id: string;
  type: "title" | "section-title" | "section-content" | "image" | "video";
  selected: boolean;
  onSelect: () => void;
  onAI?: () => void;
  children?: React.ReactNode;
  value?: string;
  color?: string;
  fontSize?: string;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: "all" | "top" | "right" | "bottom" | "left";
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  bulletList?: boolean;
  numberList?: boolean;
}

const SelectableElement: React.FC<ElementProps> = ({
  selected,
  onSelect,
  onAI,
  children,
  type,
  color,
  fontSize,
  textAlign,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  borderStyle,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  bold,
  italic,
  underline,
  strikethrough,
  bulletList,
  numberList,
}) => {
  const baseClasses =
    "cursor-pointer transition-all duration-200 outline-2 outline-offset-2 relative group";
  const selectedClasses = selected
    ? "outline outline-blue-500 bg-blue-50/50"
    : "hover:outline hover:outline-gray-300 hover:outline-offset-2";

  const defaultFontSizes = {
    title: "32",
    "section-title": "24",
    "section-content": "16",
  };

  const defaultFontSize = (defaultFontSizes as any)[type] || "16";

  const getBorderStyle = () => {
    if (!borderWidth || parseInt(borderWidth) === 0) return "none";
    const width = `${borderWidth}px`;
    const color = borderColor || "#000000";

    if (borderStyle === "top") return `${width} solid ${color} 0 0 0`;
    if (borderStyle === "right") return `0 ${width} solid ${color} 0 0`;
    if (borderStyle === "bottom") return `0 0 ${width} solid ${color} 0`;
    if (borderStyle === "left") return `0 0 0 ${width} solid ${color}`;

    return `${width} solid ${color}`;
  };

  const styleOverrides: React.CSSProperties = {
    color: color || "inherit",
    fontSize: fontSize ? `${fontSize}px` : `${defaultFontSize}px`,
    textAlign: (textAlign as any) || "left",
    backgroundColor: backgroundColor || "transparent",
    border: getBorderStyle(),
    borderRadius: borderRadius ? `${borderRadius}px` : "0px",
    paddingTop: paddingTop ? `${paddingTop}px` : "0px",
    paddingRight: paddingRight ? `${paddingRight}px` : "0px",
    paddingBottom: paddingBottom ? `${paddingBottom}px` : "0px",
    paddingLeft: paddingLeft ? `${paddingLeft}px` : "0px",
    fontWeight: bold ? "bold" : "normal",
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none",
  };

  const formatClasses = [];
  if (bulletList) formatClasses.push("list-disc list-inside");
  if (numberList) formatClasses.push("list-decimal list-inside");

  const isTextElement = type !== "image" && type !== "video";

  if (type === "image" || type === "video") {
    return (
      <div
        onClick={onSelect}
        className={`${baseClasses} ${selectedClasses} overflow-hidden`}
        style={{
          borderRadius: borderRadius ? `${borderRadius}px` : "4px",
          border: getBorderStyle(),
        }}
      >
        {children}
        {onAI && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAI();
            }}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  const textClasses = {
    title: type === "title" && !fontSize ? "font-bold" : "",
    "section-title": type === "section-title" && !fontSize ? "font-bold" : "",
    "section-content": "",
  };

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${selectedClasses} ${!children && type === "section-content" ? "min-h-[80px] border-2 border-dashed border-gray-300" : ""}`}
      style={styleOverrides}
    >
      <div className={`${(textClasses as any)[type] || ""} ${formatClasses.join(" ")} ${!children && type === "section-content" ? "text-gray-400 italic p-2" : ""}`}>
        {children || (type === "section-content" ? "Click to add content..." : "")}
      </div>
      {onAI && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAI();
          }}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white h-8 w-8 p-0"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

interface ProposalPreviewProps {
  proposal: Proposal;
  selectedElementId: string | null;
  onSelectElement: (id: string, type: string) => void;
  onAIElement?: (elementId: string, elementType: string) => void;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  selectedElementId,
  onSelectElement,
  onAIElement,
}) => {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm">
      <SelectableElement
        id="proposal-title"
        type="title"
        selected={selectedElementId === "proposal-title"}
        onSelect={() => onSelectElement("proposal-title", "title")}
        onAI={() => onAIElement?.("proposal-title", "title")}
        value={proposal.title}
        color={(proposal as any).titleStyles?.color}
        fontSize={(proposal as any).titleStyles?.fontSize}
        textAlign={(proposal as any).titleStyles?.textAlign}
        backgroundColor={(proposal as any).titleStyles?.backgroundColor}
        borderColor={(proposal as any).titleStyles?.borderColor}
        bold={(proposal as any).titleStyles?.bold}
        italic={(proposal as any).titleStyles?.italic}
        underline={(proposal as any).titleStyles?.underline}
        strikethrough={(proposal as any).titleStyles?.strikethrough}
        bulletList={(proposal as any).titleStyles?.bulletList}
        numberList={(proposal as any).titleStyles?.numberList}
        borderWidth={(proposal as any).titleStyles?.borderWidth}
        borderRadius={(proposal as any).titleStyles?.borderRadius}
        borderStyle={(proposal as any).titleStyles?.borderStyle}
        paddingTop={(proposal as any).titleStyles?.paddingTop}
        paddingRight={(proposal as any).titleStyles?.paddingRight}
        paddingBottom={(proposal as any).titleStyles?.paddingBottom}
        paddingLeft={(proposal as any).titleStyles?.paddingLeft}
      >
        {proposal.title}
      </SelectableElement>

      {proposal.client && (
        <div className="text-sm text-gray-600 flex gap-2">
          <span className="font-semibold">Client:</span>
          <span>{proposal.client}</span>
        </div>
      )}

      <div className="border-t pt-4 space-y-6">
        {proposal.sections.map((section, index) => (
          <div key={section.id} data-section-id={section.id} className="space-y-3">
            <SelectableElement
              id={`section-title-${section.id}`}
              type="section-title"
              selected={selectedElementId === `section-title-${section.id}`}
              onSelect={() =>
                onSelectElement(`section-title-${section.id}`, "section-title")
              }
              onAI={() => onAIElement?.(`section-title-${section.id}`, "section-title")}
              value={section.title}
              color={(section as any).titleStyles?.color}
              fontSize={(section as any).titleStyles?.fontSize}
              textAlign={(section as any).titleStyles?.textAlign}
              backgroundColor={(section as any).titleStyles?.backgroundColor}
              borderColor={(section as any).titleStyles?.borderColor}
              borderWidth={(section as any).titleStyles?.borderWidth}
              borderRadius={(section as any).titleStyles?.borderRadius}
              borderStyle={(section as any).titleStyles?.borderStyle}
              paddingTop={(section as any).titleStyles?.paddingTop}
              paddingRight={(section as any).titleStyles?.paddingRight}
              paddingBottom={(section as any).titleStyles?.paddingBottom}
              paddingLeft={(section as any).titleStyles?.paddingLeft}
              bold={(section as any).titleStyles?.bold}
              italic={(section as any).titleStyles?.italic}
              underline={(section as any).titleStyles?.underline}
              strikethrough={(section as any).titleStyles?.strikethrough}
              bulletList={(section as any).titleStyles?.bulletList}
              numberList={(section as any).titleStyles?.numberList}
            >
              {section.title}
            </SelectableElement>

            <SelectableElement
              id={`section-content-${section.id}`}
              type="section-content"
              selected={selectedElementId === `section-content-${section.id}`}
              onSelect={() =>
                onSelectElement(`section-content-${section.id}`, "section-content")
              }
              onAI={() => onAIElement?.(`section-content-${section.id}`, "section-content")}
              value={section.content}
              color={(section as any).contentStyles?.color}
              fontSize={(section as any).contentStyles?.fontSize}
              textAlign={(section as any).contentStyles?.textAlign}
              backgroundColor={(section as any).contentStyles?.backgroundColor}
              borderColor={(section as any).contentStyles?.borderColor}
              borderWidth={(section as any).contentStyles?.borderWidth}
              borderRadius={(section as any).contentStyles?.borderRadius}
              borderStyle={(section as any).contentStyles?.borderStyle}
              paddingTop={(section as any).contentStyles?.paddingTop}
              paddingRight={(section as any).contentStyles?.paddingRight}
              paddingBottom={(section as any).contentStyles?.paddingBottom}
              paddingLeft={(section as any).contentStyles?.paddingLeft}
              bold={(section as any).contentStyles?.bold}
              italic={(section as any).contentStyles?.italic}
              underline={(section as any).contentStyles?.underline}
              strikethrough={(section as any).contentStyles?.strikethrough}
              bulletList={(section as any).contentStyles?.bulletList}
              numberList={(section as any).contentStyles?.numberList}
            >
              {section.content}
            </SelectableElement>

            {section.media && section.media.length > 0 && (
              <div className="grid gap-4 mt-4">
                {section.media.map((media, mIndex) => (
                  <SelectableElement
                    key={mIndex}
                    id={`media-${section.id}-${mIndex}`}
                    type={media.type}
                    selected={selectedElementId === `media-${section.id}-${mIndex}`}
                    onSelect={() =>
                      onSelectElement(`media-${section.id}-${mIndex}`, media.type)
                    }
                    onAI={() => onAIElement?.(`media-${section.id}-${mIndex}`, media.type)}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt="proposal media"
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-auto rounded"
                      />
                    )}
                  </SelectableElement>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
