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
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Never drag if on a button
    if (target.closest("button")) {
      return;
    }

    // Never drag if on the edit area
    const editArea = target.closest('[data-edit-area="true"]');
    if (editArea) {
      return;
    }

    // Start drag
    e.preventDefault();
    e.stopPropagation();

    onSelect();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !elementRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newLeft = Math.max(0, field.left + deltaX);
      const newTop = Math.max(0, field.top + deltaY);

      onUpdate({
        left: newLeft,
        top: newTop,
      });

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [isDragging, field.left, field.top, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    setIsResizing(true);
  };

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !elementRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newWidth = Math.max(100, field.width + deltaX);
      const newHeight = Math.max(60, field.height + deltaY);

      onUpdate({
        width: newWidth,
        height: newHeight,
      });

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [isResizing, field.width, field.height, onUpdate]
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleResizeMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleResizeMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
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
        zIndex: isDragging || isResizing ? 999999 : selected ? 1000 : 10,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        outline: selected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      }}
    >
      {/* Main content area - not clickable for drag */}
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

      {/* Edit area - clickable but not draggable */}
      <div
        data-edit-area="true"
        style={{
          textAlign: "center",
          padding: "8px",
          backgroundColor: "#f1f5f9",
          cursor: "pointer",
          pointerEvents: "auto",
          borderRadius: field.borderRadius
            ? `0 0 ${field.borderRadius}px ${field.borderRadius}px`
            : "0px",
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

      {/* Resize handle - visible when selected */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            right: "-6px",
            width: "16px",
            height: "16px",
            backgroundColor: "#3b82f6",
            borderRadius: "50%",
            cursor: "nwse-resize",
            pointerEvents: "auto",
            border: "2px solid white",
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          }}
          onMouseDown={handleResizeMouseDown}
          title="Resize signature"
        />
      )}

      {/* Delete button - visible when selected */}
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
            width: "28px",
            height: "28px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "2px solid white",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            pointerEvents: "auto",
            zIndex: 50,
            padding: 0,
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          }}
          title="Delete signature"
        >
          ✕
        </button>
      )}
    </div>
  );
};
