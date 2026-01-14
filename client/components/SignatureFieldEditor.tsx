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
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selected || !containerRef.current) return;

      if (isDragging && elementRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
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
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, selected, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return;

    onSelect();
    if (!elementRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    });
    setIsDragging(true);
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
      ref={containerRef}
      className="absolute w-full h-full pointer-events-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={elementRef}
        className={`absolute pointer-events-auto transition-all duration-200 flex flex-col items-center justify-center border-slate-300 bg-slate-50 ${
          selected ? "ring-2 ring-blue-500 ring-offset-1" : ""
        }`}
        style={{
          left: `${field.left}px`,
          top: `${field.top}px`,
          width: `${field.width}px`,
          height: `${field.height}px`,
          borderRadius: field.borderRadius ? `${field.borderRadius}px` : "0px",
          borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
          borderStyle: "dashed",
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: selected ? 1000 : 10,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="text-center pointer-events-none">
          <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-foreground">
            {recipient?.name || "Unknown"}
          </div>
          {recipient?.role && (
            <div className="text-xs text-muted-foreground mt-1">
              {recipient.role}
            </div>
          )}
        </div>

        {selected && (
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
    </div>
  );
};
