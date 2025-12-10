import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

interface TextEditorProps {
  id: string;
  content: string;
  top: number;
  left: number;
  width: number;
  fontSize?: string;
  color?: string;
  fontWeight?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: {
    content?: string;
    top?: number;
    left?: number;
    width?: number;
    fontSize?: string;
    color?: string;
    fontWeight?: boolean;
    backgroundColor?: string;
    backgroundOpacity?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
  }) => void;
}

type ResizeHandle =
  | "nw" | "n" | "ne"
  | "w" | "e"
  | "sw" | "s" | "se"
  | null;

export const TextEditor: React.FC<TextEditorProps> = ({
  id,
  content,
  top,
  left,
  width,
  fontSize = "16",
  color = "#000000",
  fontWeight = false,
  backgroundColor = "transparent",
  backgroundOpacity = "100",
  borderColor = "#000000",
  borderWidth = "0",
  borderRadius = "0",
  paddingTop = "8",
  paddingRight = "8",
  paddingBottom = "8",
  paddingLeft = "8",
  selected,
  onSelect,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ top, left });
  const [initialSize, setInitialSize] = useState({ width });
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    const target = e.target as HTMLElement;
    if (isEditing && editorRef.current?.contains(target)) {
      return;
    }

    e.stopPropagation();
    onSelect();

    if (handle) {
      setIsResizing(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialSize({ width });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPos({ top, left });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (editorRef.current) {
      const isEditorFocused = document.activeElement === editorRef.current;
      const currentInnerHTML = editorRef.current.innerHTML;
      const newValue = content || "";

      if (!isInitializedRef.current || !isEditorFocused) {
        if (currentInnerHTML !== newValue) {
          editorRef.current.innerHTML = newValue;
        }
      }

      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }
    }
  }, [content]);

  React.useEffect(() => {
    if (!selected) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        onUpdate({
          left: Math.max(0, initialPos.left + deltaX),
          top: Math.max(0, initialPos.top + deltaY),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        let newWidth = initialSize.width;
        let newLeft = initialPos.left;

        if (isResizing.includes("e")) {
          newWidth = Math.max(50, initialSize.width + deltaX);
        }
        if (isResizing.includes("w")) {
          newWidth = Math.max(50, initialSize.width - deltaX);
          newLeft = initialPos.left + deltaX;
        }

        onUpdate({
          width: newWidth,
          left: newLeft,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, initialPos, initialSize, selected, onUpdate]);

  const getCursorForHandle = (handle: ResizeHandle): string => {
    if (!handle) return "grab";
    if (handle === "nw" || handle === "se") return "nwse-resize";
    if (handle === "ne" || handle === "sw") return "nesw-resize";
    if (handle === "n" || handle === "s") return "ns-resize";
    if (handle === "e" || handle === "w") return "ew-resize";
    return "grab";
  };

  const ResizeHandle: React.FC<{ handle: ResizeHandle; position: React.CSSProperties }> = ({
    handle,
    position,
  }) => (
    <div
      onMouseDown={(e) => handleMouseDown(e, handle)}
      style={{
        position: "absolute",
        ...position,
        width: "10px",
        height: "10px",
        backgroundColor: selected ? "#3b82f6" : "transparent",
        border: selected ? "2px solid white" : "none",
        cursor: getCursorForHandle(handle),
        zIndex: 10,
      }}
    />
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        cursor: isDragging ? "grabbing" : "grab",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => handleMouseDown(e, null)}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onMouseDown={(e) => {
          if (isEditing) {
            e.stopPropagation();
          }
        }}
        data-testid="rich-text-editor"
        style={{
          padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: `${borderRadius}px`,
          backgroundColor: backgroundColor,
          opacity: parseInt(backgroundOpacity || "100") / 100,
          cursor: isEditing ? "text" : "grab",
          minHeight: "40px",
          wordWrap: "break-word",
          fontSize: `${fontSize}px`,
          color: color,
          fontWeight: fontWeight ? "bold" : "normal",
          outline: isEditing ? "2px solid #3b82f6" : "none",
          outlineOffset: "-2px",
        }}
      >
        {!content && !isEditing && "Click to edit..."}
      </div>

      {selected && !isEditing && (
        <>
          <ResizeHandle handle="w" position={{ left: "-5px", top: "50%", transform: "translateY(-50%)" }} />
          <ResizeHandle handle="e" position={{ right: "-5px", top: "50%", transform: "translateY(-50%)" }} />
        </>
      )}
    </div>
  );
};
