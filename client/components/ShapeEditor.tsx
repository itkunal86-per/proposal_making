import React, { useState, useRef } from "react";
import { ShapeElement } from "@/components/ShapeElement";

interface ShapeEditorProps {
  id: string;
  type: "square" | "circle" | "triangle";
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  top: number;
  left: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: {
    width?: number;
    height?: number;
    top?: number;
    left?: number;
  }) => void;
}

type ResizeHandle =
  | "nw" | "n" | "ne"
  | "w" | "e"
  | "sw" | "s" | "se"
  | null;

export const ShapeEditor: React.FC<ShapeEditorProps> = ({
  id,
  type,
  width,
  height,
  backgroundColor,
  backgroundImage,
  backgroundSize,
  backgroundOpacity,
  borderWidth,
  borderColor,
  borderRadius,
  top,
  left,
  selected,
  onSelect,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ top, left });
  const [initialSize, setInitialSize] = useState({ width, height });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    e.stopPropagation();
    onSelect();

    if (handle) {
      // Resize mode
      setIsResizing(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialSize({ width, height });
    } else {
      // Drag mode
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPos({ top, left });
    }
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
        const deltaY = e.clientY - dragStart.y;
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newLeft = initialPos.left;
        let newTop = initialPos.top;

        // Handle resize based on which corner/edge is being dragged
        if (isResizing.includes("e")) {
          newWidth = Math.max(30, initialSize.width + deltaX);
        }
        if (isResizing.includes("w")) {
          newWidth = Math.max(30, initialSize.width - deltaX);
          newLeft = initialPos.left + deltaX;
        }
        if (isResizing.includes("s")) {
          newHeight = Math.max(30, initialSize.height + deltaY);
        }
        if (isResizing.includes("n")) {
          newHeight = Math.max(30, initialSize.height - deltaY);
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
        height: `${height}px`,
        cursor: isDragging ? "grabbing" : "grab",
        pointerEvents: "auto",
        zIndex: selected ? 1000 : 10,
      }}
      onMouseDown={(e) => handleMouseDown(e, null)}
    >
      <ShapeElement
        id={id}
        type={type}
        width={width}
        height={height}
        backgroundColor={backgroundColor}
        backgroundImage={backgroundImage}
        backgroundSize={backgroundSize}
        backgroundOpacity={backgroundOpacity}
        borderWidth={borderWidth}
        borderColor={borderColor}
        borderRadius={borderRadius}
        selected={selected}
        onSelect={onSelect}
      />

      {selected && (
        <>
          {/* Corner handles */}
          <ResizeHandle handle="nw" position={{ top: "-5px", left: "-5px" }} />
          <ResizeHandle handle="ne" position={{ top: "-5px", right: "-5px" }} />
          <ResizeHandle handle="sw" position={{ bottom: "-5px", left: "-5px" }} />
          <ResizeHandle handle="se" position={{ bottom: "-5px", right: "-5px" }} />

          {/* Edge handles */}
          <ResizeHandle handle="n" position={{ top: "-5px", left: "50%", transform: "translateX(-50%)" }} />
          <ResizeHandle handle="s" position={{ bottom: "-5px", left: "50%", transform: "translateX(-50%)" }} />
          <ResizeHandle handle="w" position={{ left: "-5px", top: "50%", transform: "translateY(-50%)" }} />
          <ResizeHandle handle="e" position={{ right: "-5px", top: "50%", transform: "translateY(-50%)" }} />
        </>
      )}
    </div>
  );
};
