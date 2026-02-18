import React, { useState, useRef, useEffect } from "react";
import { SignatureField, SignatureRecipient } from "@/services/proposalsService";

interface SignatureFieldEditorProps {
  id: string;
  field: SignatureField;
  recipient: SignatureRecipient | undefined;
  selected: boolean;
  isDraggingThis?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onSelect: () => void;
  onUpdate: (updates: Partial<SignatureField>) => void;
  onDelete: () => void;
}

export const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({
  id,
  field,
  recipient,
  selected,
  isDraggingThis = false,
  onDragStart,
  onDragEnd,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Show controls for newly placed fields (id === 0), when selected, or when dragging
  const isNewField = field.id === 0;
  const shouldShowControls = selected || isNewField || isDragging || isResizing;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && elementRef.current) {
        const parent = elementRef.current.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const newLeft = e.clientX - rect.left - dragOffset.x;
        const newTop = e.clientY - rect.top - dragOffset.y;

        onUpdate({
          left: Math.max(0, newLeft),
          top: Math.max(0, newTop),
        });
      }

      if (isResizing && elementRef.current) {
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
      onDragEnd?.();
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, onUpdate, onDragEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't drag if clicking on resize handle or delete button
    if (target.closest(".resize-handle") || target.closest("button")) return;

    onSelect();
    if (!elementRef.current) return;

    const elementRect = elementRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    });
    setIsDragging(true);
    onDragStart?.();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        zIndex: isDraggingThis ? 10000 : selected || isDragging || isResizing ? 1000 : 10,
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
