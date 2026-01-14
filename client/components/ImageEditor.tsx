import React, { useState, useRef } from "react";
import { ImageElement } from "@/components/ImageElement";

interface ImageEditorProps {
  id: string;
  url: string;
  width: number;
  height: number;
  opacity?: string;
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

export const ImageEditor: React.FC<ImageEditorProps> = ({
  id,
  url,
  width,
  height,
  opacity,
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
          newLeft = Math.max(0, initialPos.left + deltaX);
        }
        if (isResizing.includes("s")) {
          newHeight = Math.max(30, initialSize.height + deltaY);
        }
        if (isResizing.includes("n")) {
          newHeight = Math.max(30, initialSize.height - deltaY);
          newTop = Math.max(0, initialPos.top + deltaY);
        }

        onUpdate({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          left: Math.round(newLeft),
          top: Math.round(newTop),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [selected, isDragging, isResizing, dragStart, initialPos, initialSize, onUpdate]);

  if (!selected) {
    return (
      <ImageElement
        id={id}
        url={url}
        width={width}
        height={height}
        opacity={opacity}
        borderWidth={borderWidth}
        borderColor={borderColor}
        borderRadius={borderRadius}
        top={top}
        left={left}
        selected={false}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => handleMouseDown(e, null)}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: selected ? 20 : 1,
      }}
    >
      <ImageElement
        id={id}
        url={url}
        width={width}
        height={height}
        opacity={opacity}
        borderWidth={borderWidth}
        borderColor={borderColor}
        borderRadius={borderRadius}
        top={0}
        left={0}
        selected={selected}
        onSelect={onSelect}
      />

      {/* Resize Handles */}
      {selected && (
        <>
          {/* Top-left */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "nw")}
            style={{
              position: "absolute",
              top: "-4px",
              left: "-4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "nwse-resize",
            }}
          />
          {/* Top */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "n")}
            style={{
              position: "absolute",
              top: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "ns-resize",
            }}
          />
          {/* Top-right */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "ne")}
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "nesw-resize",
            }}
          />
          {/* Right */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "e")}
            style={{
              position: "absolute",
              top: "50%",
              right: "-4px",
              transform: "translateY(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "ew-resize",
            }}
          />
          {/* Bottom-right */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "se")}
            style={{
              position: "absolute",
              bottom: "-4px",
              right: "-4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "sesw-resize",
            }}
          />
          {/* Bottom */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "s")}
            style={{
              position: "absolute",
              bottom: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "ns-resize",
            }}
          />
          {/* Bottom-left */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "sw")}
            style={{
              position: "absolute",
              bottom: "-4px",
              left: "-4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "nesw-resize",
            }}
          />
          {/* Left */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "w")}
            style={{
              position: "absolute",
              top: "50%",
              left: "-4px",
              transform: "translateY(-50%)",
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              cursor: "ew-resize",
            }}
          />
        </>
      )}
    </div>
  );
};
