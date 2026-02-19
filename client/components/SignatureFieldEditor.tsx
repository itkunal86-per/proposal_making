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
  const elementRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // If clicking on button or resize handle, don't drag
    if (target.tagName === "BUTTON" || target.closest("button") || target.closest(".resize-handle")) {
      return;
    }

    // If clicking on the edit area, don't drag
    if (target.closest('[title="Click to edit signature details"]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    onSelect();

    if (!elementRef.current) return;

    // Find the positioned parent
    let parent = elementRef.current.parentElement;
    while (parent) {
      const pos = window.getComputedStyle(parent).position;
      if (pos === "relative" || pos === "absolute" || pos === "fixed") {
        break;
      }
      parent = parent.parentElement;
    }

    if (!parent) {
      console.warn("No positioned parent found");
      return;
    }

    const parentRect = parent.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - parentRect.left - field.left,
      y: e.clientY - parentRect.top - field.top,
    };

    isDraggingRef.current = true;
    setIsDragging(true);
  }, [field.left, field.top, onSelect]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect();

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height,
    };

    isResizingRef.current = true;
    setIsResizing(true);
  }, [field.width, field.height, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current && !isResizingRef.current) return;
    if (!elementRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    if (isDraggingRef.current) {
      let parent = elementRef.current.parentElement;
      while (parent) {
        const pos = window.getComputedStyle(parent).position;
        if (pos === "relative" || pos === "absolute" || pos === "fixed") {
          break;
        }
        parent = parent.parentElement;
      }

      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const newLeft = Math.max(0, e.clientX - parentRect.left - dragOffsetRef.current.x);
      const newTop = Math.max(0, e.clientY - parentRect.top - dragOffsetRef.current.y);

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

      onUpdate({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [onUpdate]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    setIsDragging(false);
    setIsResizing(false);
  }, []);

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

  return (
    <div
      ref={elementRef}
      className={`absolute flex flex-col ${selected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
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
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Signature space - non-interactive background */}
      <div
        style={{
          flex: 1,
          borderBottom: "1px solid #cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {field.status === "signed" && field.signatureDisplayText ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "4px",
                fontFamily: "cursive",
                fontStyle: "italic",
                color: "#1f2937",
              }}
            >
              {field.signature}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#4b5563",
                whiteSpace: "pre-wrap",
                lineHeight: "1.3",
              }}
            >
              {field.signatureDisplayText?.replace(/\\n/g, "\n")}
            </div>
            {field.position && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                {field.position}
              </div>
            )}
          </div>
        ) : field.fullName ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
              {field.signature || field.fullName}
            </div>
            {field.position && (
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                {field.position}
              </div>
            )}
          </div>
        ) : (
          <svg
            style={{ width: "32px", height: "32px", color: "#cbd5e1" }}
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
        )}
      </div>

      {/* Editable area - clickable */}
      <div
        style={{
          textAlign: "center",
          padding: "8px",
          backgroundColor: "#f1f5f9",
          cursor: "pointer",
          pointerEvents: "auto",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
        title="Click to edit signature details"
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            padding: "4px 8px",
            backgroundColor: "#cbd5e1",
            borderRadius: "4px",
            color: "#1f2937",
          }}
        >
          {field.fullName
            ? `${field.fullName}${field.position ? ` - ${field.position}` : ""}`
            : `Signature ${index + 1}`}
        </div>
      </div>

      {/* Resize handle */}
      {selected && (
        <div
          className="resize-handle"
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            width: "12px",
            height: "12px",
            backgroundColor: "#3b82f6",
            borderRadius: "50%",
            cursor: "nwse-resize",
            pointerEvents: "auto",
          }}
          onMouseDown={handleResizeMouseDown}
          title="Resize signature"
        />
      )}

      {/* Delete button */}
      {selected && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "24px",
            height: "24px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            pointerEvents: "auto",
            zIndex: 50,
            padding: 0,
          }}
          title="Delete signature"
        >
          ✕
        </button>
      )}
    </div>
  );
};
