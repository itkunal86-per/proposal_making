import React, { useState, useRef, useEffect, useCallback } from "react";

interface SignatureField {
  id: string | number;
  width: number;
  height: number;
  top: number;
  left: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

interface SignatureFieldEditorProps {
  id: string;
  field: SignatureField;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SignatureField>) => void;
  onDelete: () => void;
}

export const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({
  id,
  field,
  index,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showControls, setShowControls] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Auto-hide controls after 3 seconds if not interacting
  useEffect(() => {
    if (showControls && !selected && !isDragging && !isResizing) {
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showControls, selected, isDragging, isResizing]);

  // Show controls when selected or interacting
  useEffect(() => {
    if (selected || isDragging || isResizing) {
      setShowControls(true);
    }
  }, [selected, isDragging, isResizing]);

  // Find the closest positioned ancestor (position: relative, absolute, or fixed)
  const getPositionedParent = useCallback((): HTMLElement | null => {
    if (!elementRef.current) return null;
    
    let parent = elementRef.current.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const position = style.position;
      
      // If we find a positioned parent or reach the document, return it
      if (position === "relative" || position === "absolute" || position === "fixed") {
        return parent;
      }
      
      parent = parent.parentElement;
    }
    
    return null;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current && !isResizingRef.current) return;
    if (!elementRef.current) return;

    const parent = getPositionedParent();
    if (!parent) return;

    if (isDraggingRef.current) {
      const rect = parent.getBoundingClientRect();
      const newLeft = e.clientX - rect.left - dragOffsetRef.current.x;
      const newTop = e.clientY - rect.top - dragOffsetRef.current.y;

      onUpdate({
        left: Math.max(0, newLeft),
        top: Math.max(0, newTop),
      });
    }

    if (isResizingRef.current) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(100, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(60, resizeStartRef.current.height + deltaY);

      onUpdate({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [onUpdate, getPositionedParent]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Attach event listeners globally when dragging/resizing starts
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't drag if clicking on resize handle or delete button
    if (target.closest(".resize-handle") || target.closest("button")) return;

    onSelect();
    if (!elementRef.current) return;

    const elementRect = elementRef.current.getBoundingClientRect();
    const parent = getPositionedParent();
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    // Calculate offset relative to the positioned parent
    dragOffsetRef.current = {
      x: e.clientX - parentRect.left - field.left,
      y: e.clientY - parentRect.top - field.top,
    };

    setDragOffset(dragOffsetRef.current);
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height,
    };
    
    setResizeStart(resizeStartRef.current);
    isResizingRef.current = true;
    setIsResizing(true);
  };

  return (
    <div
      ref={elementRef}
      className={`absolute pointer-events-auto flex flex-col border-slate-300 bg-slate-50 ${
        !isDragging && !isResizing ? "transition-all duration-200" : ""
      } ${
        selected ? "ring-2 ring-blue-500 ring-offset-1" : ""
      }`}
      style={{
        position: "absolute",
        left: `${field.left}px`,
        top: `${field.top}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        borderRadius: field.borderRadius ? `${field.borderRadius}px` : "0px",
        borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
        borderStyle: "dashed",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging || isResizing ? 10000 : selected ? 1000 : 10,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Signature space */}
      <div className="flex-1 pointer-events-none border-b border-slate-300 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.216 0-2.25 1.034-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h3c1.216 0 2.25-1.034 2.25-2.25m0-1.5c0 1.216 1.034 2.25 2.25 2.25h1.5a2.25 2.25 0 002.25-2.25m-1.5 0V18a2.25 2.25 0 002.25 2.25h.75m0 0V5.25"
          />
        </svg>
      </div>

      {/* Label */}
      <div className="text-center pointer-events-none p-2">
        <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-foreground">
          Signature {index + 1}
        </div>
      </div>

      {showControls && (
        <>
          {/* Resize handle */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
            style={{
              transform: "translate(50%, 50%)",
            }}
            onMouseDown={handleResizeMouseDown}
          />

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-6 -right-6 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 pointer-events-auto"
            title="Delete signature"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};
