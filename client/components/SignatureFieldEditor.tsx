import React, { useState, useRef, useEffect } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep callback refs to avoid recreating listeners on parent re-renders
  const onUpdateRef = useRef(onUpdate);
  const onSelectRef = useRef(onSelect);
  
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

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
    onSelectRef.current();

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: field.left,
      startTop: field.top,
    };

    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;

      const newLeft = Math.max(0, dragStateRef.current.startLeft + deltaX);
      const newTop = Math.max(0, dragStateRef.current.startTop + deltaY);

      // Update parent with new position immediately
      onUpdateRef.current({
        left: newLeft,
        top: newTop,
      });
    };

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false;
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]); // Only depend on isDragging, not callbacks

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
        transition: isDragging ? "none" : "all 0.2s ease-out",
      }}
    >
      {/* Content area */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {field.status === "signed" && field.signature ? (
          <div>
            <div
              style={{
                fontFamily: "cursive",
                fontStyle: "italic",
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              {field.signature}
            </div>
            {field.fullName && <div style={{ fontSize: "12px" }}>{field.fullName}</div>}
          </div>
        ) : field.fullName ? (
          <div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>{field.fullName}</div>
            {field.position && (
              <div style={{ fontSize: "12px", color: "#666" }}>{field.position}</div>
            )}
          </div>
        ) : (
          <div style={{ color: "#999", fontSize: "12px" }}>Signature {index + 1}</div>
        )}
      </div>

      {/* Label */}
      <div
        className="signature-label"
        style={{
          padding: "8px",
          backgroundColor: "#f3f4f6",
          textAlign: "center",
          cursor: "pointer",
          borderTop: "1px solid #d1d5db",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "600" }}>
          {field.fullName
            ? `${field.fullName}${field.position ? ` - ${field.position}` : ""}`
            : `Signature ${index + 1}`}
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
