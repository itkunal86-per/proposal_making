import React, { useState, useRef, useEffect } from "react";

interface TextEditorProps {
  id: string;
  content: string;
  top: number;
  left: number;
  width: number;
  height?: number;
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
    height?: number;
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
    lineHeight?: string;
  }) => void;
  fullWidth?: boolean;
  parentWidth?: number;
  sectionPaddingLeft?: number;
  sectionPaddingRight?: number;
  lineHeight?: string;
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
  height = 100,
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
  fullWidth = false,
  parentWidth,
  sectionPaddingLeft = 12,
  sectionPaddingRight = 12,
  lineHeight = "1.5",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ top, left });
  const [initialSize, setInitialSize] = useState({ width, height });
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Calculate actual width based on fullWidth mode
  const actualWidth = fullWidth && parentWidth
    ? parentWidth - sectionPaddingLeft - sectionPaddingRight
    : width;
  const actualLeft = fullWidth ? sectionPaddingLeft : left;

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
      setInitialSize({ width, height });
      setInitialPos({ top, left });
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
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
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
        const deltaY = e.clientY - dragStart.y;
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newLeft = initialPos.left;
        let newTop = initialPos.top;

        // Handle horizontal resizing
        if (isResizing.includes("e")) {
          newWidth = Math.max(50, initialSize.width + deltaX);
        }
        if (isResizing.includes("w")) {
          newWidth = Math.max(50, initialSize.width - deltaX);
          newLeft = initialPos.left + deltaX;
        }

        // Handle vertical resizing
        if (isResizing.includes("s")) {
          newHeight = Math.max(40, initialSize.height + deltaY);
        }
        if (isResizing.includes("n")) {
          newHeight = Math.max(40, initialSize.height - deltaY);
          newTop = initialPos.top + deltaY;
        }

        onUpdate({
          width: newWidth,
          height: newHeight,
          left: newLeft,
          top: newTop,
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
  }, [isDragging, isResizing, dragStart, initialPos, initialSize, onUpdate]);

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

  const handleDragStart = (e: React.DragEvent) => {
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  return (
    <div
      ref={containerRef}
      draggable="false"
      style={{
        position: "absolute",
        left: `${actualLeft}px`,
        top: `${top}px`,
        width: `${actualWidth}px`,
        height: `${height}px`,
        cursor: isDragging ? "grabbing" : "grab",
        pointerEvents: "auto",
        zIndex: selected ? 1000 : 10,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitUserDrag: "none",
      }}
      onMouseDown={(e) => handleMouseDown(e, null)}
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
    >

      <style>{`
        [data-text-editor] ul {
          list-style-type: disc;
          margin-left: 20px;
        }
        [data-text-editor] ol {
          list-style-type: decimal;
          margin-left: 20px;
        }
        [data-text-editor] li {
          margin: 4px 0;
        }
        [data-text-editor] b,
        [data-text-editor] strong {
          font-weight: bold;
        }
        [data-text-editor] i,
        [data-text-editor] em {
          font-style: italic;
        }
        [data-text-editor] u {
          text-decoration: underline;
        }
      `}</style>
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
        }}
      >
        {backgroundColor && backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: backgroundColor,
              opacity: parseInt(backgroundOpacity || "100") / 100,
              borderRadius: `${borderRadius}px`,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}
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
          dir="ltr"
          data-text-editor="true"
          style={{
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius: `${borderRadius}px`,
            backgroundColor: "transparent",
            opacity: 1,
            cursor: isEditing ? "text" : "grab",
            height: "100%",
            width: "100%",
            boxSizing: "border-box",
            wordWrap: "break-word",
            fontSize: `${fontSize}px`,
            color: color,
            fontWeight: fontWeight ? "bold" : "normal",
            outline: isEditing ? "2px solid #3b82f6" : "none",
            outlineOffset: "-2px",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            position: "relative",
            zIndex: 1,
          }}
        >
          {!content && !isEditing && "Click to edit..."}
        </div>
      </div>

      {selected && !isEditing && (
        <>
          <ResizeHandle handle="nw" position={{ left: "-5px", top: "-5px" }} />
          <ResizeHandle handle="n" position={{ left: "50%", top: "-5px", transform: "translateX(-50%)" }} />
          <ResizeHandle handle="ne" position={{ right: "-5px", top: "-5px" }} />
          <ResizeHandle handle="w" position={{ left: "-5px", top: "50%", transform: "translateY(-50%)" }} />
          <ResizeHandle handle="e" position={{ right: "-5px", top: "50%", transform: "translateY(-50%)" }} />
          <ResizeHandle handle="sw" position={{ left: "-5px", bottom: "-5px" }} />
          <ResizeHandle handle="s" position={{ left: "50%", bottom: "-5px", transform: "translateX(-50%)" }} />
          <ResizeHandle handle="se" position={{ right: "-5px", bottom: "-5px" }} />
        </>
      )}
    </div>
  );
};
