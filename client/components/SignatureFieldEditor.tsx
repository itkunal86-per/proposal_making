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
  status?: "pending" | "signed" | "declined";
  fullName?: string;
  email?: string;
  position?: string;
  signature?: string;
  signatureDisplayText?: string;
  signedAt?: number;
}

interface SignatureFieldEditorProps {
  id: string;
  field: SignatureField;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SignatureField>) => void;
  onDelete: () => void;
  onOpenDetails: () => void;
}

export const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({
  id,
  field,
  index,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onOpenDetails,
}) => {

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const selectedRef = useRef(selected);

  // Keep selectedRef in sync
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Reset dragging/resizing state and clear transform when signature is deselected
  useEffect(() => {
    if (!selected && (isDragging || isResizing)) {
      isDraggingRef.current = false;
      isResizingRef.current = false;
      setIsDragging(false);
      setIsResizing(false);
      // Clear transform immediately to prevent visual lag
      if (elementRef.current) {
        elementRef.current.style.transform = "";
      }
    }
  }, [selected, isDragging, isResizing]);

  // Clear transform when drag ends
  useEffect(() => {
    if (!isDragging && elementRef.current) {
      elementRef.current.style.transform = "";
    }
  }, [isDragging]);


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
    // Only process events if this instance is actually dragging or resizing
    if (!isDraggingRef.current && !isResizingRef.current) return;
    if (!elementRef.current) return;

    // Double-check: stop if this signature is no longer selected
    // This prevents interference between multiple signatures
    if (!selectedRef.current) {
      isDraggingRef.current = false;
      isResizingRef.current = false;
      return;
    }

    const parent = getPositionedParent();
    if (!parent) return;

    // Prevent default to avoid text selection while dragging
    e.preventDefault();
    e.stopPropagation();

    if (isDraggingRef.current) {
      const rect = parent.getBoundingClientRect();
      const newLeft = Math.max(0, e.clientX - rect.left - dragOffsetRef.current.x);
      const newTop = Math.max(0, e.clientY - rect.top - dragOffsetRef.current.y);

      // Update ref for instant visual feedback using transform
      const deltaX = newLeft - field.left;
      const deltaY = newTop - field.top;

      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }

      // Call onUpdate to persist to parent state (will update when batched)
      onUpdate({
        left: newLeft,
        top: newTop,
      });
    }

    if (isResizingRef.current) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(100, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(60, resizeStartRef.current.height + deltaY);

      // Call onUpdate to persist to parent state
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

    // Don't drag if clicking on resize handle or any button
    if (target.closest(".resize-handle") || target.closest("button")) {
      e.stopPropagation();
      return;
    }

    // Don't drag if clicking on the editable signature space (label area)
    if (target.closest(".signature-label")) {
      e.stopPropagation();
      return;
    }

    // Allow drag from anywhere else on the signature field
    e.stopPropagation();
    e.preventDefault();

    onSelect();
    if (!elementRef.current) return;

    const parent = getPositionedParent();
    if (!parent) {
      console.warn("Could not find positioned parent for signature dragging");
      return;
    }

    const parentRect = parent.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    // Calculate offset relative to the positioned parent, accounting for any transforms
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
        borderColor: field.status === "signed" ? "#22c55e" : field.borderColor || "#d1d5db",
        backgroundColor: field.status === "signed" ? "#dcfce7" : "#f1f5f9",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging || isResizing ? 2147483647 : selected ? 1000 : 10,
        visibility: "visible",
        display: "flex",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Signature space */}
      <div
        className="flex-1 pointer-events-auto border-b border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors p-3 overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
        title="Click to edit signature details"
      >
        {field.status === "signed" && field.signatureDisplayText ? (
          <div className="text-center w-full px-1">
            {/* Signature Name */}
            <div
              className="text-lg font-bold text-slate-800 mb-1 break-words"
              style={{
                fontFamily: "cursive",
                fontStyle: "italic",
                fontWeight: "bold",
              }}
            >
              {field.signature}
            </div>
            {/* Signature Metadata */}
            <div className="text-xs text-slate-600 whitespace-pre-wrap leading-tight break-words">
              {field.signatureDisplayText?.replace(/\\n/g, '\n')}
            </div>
            {/* Optional: Show position if available */}
            {field.position && (
              <div className="text-xs text-slate-500 mt-1 italic">
                {field.position}
              </div>
            )}
          </div>
        ) : field.fullName ? (
          <div className="text-center px-2">
            <div className="text-sm font-semibold text-slate-700 break-words">{field.signature || field.fullName}</div>
            {field.position && (
              <div className="text-xs text-muted-foreground mt-1">{field.position}</div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center text-slate-300">
            <svg
              className="w-8 h-8"
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
        )}
      </div>

      {/* Label */}
      <div className="signature-label text-center pointer-events-auto p-2 bg-slate-100 select-none" style={{ cursor: "grab" }}>
        <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-300 text-slate-800">
          {field.fullName ? `${field.fullName}${field.position ? ` - ${field.position}` : ""}` : `Signature ${index + 1}`}
        </div>
      </div>

      {/* Resize handle - always visible when selected */}
      {selected && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
          style={{
            transform: "translate(50%, 50%)",
          }}
          onMouseDown={handleResizeMouseDown}
          title="Resize signature"
        />
      )}

      {/* Delete button - always visible when selected */}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 transition-colors pointer-events-auto z-50"
          style={{
            transform: "translate(50%, -50%)",
          }}
          title="Delete signature"
        >
          ✕
        </button>
      )}
    </div>
  );
};
