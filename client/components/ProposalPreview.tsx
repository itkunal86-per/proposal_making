import React from "react";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { replaceVariables } from "@/lib/variableUtils";

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
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: string;
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
  code?: boolean;
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
  backgroundImage,
  backgroundSize,
  backgroundOpacity,
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
  code,
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

  const isCodeOnly = code && !bulletList && !numberList;

  const styleOverrides: React.CSSProperties = {
    color: color || (isCodeOnly ? "#e8eaed" : "inherit"),
    fontSize: fontSize ? `${fontSize}px` : `${defaultFontSize}px`,
    textAlign: (textAlign as any) || "left",
    backgroundColor: backgroundColor || (isCodeOnly ? "#1f2937" : "transparent"),
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundSize || "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    border: getBorderStyle(),
    borderRadius: borderRadius ? `${borderRadius}px` : isCodeOnly ? "4px" : "0px",
    paddingTop: paddingTop ? `${paddingTop}px` : isCodeOnly ? "12px" : "0px",
    paddingRight: paddingRight ? `${paddingRight}px` : isCodeOnly ? "12px" : "0px",
    paddingBottom: paddingBottom ? `${paddingBottom}px` : isCodeOnly ? "12px" : "0px",
    paddingLeft: paddingLeft ? `${paddingLeft}px` : isCodeOnly ? "12px" : "0px",
    fontWeight: bold ? "bold" : "normal",
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none",
    position: (backgroundImage || onAI) ? "relative" : "static",
  };

  const backgroundOverlayOpacity = backgroundImage && backgroundOpacity ? (100 - parseInt(backgroundOpacity)) / 100 : 0;

  const isTextElement = type !== "image" && type !== "video";

  if (type === "image" || type === "video") {
    return (
      <div
        onClick={onSelect}
        className={`${baseClasses} ${selectedClasses} overflow-hidden group`}
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
            className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
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

  const renderContent = () => {
    const content = children || (type === "section-content" ? "Click to add content..." : "");

    if (bulletList && content) {
      const lines = String(content).split('\n').filter(line => line.trim());
      return (
        <ul className="list-disc list-inside space-y-1" style={{ fontFamily: code ? "ui-monospace, SFMono-Regular, Menlo, Courier, monospace" : "inherit" }}>
          {lines.map((line, idx) => (
            <li key={idx} style={{ fontWeight: bold ? "bold" : "normal", fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none" }}>
              {line}
            </li>
          ))}
        </ul>
      );
    }

    if (numberList && content) {
      const lines = String(content).split('\n').filter(line => line.trim());
      return (
        <ol className="list-decimal list-inside space-y-1" style={{ fontFamily: code ? "ui-monospace, SFMono-Regular, Menlo, Courier, monospace" : "inherit" }}>
          {lines.map((line, idx) => (
            <li key={idx} style={{ fontWeight: bold ? "bold" : "normal", fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none" }}>
              {line}
            </li>
          ))}
        </ol>
      );
    }

    if (code && content) {
      return (
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Courier, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {content}
        </div>
      );
    }

    return <div style={{ fontWeight: bold ? "bold" : "normal", fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none" }}>{content}</div>;
  };

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${selectedClasses} ${!children && type === "section-content" ? "min-h-[80px] border-2 border-dashed border-gray-300" : ""} group`}
      style={styleOverrides}
    >
      {backgroundImage && backgroundOverlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, " + backgroundOverlayOpacity + ")",
            borderRadius: borderRadius ? `${borderRadius}px` : isCodeOnly ? "4px" : "0px",
            pointerEvents: "none",
          }}
        />
      )}
      <div className={`${(textClasses as any)[type] || ""} ${!children && type === "section-content" ? "text-gray-400 italic p-2" : ""}`} style={{ position: "relative", zIndex: 1 }}>
        {renderContent()}
      </div>
      {onAI && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAI();
          }}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          style={{ zIndex: 2 }}
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
  variables?: Array<{ id: string | number; name: string; value: string }>;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  selectedElementId,
  onSelectElement,
  onAIElement,
  variables = [],
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
        backgroundImage={(proposal as any).titleStyles?.backgroundImage}
        backgroundSize={(proposal as any).titleStyles?.backgroundSize}
        backgroundOpacity={(proposal as any).titleStyles?.backgroundOpacity}
        borderColor={(proposal as any).titleStyles?.borderColor}
        bold={(proposal as any).titleStyles?.bold}
        italic={(proposal as any).titleStyles?.italic}
        underline={(proposal as any).titleStyles?.underline}
        strikethrough={(proposal as any).titleStyles?.strikethrough}
        bulletList={(proposal as any).titleStyles?.bulletList}
        numberList={(proposal as any).titleStyles?.numberList}
        code={(proposal as any).titleStyles?.code}
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
        {proposal.sections.map((section, index) => {
          const isMultiColumn = section.layout === "two-column" || section.layout === "three-column";
          const containerClassName =
            section.layout === "two-column" ? "grid grid-cols-2 gap-6" :
            section.layout === "three-column" ? "grid grid-cols-3 gap-6" :
            "space-y-3";

          if (section.layout && section.layout !== "single") {
            console.log(`Rendering section "${section.title}" with layout: ${section.layout}`, { containerClassName, isMultiColumn });
          }

          return (
          <div key={section.id} data-section-id={section.id} className={containerClassName}>
            {isMultiColumn && (
              <div className="col-span-full">
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
                  backgroundImage={(section as any).titleStyles?.backgroundImage}
                  backgroundSize={(section as any).titleStyles?.backgroundSize}
                  backgroundOpacity={(section as any).titleStyles?.backgroundOpacity}
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
                  code={(section as any).titleStyles?.code}
                >
                  {section.title}
                </SelectableElement>
              </div>
            )}
            {!isMultiColumn && (
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
                backgroundImage={(section as any).titleStyles?.backgroundImage}
                backgroundSize={(section as any).titleStyles?.backgroundSize}
                backgroundOpacity={(section as any).titleStyles?.backgroundOpacity}
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
                code={(section as any).titleStyles?.code}
              >
                {section.title}
              </SelectableElement>
            )}

            {!isMultiColumn && (
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
                backgroundImage={(section as any).contentStyles?.backgroundImage}
                backgroundSize={(section as any).contentStyles?.backgroundSize}
                backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                code={(section as any).contentStyles?.code}
              >
                {replaceVariables(section.content, variables)}
              </SelectableElement>
            )}

            {isMultiColumn && (
              <>
                {section.layout === "two-column" && (
                  <>
                    <div className="p-4 border border-slate-200 rounded bg-slate-50">
                      <SelectableElement
                        id={`section-content-${section.id}-col1`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col1`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col1`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col1`, "section-content")}
                        value={section.content}
                        color={(section as any).contentStyles?.color}
                        fontSize={(section as any).contentStyles?.fontSize}
                        textAlign={(section as any).contentStyles?.textAlign}
                        backgroundColor={(section as any).contentStyles?.backgroundColor}
                        backgroundImage={(section as any).contentStyles?.backgroundImage}
                        backgroundSize={(section as any).contentStyles?.backgroundSize}
                        backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                        code={(section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[0] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div className="p-4 border border-slate-200 rounded bg-slate-50">
                      <SelectableElement
                        id={`section-content-${section.id}-col2`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col2`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col2`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col2`, "section-content")}
                        value={section.content}
                        color={(section as any).contentStyles?.color}
                        fontSize={(section as any).contentStyles?.fontSize}
                        textAlign={(section as any).contentStyles?.textAlign}
                        backgroundColor={(section as any).contentStyles?.backgroundColor}
                        backgroundImage={(section as any).contentStyles?.backgroundImage}
                        backgroundSize={(section as any).contentStyles?.backgroundSize}
                        backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                        code={(section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[1] || "", variables)}
                      </SelectableElement>
                    </div>
                  </>
                )}
                {section.layout === "three-column" && (
                  <>
                    <div className="p-4 border border-slate-200 rounded bg-slate-50">
                      <SelectableElement
                        id={`section-content-${section.id}-col1`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col1`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col1`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col1`, "section-content")}
                        value={section.content}
                        color={(section as any).contentStyles?.color}
                        fontSize={(section as any).contentStyles?.fontSize}
                        textAlign={(section as any).contentStyles?.textAlign}
                        backgroundColor={(section as any).contentStyles?.backgroundColor}
                        backgroundImage={(section as any).contentStyles?.backgroundImage}
                        backgroundSize={(section as any).contentStyles?.backgroundSize}
                        backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                        code={(section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[0] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div className="p-4 border border-slate-200 rounded bg-slate-50">
                      <SelectableElement
                        id={`section-content-${section.id}-col2`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col2`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col2`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col2`, "section-content")}
                        value={section.content}
                        color={(section as any).contentStyles?.color}
                        fontSize={(section as any).contentStyles?.fontSize}
                        textAlign={(section as any).contentStyles?.textAlign}
                        backgroundColor={(section as any).contentStyles?.backgroundColor}
                        backgroundImage={(section as any).contentStyles?.backgroundImage}
                        backgroundSize={(section as any).contentStyles?.backgroundSize}
                        backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                        code={(section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[1] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div className="p-4 border border-slate-200 rounded bg-slate-50">
                      <SelectableElement
                        id={`section-content-${section.id}-col3`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col3`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col3`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col3`, "section-content")}
                        value={section.content}
                        color={(section as any).contentStyles?.color}
                        fontSize={(section as any).contentStyles?.fontSize}
                        textAlign={(section as any).contentStyles?.textAlign}
                        backgroundColor={(section as any).contentStyles?.backgroundColor}
                        backgroundImage={(section as any).contentStyles?.backgroundImage}
                        backgroundSize={(section as any).contentStyles?.backgroundSize}
                        backgroundOpacity={(section as any).contentStyles?.backgroundOpacity}
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
                        code={(section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[2] || "", variables)}
                      </SelectableElement>
                    </div>
                  </>
                )}
              </>
            )}

            {section.media && section.media.length > 0 && (
              <div className={isMultiColumn ? "col-span-full grid gap-4 mt-4" : "grid gap-4 mt-4"}>
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
        );
        })}
      </div>

    </div>
  );
};
