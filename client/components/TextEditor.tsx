import React, { useState, useRef } from "react";

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

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") {
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
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

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
        style={{
          padding: "8px",
          border: selected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
          borderRadius: "4px",
          backgroundColor: "white",
          cursor: isEditing ? "text" : "grab",
          minHeight: "40px",
          wordWrap: "break-word",
          fontSize: `${fontSize}px`,
          color: color,
          fontWeight: fontWeight ? "bold" : "normal",
        }}
      >
        {isEditing ? (
          <textarea
            ref={textInputRef}
            value={content}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              minHeight: "40px",
              border: "none",
              outline: "none",
              padding: "4px",
              fontSize: `${fontSize}px`,
              color: color,
              fontWeight: fontWeight ? "bold" : "normal",
              fontFamily: "inherit",
              resize: "none",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: `${fontSize}px`,
              color: color,
              fontWeight: fontWeight ? "bold" : "normal",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {content || "Click to edit..."}
          </div>
        )}
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
