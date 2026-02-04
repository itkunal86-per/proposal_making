import React from "react";
import { ProposalJsonData, ThemeJsonData } from "@shared/api";

interface ProposalJsonRendererProps {
  proposalJson: ProposalJsonData;
  themeJson: ThemeJsonData;
}

export const ProposalJsonRenderer: React.FC<ProposalJsonRendererProps> = ({
  proposalJson,
  themeJson,
}) => {
  // Validates and returns theme data safely
  const theme = themeJson;

  // Helper function to get typography style based on text type
  const getTextStyle = (
    type: "heading" | "paragraph" | "listItem",
    level?: string
  ): React.CSSProperties => {
    if (type === "heading" && level) {
      const headingKey = level as keyof typeof theme.typography.heading;
      const headingStyle = theme.typography.heading[headingKey];
      if (!headingStyle) {
        // Fallback for headings not defined in theme
        return {
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: 1.2,
          color: theme.colors.textPrimary,
          marginBottom: "15px",
          fontFamily: theme.fonts.primary,
          marginTop: "0px",
        };
      }
      return {
        fontSize: `${headingStyle.fontSize}px`,
        fontWeight: headingStyle.fontWeight,
        lineHeight: headingStyle.lineHeight,
        color: headingStyle.color,
        marginBottom: `${headingStyle.marginBottom}px`,
        textTransform: (headingStyle.textTransform as any) || "none",
        fontFamily: theme.fonts.primary,
        marginTop: "0px",
      };
    }

    if (type === "paragraph") {
      return {
        fontSize: `${theme.typography.paragraph.fontSize}px`,
        fontWeight: theme.typography.paragraph.fontWeight,
        lineHeight: theme.typography.paragraph.lineHeight,
        color: theme.typography.paragraph.color,
        fontFamily: theme.fonts.primary,
        marginBottom: "1rem",
        marginTop: "0px",
      };
    }

    if (type === "listItem" && theme.typography.listItem) {
      return {
        fontSize: `${theme.typography.listItem.fontSize}px`,
        fontWeight: theme.typography.listItem.fontWeight,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.primary,
        display: "flex",
        alignItems: "flex-start",
        gap: `${theme.typography.listItem.gap}px`,
        marginBottom: "0.5rem",
        textTransform: (theme.typography.listItem.textTransform as any) || "none",
      };
    }

    return {
      fontFamily: theme.fonts.primary,
    };
  };

  // Render text content
  const renderTextContent = (text: any) => {
    const style = getTextStyle(text.type, text.level);

    if (text.type === "heading") {
      const HeadingTag = (text.level || "h3") as any;
      return (
        <HeadingTag key={text.id} style={style}>
          {text.content}
        </HeadingTag>
      );
    }

    if (text.type === "paragraph") {
      return (
        <p key={text.id} style={{ ...style, marginBottom: "1rem" }}>
          {text.content}
        </p>
      );
    }

    if (text.type === "listItem") {
      return (
        <div key={text.id} style={style}>
          <span style={{ color: themeJson.typography.listItem?.iconColor }}>
            ✓
          </span>
          <span>{text.content}</span>
        </div>
      );
    }

    return null;
  };

  // Render signature field
  const renderSignatureField = (field: any) => {
    return (
      <div
        key={field.id}
        style={{
          width: `${field.width}px`,
          height: `${field.height}px`,
          borderRadius: `${themeJson.boxModel.borderRadius}px`,
          borderWidth: "2px",
          borderStyle: "dashed",
          borderColor: themeJson.colors.border,
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
          textAlign: "center",
          marginTop: "1rem",
        }}
      >
        <div style={{ flex: 1, width: "100%", borderBottom: `1px solid ${themeJson.colors.border}` }} />
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            padding: "8px 4px",
            backgroundColor: themeJson.colors.accent,
            color: "#ffffff",
            borderRadius: "4px",
            marginTop: "8px",
          }}
        >
          Signature
        </div>
      </div>
    );
  };

  // Render image
  const renderImage = (image: any) => {
    return (
      <img
        key={image.id}
        src={image.url}
        alt="proposal content"
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: `${themeJson.boxModel.borderRadius}px`,
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      />
    );
  };

  // Render section
  const renderSection = (section: any) => {
    const sectionStyle: React.CSSProperties = {
      marginBottom: `${themeJson.layout.sectionGap}px`,
      padding: `${themeJson.boxModel.defaultPadding.top}px ${themeJson.boxModel.defaultPadding.right}px ${themeJson.boxModel.defaultPadding.bottom}px ${themeJson.boxModel.defaultPadding.left}px`,
      borderRadius: `${themeJson.boxModel.borderRadius}px`,
      backgroundColor: themeJson.colors.backgroundPrimary,
      borderWidth: `${themeJson.boxModel.borderWidth}px`,
      borderStyle: "solid",
      borderColor: themeJson.colors.border,
    };

    return (
      <div key={section.id} style={sectionStyle}>
        {/* Section Title */}
        {section.title && (
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: themeJson.colors.textPrimary,
              fontFamily: themeJson.fonts.primary,
              marginBottom: "1.5rem",
              borderBottom: `2px solid ${themeJson.colors.accent}`,
              paddingBottom: "0.75rem",
            }}
          >
            {section.title}
          </h2>
        )}

        {/* Texts */}
        {section.texts && section.texts.length > 0 && (
          <div style={{ marginBottom: section.images || section.signatureFields ? "1rem" : "0" }}>
            {section.texts.map((text) => renderTextContent(text))}
          </div>
        )}

        {/* Images */}
        {section.images && section.images.length > 0 && (
          <div style={{ marginBottom: section.signatureFields ? "1rem" : "0" }}>
            {section.images.map((image) => renderImage(image))}
          </div>
        )}

        {/* Signature Fields */}
        {section.signatureFields && section.signatureFields.length > 0 && (
          <div>
            {section.signatureFields.map((field) => renderSignatureField(field))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: `${themeJson.layout.maxWidth}px`,
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: themeJson.colors.backgroundPrimary,
        fontFamily: themeJson.fonts.primary,
        color: themeJson.colors.textPrimary,
      }}
    >
      {/* Proposal Title */}
      {proposalJson.title && (
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: themeJson.colors.backgroundDark,
            fontFamily: themeJson.fonts.primary,
            marginBottom: "2rem",
            textAlign: "center",
            paddingBottom: "1rem",
            borderBottom: `3px solid ${themeJson.colors.accent}`,
          }}
        >
          {proposalJson.title}
        </h1>
      )}

      {/* Sections */}
      {proposalJson.sections && proposalJson.sections.length > 0 && (
        <div>
          {proposalJson.sections.map((section) => renderSection(section))}
        </div>
      )}
    </div>
  );
};
