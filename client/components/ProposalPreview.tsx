import React from "react";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2 } from "lucide-react";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { ShapeEditor } from "@/components/ShapeEditor";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";

interface ElementProps {
  id: string;
  type: "title" | "section-title" | "section-content" | "image" | "video" | "shape";
  selected: boolean;
  onSelect: () => void;
  onAI?: () => void;
  onDelete?: () => void;
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
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  bulletList?: boolean;
  numberList?: boolean;
  code?: boolean;
}

const SelectableElement: React.FC<ElementProps> = ({
  id,
  selected,
  onSelect,
  onAI,
  onDelete,
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
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
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
    marginTop: marginTop ? `${marginTop}px` : undefined,
    marginRight: marginRight ? `${marginRight}px` : undefined,
    marginBottom: marginBottom ? `${marginBottom}px` : undefined,
    marginLeft: marginLeft ? `${marginLeft}px` : undefined,
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

  // If section-content is empty (deleted), don't render anything
  if (type === "section-content" && children === "") {
    return null;
  }

  const renderContent = () => {
    const content = children === undefined || children === null ? (type === "section-content" ? "Click to add content..." : "") : children;

    // Check for both literal HTML tags and encoded HTML entities
    const isHtml = typeof content === "string" && (content.includes("<") || content.includes("&lt;") || content.includes("&amp;"));
    const decodedContent = isHtml && typeof content === "string" ? decodeHtmlEntities(content) : content;

    // Prioritize HTML rendering - if content has HTML tags, render as HTML
    // This ensures rich text editor content (with ul/li, nested divs, etc.) displays correctly
    if (isHtml && typeof decodedContent === "string") {
      return (
        <div
          style={{
            fontWeight: bold ? "bold" : "normal",
            fontStyle: italic ? "italic" : "normal",
            textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none",
          }}
          className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: decodedContent }}
        />
      );
    }

    if (code && content) {
      return (
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Courier, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {decodedContent}
        </div>
      );
    }

    return <div style={{ fontWeight: bold ? "bold" : "normal", fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : strikethrough ? "line-through" : "none" }}>{decodedContent}</div>;
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
      {onDelete && type === "section-content" && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          variant="ghost"
          size="sm"
          className="absolute top-2 left-2 bg-white/80 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700"
          style={{ zIndex: 2 }}
          title="Delete content"
        >
          <Trash2 className="w-4 h-4" />
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
  onDeleteContent?: (sectionId: string, columnIndex?: number) => void;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  onAddShape?: (sectionId: string, shapeType: "square" | "circle" | "triangle", x: number, y: number) => void;
  onUpdateShape?: (sectionId: string, shapeIndex: number, updates: { width?: number; height?: number; top?: number; left?: number }) => void;
  onAddTable?: (sectionId: string, x: number, y: number) => void;
  onUpdateTable?: (sectionId: string, tableIndex: number, updates: any) => void;
  onAddText?: (sectionId: string, x: number, y: number) => void;
  onUpdateText?: (sectionId: string, textIndex: number, updates: any) => void;
  onAddImage?: (sectionId: string, x: number, y: number) => void;
  onUpdateImage?: (sectionId: string, imageIndex: number, updates: any) => void;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  selectedElementId,
  onSelectElement,
  onAIElement,
  onDeleteContent,
  variables = [],
  onAddShape,
  onUpdateShape,
  onAddTable,
  onUpdateTable,
  onAddText,
  onUpdateText,
  onAddImage,
  onUpdateImage,
}) => {
  const [dragOverSectionId, setDragOverSectionId] = React.useState<string | null>(null);
  const [canvasHeights, setCanvasHeights] = React.useState<Record<string, number>>({});
  const sectionRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    const newHeights: Record<string, number> = {};

    proposal.sections.forEach((section) => {
      if ((section.shapes && section.shapes.length > 0) ||
          (section.tables && section.tables.length > 0) ||
          ((section as any).texts && (section as any).texts.length > 0)) {
        let maxHeight = 400; // minimum height

        // Calculate max height needed for shapes
        if (section.shapes) {
          section.shapes.forEach((shape) => {
            const bottomPos = shape.top + shape.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for tables
        if (section.tables) {
          section.tables.forEach((table) => {
            const bottomPos = table.top + table.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for text elements
        if ((section as any).texts) {
          (section as any).texts.forEach((text: any) => {
            const bottomPos = text.top + (text.height || 100) + 20; // 20px padding, assume 100px if no height
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        newHeights[section.id] = maxHeight;
      }
    });

    setCanvasHeights(newHeights);
  }, [proposal.sections]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const data = e.dataTransfer.types.includes("application/json");
    if (data) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const draggedItem = JSON.parse(data);
        const sectionElement = sectionRefs.current.get(sectionId);
        if (sectionElement) {
          const rect = sectionElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (draggedItem.type === "shape") {
            onAddShape?.(sectionId, draggedItem.shapeType || "square", Math.max(0, x), Math.max(0, y));
          } else if (draggedItem.type === "table") {
            onAddTable?.(sectionId, Math.max(0, x), Math.max(0, y));
          } else if (draggedItem.type === "text") {
            onAddText?.(sectionId, Math.max(0, x), Math.max(0, y));
          } else if (draggedItem.type === "image") {
            onAddImage?.(sectionId, Math.max(0, x), Math.max(0, y));
          }
        }
      }
    } catch (err) {
      console.error("Error handling drop:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm w-full">
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
        marginTop={(proposal as any).titleStyles?.marginTop}
        marginRight={(proposal as any).titleStyles?.marginRight}
        marginBottom={(proposal as any).titleStyles?.marginBottom}
        marginLeft={(proposal as any).titleStyles?.marginLeft}
      >
        {proposal.title}
      </SelectableElement>

      {proposal.client && (
        <div className="text-sm text-gray-600 flex gap-2">
          <span className="font-semibold">Client:</span>
          <span>{proposal.client}</span>
        </div>
      )}

      <div className="border-t">
        {proposal.sections.map((section, index) => {
          const isMultiColumn = section.layout === "two-column" || section.layout === "three-column";
          const columnGapValue = typeof (section as any).titleStyles?.columnGap === "number" && (section as any).titleStyles.columnGap !== 24 ? (section as any).titleStyles.columnGap : 0;
          const gapAfterValue = typeof (section as any).contentStyles?.gapAfter === "number" ? (section as any).contentStyles.gapAfter : 10;
          const containerClassName =
            section.layout === "two-column" ? "grid grid-cols-2" :
            section.layout === "three-column" ? "grid grid-cols-3" :
            "space-y-3";

          return (
          <div
            key={section.id}
            data-section-id={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
            }}
            className={containerClassName}
            style={{
              gap: isMultiColumn ? `${columnGapValue}px` : undefined,
              marginBottom: `${gapAfterValue}px`,
              position: "relative"
            }}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOverSectionId(null)}
            onDrop={(e) => handleDrop(e, section.id)}
          >
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
                  marginTop={(section as any).titleStyles?.marginTop}
                  marginRight={(section as any).titleStyles?.marginRight}
                  marginBottom={(section as any).titleStyles?.marginBottom}
                  marginLeft={(section as any).titleStyles?.marginLeft}
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
                marginTop={(section as any).titleStyles?.marginTop}
                marginRight={(section as any).titleStyles?.marginRight}
                marginBottom={(section as any).titleStyles?.marginBottom}
                marginLeft={(section as any).titleStyles?.marginLeft}
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
                  onDelete={() => onDeleteContent?.(section.id)}
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
                  marginTop={(section as any).contentStyles?.marginTop}
                  marginRight={(section as any).contentStyles?.marginRight}
                  marginBottom={(section as any).contentStyles?.marginBottom}
                  marginLeft={(section as any).contentStyles?.marginLeft}
                  bold={(section as any).contentStyles?.bold}
                  italic={(section as any).contentStyles?.italic}
                  underline={(section as any).contentStyles?.underline}
                  strikethrough={(section as any).contentStyles?.strikethrough}
                  bulletList={(section as any).contentStyles?.bulletList}
                  numberList={(section as any).contentStyles?.numberList}
                  code={(section as any).contentStyles?.code}
                >
                  {replaceVariables(section.content || "", variables)}
                </SelectableElement>
            )}

            {isMultiColumn && (
              <>
                {section.layout === "two-column" && (
                  <>
                    <div style={{
                      backgroundColor: (section as any).columnStyles?.[0]?.backgroundColor || "transparent",
                      backgroundImage: (section as any).columnStyles?.[0]?.backgroundImage ? `url(${(section as any).columnStyles[0].backgroundImage})` : undefined,
                      backgroundSize: (section as any).columnStyles?.[0]?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderWidth: (section as any).columnStyles?.[0]?.borderWidth ? `${(section as any).columnStyles[0].borderWidth}px` : "0px",
                      borderColor: (section as any).columnStyles?.[0]?.borderColor || "#000000",
                      borderStyle: (section as any).columnStyles?.[0]?.borderWidth ? "solid" : "none",
                      borderRadius: (section as any).columnStyles?.[0]?.borderRadius ? `${(section as any).columnStyles[0].borderRadius}px` : "0px",
                      paddingTop: (section as any).columnStyles?.[0]?.paddingTop ? `${(section as any).columnStyles[0].paddingTop}px` : "0px",
                      paddingRight: (section as any).columnStyles?.[0]?.paddingRight ? `${(section as any).columnStyles[0].paddingRight}px` : "0px",
                      paddingBottom: (section as any).columnStyles?.[0]?.paddingBottom ? `${(section as any).columnStyles[0].paddingBottom}px` : "0px",
                      paddingLeft: (section as any).columnStyles?.[0]?.paddingLeft ? `${(section as any).columnStyles[0].paddingLeft}px` : "0px",
                      marginTop: (section as any).columnStyles?.[0]?.marginTop ? `${(section as any).columnStyles[0].marginTop}px` : "0px",
                      marginRight: (section as any).columnStyles?.[0]?.marginRight ? `${(section as any).columnStyles[0].marginRight}px` : "0px",
                      marginBottom: (section as any).columnStyles?.[0]?.marginBottom ? `${(section as any).columnStyles[0].marginBottom}px` : "0px",
                      marginLeft: (section as any).columnStyles?.[0]?.marginLeft ? `${(section as any).columnStyles[0].marginLeft}px` : "0px",
                      position: (section as any).columnStyles?.[0]?.backgroundImage ? "relative" : "static",
                    }}>
                      <SelectableElement
                        id={`section-content-${section.id}-col1`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col1`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col1`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col1`, "section-content")}
                        onDelete={() => onDeleteContent?.(section.id, 0)}
                        value={section.content}
                        color={(section as any).columnStyles?.[0]?.color || (section as any).contentStyles?.color}
                        fontSize={(section as any).columnStyles?.[0]?.fontSize || (section as any).contentStyles?.fontSize}
                        textAlign={(section as any).columnStyles?.[0]?.textAlign || (section as any).contentStyles?.textAlign}
                        backgroundColor="transparent"
                        backgroundImage={undefined}
                        backgroundSize={undefined}
                        backgroundOpacity={undefined}
                        borderColor={(section as any).columnStyles?.[0]?.borderColor || (section as any).contentStyles?.borderColor}
                        borderWidth={(section as any).columnStyles?.[0]?.borderWidth || (section as any).contentStyles?.borderWidth}
                        borderRadius={(section as any).columnStyles?.[0]?.borderRadius || (section as any).contentStyles?.borderRadius}
                        borderStyle={(section as any).columnStyles?.[0]?.borderStyle || (section as any).contentStyles?.borderStyle}
                        paddingTop={(section as any).columnStyles?.[0]?.paddingTop || (section as any).contentStyles?.paddingTop}
                        paddingRight={(section as any).columnStyles?.[0]?.paddingRight || (section as any).contentStyles?.paddingRight}
                        paddingBottom={(section as any).columnStyles?.[0]?.paddingBottom || (section as any).contentStyles?.paddingBottom}
                        paddingLeft={(section as any).columnStyles?.[0]?.paddingLeft || (section as any).contentStyles?.paddingLeft}
                        marginTop={(section as any).columnStyles?.[0]?.marginTop || (section as any).contentStyles?.marginTop}
                        marginRight={(section as any).columnStyles?.[0]?.marginRight || (section as any).contentStyles?.marginRight}
                        marginBottom={(section as any).columnStyles?.[0]?.marginBottom || (section as any).contentStyles?.marginBottom}
                        marginLeft={(section as any).columnStyles?.[0]?.marginLeft || (section as any).contentStyles?.marginLeft}
                        bold={(section as any).columnStyles?.[0]?.bold || (section as any).contentStyles?.bold}
                        italic={(section as any).columnStyles?.[0]?.italic || (section as any).contentStyles?.italic}
                        underline={(section as any).columnStyles?.[0]?.underline || (section as any).contentStyles?.underline}
                        strikethrough={(section as any).columnStyles?.[0]?.strikethrough || (section as any).contentStyles?.strikethrough}
                        bulletList={(section as any).columnStyles?.[0]?.bulletList || (section as any).contentStyles?.bulletList}
                        numberList={(section as any).columnStyles?.[0]?.numberList || (section as any).contentStyles?.numberList}
                        code={(section as any).columnStyles?.[0]?.code || (section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[0] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div style={{
                      backgroundColor: (section as any).columnStyles?.[1]?.backgroundColor || "transparent",
                      backgroundImage: (section as any).columnStyles?.[1]?.backgroundImage ? `url(${(section as any).columnStyles[1].backgroundImage})` : undefined,
                      backgroundSize: (section as any).columnStyles?.[1]?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderWidth: (section as any).columnStyles?.[1]?.borderWidth ? `${(section as any).columnStyles[1].borderWidth}px` : "0px",
                      borderColor: (section as any).columnStyles?.[1]?.borderColor || "#000000",
                      borderStyle: (section as any).columnStyles?.[1]?.borderWidth ? "solid" : "none",
                      borderRadius: (section as any).columnStyles?.[1]?.borderRadius ? `${(section as any).columnStyles[1].borderRadius}px` : "0px",
                      paddingTop: (section as any).columnStyles?.[1]?.paddingTop ? `${(section as any).columnStyles[1].paddingTop}px` : "0px",
                      paddingRight: (section as any).columnStyles?.[1]?.paddingRight ? `${(section as any).columnStyles[1].paddingRight}px` : "0px",
                      paddingBottom: (section as any).columnStyles?.[1]?.paddingBottom ? `${(section as any).columnStyles[1].paddingBottom}px` : "0px",
                      paddingLeft: (section as any).columnStyles?.[1]?.paddingLeft ? `${(section as any).columnStyles[1].paddingLeft}px` : "0px",
                      marginTop: (section as any).columnStyles?.[1]?.marginTop ? `${(section as any).columnStyles[1].marginTop}px` : "0px",
                      marginRight: (section as any).columnStyles?.[1]?.marginRight ? `${(section as any).columnStyles[1].marginRight}px` : "0px",
                      marginBottom: (section as any).columnStyles?.[1]?.marginBottom ? `${(section as any).columnStyles[1].marginBottom}px` : "0px",
                      marginLeft: (section as any).columnStyles?.[1]?.marginLeft ? `${(section as any).columnStyles[1].marginLeft}px` : "0px",
                      position: (section as any).columnStyles?.[1]?.backgroundImage ? "relative" : "static",
                    }}>
                      <SelectableElement
                        id={`section-content-${section.id}-col2`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col2`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col2`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col2`, "section-content")}
                        onDelete={() => onDeleteContent?.(section.id, 1)}
                        value={section.content}
                        color={(section as any).columnStyles?.[1]?.color || (section as any).contentStyles?.color}
                        fontSize={(section as any).columnStyles?.[1]?.fontSize || (section as any).contentStyles?.fontSize}
                        textAlign={(section as any).columnStyles?.[1]?.textAlign || (section as any).contentStyles?.textAlign}
                        backgroundColor="transparent"
                        backgroundImage={undefined}
                        backgroundSize={undefined}
                        backgroundOpacity={undefined}
                        borderColor={(section as any).columnStyles?.[1]?.borderColor || (section as any).contentStyles?.borderColor}
                        borderWidth={(section as any).columnStyles?.[1]?.borderWidth || (section as any).contentStyles?.borderWidth}
                        borderRadius={(section as any).columnStyles?.[1]?.borderRadius || (section as any).contentStyles?.borderRadius}
                        borderStyle={(section as any).columnStyles?.[1]?.borderStyle || (section as any).contentStyles?.borderStyle}
                        paddingTop={(section as any).columnStyles?.[1]?.paddingTop || (section as any).contentStyles?.paddingTop}
                        paddingRight={(section as any).columnStyles?.[1]?.paddingRight || (section as any).contentStyles?.paddingRight}
                        paddingBottom={(section as any).columnStyles?.[1]?.paddingBottom || (section as any).contentStyles?.paddingBottom}
                        paddingLeft={(section as any).columnStyles?.[1]?.paddingLeft || (section as any).contentStyles?.paddingLeft}
                        marginTop={(section as any).columnStyles?.[1]?.marginTop || (section as any).contentStyles?.marginTop}
                        marginRight={(section as any).columnStyles?.[1]?.marginRight || (section as any).contentStyles?.marginRight}
                        marginBottom={(section as any).columnStyles?.[1]?.marginBottom || (section as any).contentStyles?.marginBottom}
                        marginLeft={(section as any).columnStyles?.[1]?.marginLeft || (section as any).contentStyles?.marginLeft}
                        bold={(section as any).columnStyles?.[1]?.bold || (section as any).contentStyles?.bold}
                        italic={(section as any).columnStyles?.[1]?.italic || (section as any).contentStyles?.italic}
                        underline={(section as any).columnStyles?.[1]?.underline || (section as any).contentStyles?.underline}
                        strikethrough={(section as any).columnStyles?.[1]?.strikethrough || (section as any).contentStyles?.strikethrough}
                        bulletList={(section as any).columnStyles?.[1]?.bulletList || (section as any).contentStyles?.bulletList}
                        numberList={(section as any).columnStyles?.[1]?.numberList || (section as any).contentStyles?.numberList}
                        code={(section as any).columnStyles?.[1]?.code || (section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[1] || "", variables)}
                      </SelectableElement>
                    </div>
                  </>
                )}
                {section.layout === "three-column" && (
                  <>
                    <div style={{
                      backgroundColor: (section as any).columnStyles?.[0]?.backgroundColor || "transparent",
                      backgroundImage: (section as any).columnStyles?.[0]?.backgroundImage ? `url(${(section as any).columnStyles[0].backgroundImage})` : undefined,
                      backgroundSize: (section as any).columnStyles?.[0]?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderWidth: (section as any).columnStyles?.[0]?.borderWidth ? `${(section as any).columnStyles[0].borderWidth}px` : "0px",
                      borderColor: (section as any).columnStyles?.[0]?.borderColor || "#000000",
                      borderStyle: (section as any).columnStyles?.[0]?.borderWidth ? "solid" : "none",
                      borderRadius: (section as any).columnStyles?.[0]?.borderRadius ? `${(section as any).columnStyles[0].borderRadius}px` : "0px",
                      paddingTop: (section as any).columnStyles?.[0]?.paddingTop ? `${(section as any).columnStyles[0].paddingTop}px` : "0px",
                      paddingRight: (section as any).columnStyles?.[0]?.paddingRight ? `${(section as any).columnStyles[0].paddingRight}px` : "0px",
                      paddingBottom: (section as any).columnStyles?.[0]?.paddingBottom ? `${(section as any).columnStyles[0].paddingBottom}px` : "0px",
                      paddingLeft: (section as any).columnStyles?.[0]?.paddingLeft ? `${(section as any).columnStyles[0].paddingLeft}px` : "0px",
                      marginTop: (section as any).columnStyles?.[0]?.marginTop ? `${(section as any).columnStyles[0].marginTop}px` : "0px",
                      marginRight: (section as any).columnStyles?.[0]?.marginRight ? `${(section as any).columnStyles[0].marginRight}px` : "0px",
                      marginBottom: (section as any).columnStyles?.[0]?.marginBottom ? `${(section as any).columnStyles[0].marginBottom}px` : "0px",
                      marginLeft: (section as any).columnStyles?.[0]?.marginLeft ? `${(section as any).columnStyles[0].marginLeft}px` : "0px",
                      position: (section as any).columnStyles?.[0]?.backgroundImage ? "relative" : "static",
                    }}>
                      <SelectableElement
                        id={`section-content-${section.id}-col1`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col1`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col1`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col1`, "section-content")}
                        onDelete={() => onDeleteContent?.(section.id, 0)}
                        value={(section as any).columnContents?.[0] || section.content}
                        color={(section as any).columnStyles?.[0]?.color || (section as any).contentStyles?.color}
                        fontSize={(section as any).columnStyles?.[0]?.fontSize || (section as any).contentStyles?.fontSize}
                        textAlign={(section as any).columnStyles?.[0]?.textAlign || (section as any).contentStyles?.textAlign}
                        backgroundColor="transparent"
                        backgroundImage={undefined}
                        backgroundSize={undefined}
                        backgroundOpacity={undefined}
                        borderColor={(section as any).columnStyles?.[0]?.borderColor || (section as any).contentStyles?.borderColor}
                        borderWidth={(section as any).columnStyles?.[0]?.borderWidth || (section as any).contentStyles?.borderWidth}
                        borderRadius={(section as any).columnStyles?.[0]?.borderRadius || (section as any).contentStyles?.borderRadius}
                        borderStyle={(section as any).columnStyles?.[0]?.borderStyle || (section as any).contentStyles?.borderStyle}
                        paddingTop={(section as any).columnStyles?.[0]?.paddingTop || (section as any).contentStyles?.paddingTop}
                        paddingRight={(section as any).columnStyles?.[0]?.paddingRight || (section as any).contentStyles?.paddingRight}
                        paddingBottom={(section as any).columnStyles?.[0]?.paddingBottom || (section as any).contentStyles?.paddingBottom}
                        paddingLeft={(section as any).columnStyles?.[0]?.paddingLeft || (section as any).contentStyles?.paddingLeft}
                        marginTop={(section as any).columnStyles?.[0]?.marginTop || (section as any).contentStyles?.marginTop}
                        marginRight={(section as any).columnStyles?.[0]?.marginRight || (section as any).contentStyles?.marginRight}
                        marginBottom={(section as any).columnStyles?.[0]?.marginBottom || (section as any).contentStyles?.marginBottom}
                        marginLeft={(section as any).columnStyles?.[0]?.marginLeft || (section as any).contentStyles?.marginLeft}
                        bold={(section as any).columnStyles?.[0]?.bold || (section as any).contentStyles?.bold}
                        italic={(section as any).columnStyles?.[0]?.italic || (section as any).contentStyles?.italic}
                        underline={(section as any).columnStyles?.[0]?.underline || (section as any).contentStyles?.underline}
                        strikethrough={(section as any).columnStyles?.[0]?.strikethrough || (section as any).contentStyles?.strikethrough}
                        bulletList={(section as any).columnStyles?.[0]?.bulletList || (section as any).contentStyles?.bulletList}
                        numberList={(section as any).columnStyles?.[0]?.numberList || (section as any).contentStyles?.numberList}
                        code={(section as any).columnStyles?.[0]?.code || (section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[0] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div style={{
                      backgroundColor: (section as any).columnStyles?.[1]?.backgroundColor || "transparent",
                      backgroundImage: (section as any).columnStyles?.[1]?.backgroundImage ? `url(${(section as any).columnStyles[1].backgroundImage})` : undefined,
                      backgroundSize: (section as any).columnStyles?.[1]?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderWidth: (section as any).columnStyles?.[1]?.borderWidth ? `${(section as any).columnStyles[1].borderWidth}px` : "0px",
                      borderColor: (section as any).columnStyles?.[1]?.borderColor || "#000000",
                      borderStyle: (section as any).columnStyles?.[1]?.borderWidth ? "solid" : "none",
                      borderRadius: (section as any).columnStyles?.[1]?.borderRadius ? `${(section as any).columnStyles[1].borderRadius}px` : "0px",
                      paddingTop: (section as any).columnStyles?.[1]?.paddingTop ? `${(section as any).columnStyles[1].paddingTop}px` : "0px",
                      paddingRight: (section as any).columnStyles?.[1]?.paddingRight ? `${(section as any).columnStyles[1].paddingRight}px` : "0px",
                      paddingBottom: (section as any).columnStyles?.[1]?.paddingBottom ? `${(section as any).columnStyles[1].paddingBottom}px` : "0px",
                      paddingLeft: (section as any).columnStyles?.[1]?.paddingLeft ? `${(section as any).columnStyles[1].paddingLeft}px` : "0px",
                      marginTop: (section as any).columnStyles?.[1]?.marginTop ? `${(section as any).columnStyles[1].marginTop}px` : "0px",
                      marginRight: (section as any).columnStyles?.[1]?.marginRight ? `${(section as any).columnStyles[1].marginRight}px` : "0px",
                      marginBottom: (section as any).columnStyles?.[1]?.marginBottom ? `${(section as any).columnStyles[1].marginBottom}px` : "0px",
                      marginLeft: (section as any).columnStyles?.[1]?.marginLeft ? `${(section as any).columnStyles[1].marginLeft}px` : "0px",
                      position: (section as any).columnStyles?.[1]?.backgroundImage ? "relative" : "static",
                    }}>
                      <SelectableElement
                        id={`section-content-${section.id}-col2`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col2`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col2`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col2`, "section-content")}
                        onDelete={() => onDeleteContent?.(section.id, 1)}
                        value={(section as any).columnContents?.[1] || section.content}
                        color={(section as any).columnStyles?.[1]?.color || (section as any).contentStyles?.color}
                        fontSize={(section as any).columnStyles?.[1]?.fontSize || (section as any).contentStyles?.fontSize}
                        textAlign={(section as any).columnStyles?.[1]?.textAlign || (section as any).contentStyles?.textAlign}
                        backgroundColor="transparent"
                        backgroundImage={undefined}
                        backgroundSize={undefined}
                        backgroundOpacity={undefined}
                        borderColor={(section as any).columnStyles?.[1]?.borderColor || (section as any).contentStyles?.borderColor}
                        borderWidth={(section as any).columnStyles?.[1]?.borderWidth || (section as any).contentStyles?.borderWidth}
                        borderRadius={(section as any).columnStyles?.[1]?.borderRadius || (section as any).contentStyles?.borderRadius}
                        borderStyle={(section as any).columnStyles?.[1]?.borderStyle || (section as any).contentStyles?.borderStyle}
                        paddingTop={(section as any).columnStyles?.[1]?.paddingTop || (section as any).contentStyles?.paddingTop}
                        paddingRight={(section as any).columnStyles?.[1]?.paddingRight || (section as any).contentStyles?.paddingRight}
                        paddingBottom={(section as any).columnStyles?.[1]?.paddingBottom || (section as any).contentStyles?.paddingBottom}
                        paddingLeft={(section as any).columnStyles?.[1]?.paddingLeft || (section as any).contentStyles?.paddingLeft}
                        marginTop={(section as any).columnStyles?.[1]?.marginTop || (section as any).contentStyles?.marginTop}
                        marginRight={(section as any).columnStyles?.[1]?.marginRight || (section as any).contentStyles?.marginRight}
                        marginBottom={(section as any).columnStyles?.[1]?.marginBottom || (section as any).contentStyles?.marginBottom}
                        marginLeft={(section as any).columnStyles?.[1]?.marginLeft || (section as any).contentStyles?.marginLeft}
                        bold={(section as any).columnStyles?.[1]?.bold || (section as any).contentStyles?.bold}
                        italic={(section as any).columnStyles?.[1]?.italic || (section as any).contentStyles?.italic}
                        underline={(section as any).columnStyles?.[1]?.underline || (section as any).contentStyles?.underline}
                        strikethrough={(section as any).columnStyles?.[1]?.strikethrough || (section as any).contentStyles?.strikethrough}
                        bulletList={(section as any).columnStyles?.[1]?.bulletList || (section as any).contentStyles?.bulletList}
                        numberList={(section as any).columnStyles?.[1]?.numberList || (section as any).contentStyles?.numberList}
                        code={(section as any).columnStyles?.[1]?.code || (section as any).contentStyles?.code}
                      >
                        {replaceVariables((section as any).columnContents?.[1] || "", variables)}
                      </SelectableElement>
                    </div>
                    <div style={{
                      backgroundColor: (section as any).columnStyles?.[2]?.backgroundColor || "transparent",
                      backgroundImage: (section as any).columnStyles?.[2]?.backgroundImage ? `url(${(section as any).columnStyles[2].backgroundImage})` : undefined,
                      backgroundSize: (section as any).columnStyles?.[2]?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderWidth: (section as any).columnStyles?.[2]?.borderWidth ? `${(section as any).columnStyles[2].borderWidth}px` : "0px",
                      borderColor: (section as any).columnStyles?.[2]?.borderColor || "#000000",
                      borderStyle: (section as any).columnStyles?.[2]?.borderWidth ? "solid" : "none",
                      borderRadius: (section as any).columnStyles?.[2]?.borderRadius ? `${(section as any).columnStyles[2].borderRadius}px` : "0px",
                      paddingTop: (section as any).columnStyles?.[2]?.paddingTop ? `${(section as any).columnStyles[2].paddingTop}px` : "0px",
                      paddingRight: (section as any).columnStyles?.[2]?.paddingRight ? `${(section as any).columnStyles[2].paddingRight}px` : "0px",
                      paddingBottom: (section as any).columnStyles?.[2]?.paddingBottom ? `${(section as any).columnStyles[2].paddingBottom}px` : "0px",
                      paddingLeft: (section as any).columnStyles?.[2]?.paddingLeft ? `${(section as any).columnStyles[2].paddingLeft}px` : "0px",
                      marginTop: (section as any).columnStyles?.[2]?.marginTop ? `${(section as any).columnStyles[2].marginTop}px` : "0px",
                      marginRight: (section as any).columnStyles?.[2]?.marginRight ? `${(section as any).columnStyles[2].marginRight}px` : "0px",
                      marginBottom: (section as any).columnStyles?.[2]?.marginBottom ? `${(section as any).columnStyles[2].marginBottom}px` : "0px",
                      marginLeft: (section as any).columnStyles?.[2]?.marginLeft ? `${(section as any).columnStyles[2].marginLeft}px` : "0px",
                      position: (section as any).columnStyles?.[2]?.backgroundImage ? "relative" : "static",
                    }}>
                      <SelectableElement
                        id={`section-content-${section.id}-col3`}
                        type="section-content"
                        selected={selectedElementId === `section-content-${section.id}-col3`}
                        onSelect={() =>
                          onSelectElement(`section-content-${section.id}-col3`, "section-content")
                        }
                        onAI={() => onAIElement?.(`section-content-${section.id}-col3`, "section-content")}
                        onDelete={() => onDeleteContent?.(section.id, 2)}
                        value={(section as any).columnContents?.[2] || section.content}
                        color={(section as any).columnStyles?.[2]?.color || (section as any).contentStyles?.color}
                        fontSize={(section as any).columnStyles?.[2]?.fontSize || (section as any).contentStyles?.fontSize}
                        textAlign={(section as any).columnStyles?.[2]?.textAlign || (section as any).contentStyles?.textAlign}
                        backgroundColor="transparent"
                        backgroundImage={undefined}
                        backgroundSize={undefined}
                        backgroundOpacity={undefined}
                        borderColor={(section as any).columnStyles?.[2]?.borderColor || (section as any).contentStyles?.borderColor}
                        borderWidth={(section as any).columnStyles?.[2]?.borderWidth || (section as any).contentStyles?.borderWidth}
                        borderRadius={(section as any).columnStyles?.[2]?.borderRadius || (section as any).contentStyles?.borderRadius}
                        borderStyle={(section as any).columnStyles?.[2]?.borderStyle || (section as any).contentStyles?.borderStyle}
                        paddingTop={(section as any).columnStyles?.[2]?.paddingTop || (section as any).contentStyles?.paddingTop}
                        paddingRight={(section as any).columnStyles?.[2]?.paddingRight || (section as any).contentStyles?.paddingRight}
                        paddingBottom={(section as any).columnStyles?.[2]?.paddingBottom || (section as any).contentStyles?.paddingBottom}
                        paddingLeft={(section as any).columnStyles?.[2]?.paddingLeft || (section as any).contentStyles?.paddingLeft}
                        marginTop={(section as any).columnStyles?.[2]?.marginTop || (section as any).contentStyles?.marginTop}
                        marginRight={(section as any).columnStyles?.[2]?.marginRight || (section as any).contentStyles?.marginRight}
                        marginBottom={(section as any).columnStyles?.[2]?.marginBottom || (section as any).contentStyles?.marginBottom}
                        marginLeft={(section as any).columnStyles?.[2]?.marginLeft || (section as any).contentStyles?.marginLeft}
                        bold={(section as any).columnStyles?.[2]?.bold || (section as any).contentStyles?.bold}
                        italic={(section as any).columnStyles?.[2]?.italic || (section as any).contentStyles?.italic}
                        underline={(section as any).columnStyles?.[2]?.underline || (section as any).contentStyles?.underline}
                        strikethrough={(section as any).columnStyles?.[2]?.strikethrough || (section as any).contentStyles?.strikethrough}
                        bulletList={(section as any).columnStyles?.[2]?.bulletList || (section as any).contentStyles?.bulletList}
                        numberList={(section as any).columnStyles?.[2]?.numberList || (section as any).contentStyles?.numberList}
                        code={(section as any).columnStyles?.[2]?.code || (section as any).contentStyles?.code}
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

            {(section.shapes && section.shapes.length > 0) || (section.tables && section.tables.length > 0) || ((section as any).texts && (section as any).texts.length > 0) ? (
              <div
                className={isMultiColumn ? "col-span-full relative mt-4 bg-gray-50 rounded" : "relative mt-4 bg-gray-50 rounded"}
                style={{ position: "relative", minHeight: `${canvasHeights[section.id] || 400}px` }}>
                {section.shapes && section.shapes.map((shape, sIndex) => (
                  <ShapeEditor
                    key={`shape-${sIndex}`}
                    id={`shape-${section.id}-${sIndex}`}
                    type={shape.type}
                    width={shape.width}
                    height={shape.height}
                    backgroundColor={shape.backgroundColor}
                    backgroundImage={shape.backgroundImage}
                    backgroundSize={shape.backgroundSize}
                    backgroundOpacity={shape.backgroundOpacity}
                    borderWidth={shape.borderWidth}
                    borderColor={shape.borderColor}
                    borderRadius={shape.borderRadius}
                    top={shape.top}
                    left={shape.left}
                    selected={selectedElementId === `shape-${section.id}-${sIndex}`}
                    onSelect={() =>
                      onSelectElement(`shape-${section.id}-${sIndex}`, "shape")
                    }
                    onUpdate={(updates) =>
                      onUpdateShape?.(section.id, sIndex, updates)
                    }
                  />
                ))}
                {section.tables && section.tables.map((table, tIndex) => (
                  <TableEditor
                    key={`table-${tIndex}`}
                    id={`table-${section.id}-${tIndex}`}
                    rows={table.rows}
                    columns={table.columns}
                    cells={table.cells}
                    borderWidth={table.borderWidth}
                    borderColor={table.borderColor}
                    headerBackground={table.headerBackground}
                    cellBackground={table.cellBackground}
                    textColor={table.textColor}
                    padding={table.padding}
                    width={table.width}
                    height={table.height}
                    top={table.top}
                    left={table.left}
                    selected={selectedElementId === `table-${section.id}-${tIndex}`}
                    onSelect={() =>
                      onSelectElement(`table-${section.id}-${tIndex}`, "table")
                    }
                    onUpdate={(updates) =>
                      onUpdateTable?.(section.id, tIndex, updates)
                    }
                  />
                ))}
                {(section as any).texts && (section as any).texts.map((text: any, tIndex: number) => (
                  <TextEditor
                    key={`text-${tIndex}`}
                    id={`text-${section.id}-${tIndex}`}
                    content={text.content}
                    top={text.top}
                    left={text.left}
                    width={text.width}
                    fontSize={text.fontSize}
                    color={text.color}
                    fontWeight={text.fontWeight}
                    backgroundColor={text.backgroundColor}
                    backgroundOpacity={text.backgroundOpacity}
                    borderColor={text.borderColor}
                    borderWidth={text.borderWidth}
                    borderRadius={text.borderRadius}
                    paddingTop={text.paddingTop}
                    paddingRight={text.paddingRight}
                    paddingBottom={text.paddingBottom}
                    paddingLeft={text.paddingLeft}
                    selected={selectedElementId === `text-${section.id}-${tIndex}`}
                    onSelect={() =>
                      onSelectElement(`text-${section.id}-${tIndex}`, "text")
                    }
                    onUpdate={(updates) =>
                      onUpdateText?.(section.id, tIndex, updates)
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
        })}
      </div>

    </div>
  );
};
