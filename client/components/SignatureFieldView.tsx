import React from "react";

function signatureRoleLabel(purpose?: string): string {
  if (purpose === "creator") return "Creator";
  if (purpose === "reviewer") return "Reviewer";
  if (purpose === "internal_reviewer") return "Internal Reviewer";
  return "Client";
}

function formatSignedAt(value: unknown): string {
  if (value == null || value === "") return "";
  const numeric = typeof value === "number" ? value : Number(value);
  const date = Number.isFinite(numeric) ? new Date(numeric > 1e12 ? numeric : numeric * 1000) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

interface SignatureFieldViewProps {
  field: any;
  sIndex: number;
  onClick?: () => void;
  interactive?: boolean;
}

export const SignatureFieldView: React.FC<SignatureFieldViewProps> = ({
  field,
  sIndex,
  onClick,
  interactive = true,
}) => {
  const isSigned = field.status === "signed" && (field.signature || field.signatureDisplayText);
  const roleLabel = signatureRoleLabel(field.purpose);
  const signedAtLabel = formatSignedAt(field.signedAt ?? field.signed_at);

  return (
    <div
      style={{
        position: "absolute",
        left: `${field.left}px`,
        top: `${field.top}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        borderRadius: field.borderRadius ? `${field.borderRadius}px` : "0px",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        zIndex: 20,
      }}
    >
      {/* Main signature field box */}
      <div
        style={{
          flex: 1,
          borderRadius: field.borderRadius ? `${field.borderRadius}px 0 0 0` : "0px",
          borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
          borderStyle: "dashed",
          borderColor: isSigned ? "#22c55e" : field.borderColor || "#cbd5e1",
          backgroundColor: isSigned ? "#dcfce7" : "#f8fafc",
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          pointerEvents: isSigned ? "none" : interactive ? "auto" : "none",
          cursor: isSigned ? "default" : interactive ? "pointer" : "default",
        }}
        onClick={() => {
          if (!isSigned && interactive && onClick) {
            onClick();
          }
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1f2937", marginBottom: "4px" }}>
          {roleLabel} Signature
        </div>
        {isSigned ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <div
              style={{
                fontFamily: "cursive",
                fontStyle: "italic",
                fontWeight: "bold",
                marginBottom: "6px",
                fontSize: "16px",
                color: "#1f2937",
              }}
            >
              {field.signature}
            </div>
            {field.fullName ? <div style={{ fontSize: "11px", color: "#374151" }}>Name: {field.fullName}</div> : null}
            <div style={{ fontSize: "11px", color: "#374151" }}>Role: {roleLabel}</div>
            {signedAtLabel ? <div style={{ fontSize: "11px", color: "#374151" }}>Signed At: {signedAtLabel}</div> : null}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {field.fullName ? <div style={{ fontSize: "11px", color: "#374151" }}>Name: {field.fullName}</div> : null}
            <div style={{ fontSize: "11px", color: "#374151" }}>Role: {roleLabel}</div>
            <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: 600, color: "#2563eb" }}>Click to Sign</div>
          </div>
        )}
      </div>

      {/* Label section */}
      <div
        style={{
          textAlign: "center",
          padding: "8px",
          backgroundColor: "#f1f5f9",
          borderRadius: field.borderRadius
            ? `0 0 ${field.borderRadius}px ${field.borderRadius}px`
            : "0px",
          borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
          borderTopWidth: "0px",
          borderStyle: "dashed",
          borderColor: isSigned ? "#22c55e" : field.borderColor || "#cbd5e1",
          pointerEvents: isSigned ? "none" : interactive ? "auto" : "none",
          cursor: isSigned ? "default" : interactive ? "pointer" : "default",
        }}
        onClick={() => {
          if (!isSigned && interactive && onClick) {
            onClick();
          }
        }}
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
            : `${roleLabel} Signature`}
        </div>
      </div>
    </div>
  );
};
