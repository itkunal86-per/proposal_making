import React from "react";

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
  const isSigned = field.status === "signed" && field.signatureDisplayText;

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
        {isSigned ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "cursive",
                fontStyle: "italic",
                fontWeight: "bold",
                marginBottom: "4px",
                fontSize: "16px",
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
              {field.signatureDisplayText?.replace(/\\n/g, '\n')}
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
        ) : (
          <div style={{ flex: 1, borderBottom: "1px solid #cbd5e1" }} />
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
            : `Signature ${sIndex + 1}`}
        </div>
      </div>
    </div>
  );
};
