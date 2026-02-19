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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const fieldStartRef = useRef({ left: 0, top: 0 });

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on button
    if ((e.target as HTMLElement).closest("button")) {
      e.stopPropagation();
      return;
    }

    // Don't drag if clicking on label area
    if ((e.target as HTMLElement).closest(".signature-label")) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelect();

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    fieldStartRef.current = { left: field.left, top: field.top };
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Update visual position with transform during drag
      setDragOffset({ x: deltaX, y: deltaY });

      // Also update parent state during drag so it persists
      const newLeft = Math.max(0, fieldStartRef.current.left + deltaX);
      const newTop = Math.max(0, fieldStartRef.current.top + deltaY);

      onUpdate({
        left: newLeft,
        top: newTop,
      });
    };

    const handleMouseUp = () => {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onUpdate]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      style={{
        position: "absolute",
        left: `${field.left}px`,
        top: `${field.top}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        backgroundColor: field.status === "signed" ? "#dcfce7" : "#fef2f2",
        border: selected ? "3px solid #2563eb" : "2px solid #ef4444",
        borderRadius: field.borderRadius ? `${field.borderRadius}px` : "4px",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging || selected ? 1000 : 10,
        display: "flex",
        flexDirection: "column",
        boxShadow: selected ? "0 0 0 4px rgba(37, 99, 235, 0.1)" : "none",
        transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : "none",
        transition: isDragging ? "none" : "all 0.2s ease-out",
      }}
    >
      {/* Content area */}
      <div style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {field.status === "signed" && field.signature ? (
          <div>
            <div style={{ fontFamily: "cursive", fontStyle: "italic", fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>
              {field.signature}
            </div>
            {field.fullName && <div style={{ fontSize: "12px" }}>{field.fullName}</div>}
          </div>
        ) : field.fullName ? (
          <div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>{field.fullName}</div>
            {field.position && <div style={{ fontSize: "12px", color: "#666" }}>{field.position}</div>}
          </div>
        ) : (
          <div style={{ color: "#999", fontSize: "12px" }}>Signature {index + 1}</div>
        )}
      </div>

      {/* Label */}
      <div className="signature-label" style={{ padding: "8px", backgroundColor: "#f3f4f6", textAlign: "center", cursor: "pointer", borderTop: "1px solid #d1d5db" }} onClick={(e) => {
        e.stopPropagation();
        onOpenDetails();
      }}>
        <div style={{ fontSize: "11px", fontWeight: "600" }}>
          {field.fullName ? `${field.fullName}${field.position ? ` - ${field.position}` : ""}` : `Signature ${index + 1}`}
        </div>
      </div>

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
            top: "-10px",
            right: "-10px",
            width: "28px",
            height: "28px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "2px solid white",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
