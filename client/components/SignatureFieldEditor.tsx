import React, { useState, useRef, useEffect } from "react";
import { SignatureField, SignatureRecipient } from "@/services/proposalsService";

interface SignatureFieldEditorProps {
  id: string;
  field: SignatureField;
  recipient: SignatureRecipient | undefined;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SignatureField>) => void;
  onDelete: () => void;
}

export const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({
  id,
  field,
  recipient,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showControlsTemporarily, setShowControlsTemporarily] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const hasBeenInteractedRef = useRef(false);

  // Keep controls visible for 3 seconds after placement, or when selected/dragging/resizing
  useEffect(() => {
    if (showControlsTemporarily && !hasBeenInteractedRef.current) {
      const timer = setTimeout(() => {
        setShowControlsTemporarily(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControlsTemporarily]);

  // Show controls when selected, dragging, resizing, or temporarily after placement
  const shouldShowControls = selected || isDragging || isResizing || showControlsTemporarily;

  // Update refs whenever state changes
  useEffect(() => {
    isDraggingRef.current = isDragging;
    isResizingRef.current = isResizing;
  }, [isDragging, isResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current && !isResizingRef.current) return;
      if (!elementRef.current) return;

      const parent = elementRef.current.parentElement;
      if (!parent) return;

      if (isDraggingRef.current) {
        const rect = parent.getBoundingClientRect();
        const newLeft = e.clientX - rect.left - dragOffset.x;
        const newTop = e.clientY - rect.top - dragOffset.y;

        onUpdate({
          left: Math.max(0, newLeft),
          top: Math.max(0, newTop),
        });
      }

      if (isResizingRef.current) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(100, resizeStart.width + deltaX);
        const newHeight = Math.max(60, resizeStart.height + deltaY);

        onUpdate({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    // Only attach listeners once when component mounts
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragOffset, resizeStart, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't drag if clicking on resize handle or delete button
    if (target.closest(".resize-handle") || target.closest("button")) return;

    hasBeenInteractedRef.current = true;
    onSelect();
    if (!elementRef.current) return;

    const elementRect = elementRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    hasBeenInteractedRef.current = true;
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height,
    });
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
      <div className="flex-1 pointer-events-none border-b border-slate-300" />

      {/* Name and role info */}
      <div className="text-center pointer-events-none p-2">
        <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-foreground">
          {recipient?.name || "Unknown"}
        </div>
        {recipient?.role && (
          <div className="text-xs text-muted-foreground mt-1">
            {recipient.role}
          </div>
        )}
      </div>

      {shouldShowControls && (
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
            title="Delete signature field"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};
