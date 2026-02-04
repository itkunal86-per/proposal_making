import React from "react";

interface ProposalJsonRendererProps {
  proposalJson: any;
  themeJson: any;
}

export const ProposalJsonRenderer: React.FC<ProposalJsonRendererProps> = ({
  proposalJson,
  themeJson,
}) => {
  // Debug logging
  React.useEffect(() => {
    const debugInfo = {
      proposalJson: proposalJson ? {
        title: proposalJson.title,
        sectionsCount: proposalJson.sections?.length,
        hasThemeId: !!proposalJson.themeId,
        sectionTitles: proposalJson.sections?.map(s => s.title)
      } : null,
      themeJson: themeJson ? {
        themeId: themeJson.themeId,
        hasColors: !!themeJson.colors,
        hasFonts: !!themeJson.fonts,
        hasTypography: !!themeJson.typography
      } : null,
    };
    console.log("ProposalJsonRenderer mounted with:", debugInfo);
  }, [proposalJson, themeJson]);

  if (!proposalJson) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        <p>Unable to render proposal - missing proposal data</p>
      </div>
    );
  }

  // Create safe theme object with defaults
  const theme = themeJson ? {
    colors: themeJson.colors || {
      textPrimary: "#0c2226",
      textSecondary: "#727272",
      textMuted: "#696868",
      backgroundPrimary: "#ffffff",
      backgroundDark: "#04072f",
      accent: "#3747ff",
      border: "#d1d5db",
    },
    fonts: themeJson.fonts || {
      primary: "system-ui, sans-serif",
      icon: "Font Awesome 6 Pro",
    },
    typography: themeJson.typography || {
      heading: {
        h3: {
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1.2,
          textTransform: "capitalize",
          color: "#0c2226",
          marginBottom: 15,
        },
      },
      paragraph: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.6,
        color: "#727272",
      },
      listItem: {
        fontSize: 16,
        fontWeight: 900,
        gap: 15,
        iconColor: "#3747ff",
        textTransform: "capitalize",
      },
    },
    boxModel: themeJson.boxModel || {
      defaultPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      borderRadius: 4,
      borderWidth: 1,
    },
    layout: themeJson.layout || {
      sectionGap: 10,
      columnGutter: 12,
      maxWidth: 776,
    },
    components: themeJson.components || {
      textBlock: {
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
      },
      darkPanel: {
        backgroundColor: "#04072f",
        textColor: "#faf5f5",
      },
      featureList: {
        icon: "fa-solid fa-circle-check",
        iconColor: "#3747ff",
      },
    },
  } : {
    colors: {
      textPrimary: "#0c2226",
      textSecondary: "#727272",
      textMuted: "#696868",
      backgroundPrimary: "#ffffff",
      backgroundDark: "#04072f",
      accent: "#3747ff",
      border: "#d1d5db",
    },
    fonts: {
      primary: "system-ui, sans-serif",
      icon: "Font Awesome 6 Pro",
    },
    typography: {
      heading: {
        h3: {
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1.2,
          textTransform: "capitalize",
          color: "#0c2226",
          marginBottom: 15,
        },
      },
      paragraph: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.6,
        color: "#727272",
      },
      listItem: {
        fontSize: 16,
        fontWeight: 900,
        gap: 15,
        iconColor: "#3747ff",
        textTransform: "capitalize",
      },
    },
    boxModel: {
      defaultPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      borderRadius: 4,
      borderWidth: 1,
    },
    layout: {
      sectionGap: 10,
      columnGutter: 12,
      maxWidth: 776,
    },
    components: {
      textBlock: {
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
      },
      darkPanel: {
        backgroundColor: "#04072f",
        textColor: "#faf5f5",
      },
      featureList: {
        icon: "fa-solid fa-circle-check",
        iconColor: "#3747ff",
      },
    },
  };

  // Helper function to get typography style based on text type - merges theme styles with individual text element overrides
  const getTextStyle = (
    type: "heading" | "paragraph" | "listItem",
    level?: string,
    textElement?: any
  ): React.CSSProperties => {
    let baseStyle: React.CSSProperties = {};

    if (type === "heading" && level) {
      const headingKey = level as keyof typeof theme.typography.heading;
      const headingStyle = theme.typography.heading[headingKey];
      if (!headingStyle) {
        // Fallback for headings not defined in theme
        baseStyle = {
          fontSize: "24px",
          fontWeight: 600,
          lineHeight: 1.2,
          color: theme.colors.textPrimary,
          marginBottom: "15px",
          fontFamily: theme.fonts.primary,
          marginTop: "0px",
        };
      } else {
        baseStyle = {
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
    } else if (type === "paragraph") {
      baseStyle = {
        fontSize: `${theme.typography.paragraph.fontSize}px`,
        fontWeight: theme.typography.paragraph.fontWeight,
        lineHeight: theme.typography.paragraph.lineHeight,
        color: theme.typography.paragraph.color,
        fontFamily: theme.fonts.primary,
        marginBottom: "1rem",
        marginTop: "0px",
      };
    } else if (type === "listItem" && theme.typography.listItem) {
      baseStyle = {
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
    } else {
      baseStyle = {
        fontFamily: theme.fonts.primary,
      };
    }

    // Apply individual text element overrides on top of theme styles
    if (textElement) {
      const overrides: React.CSSProperties = {};

      if (textElement.color) {
        overrides.color = textElement.color;
      }
      if (textElement.fontSize) {
        const size = typeof textElement.fontSize === "number" ? textElement.fontSize : parseInt(textElement.fontSize);
        overrides.fontSize = `${size}px`;
      }
      if (textElement.fontWeight) {
        const weight = typeof textElement.fontWeight === "number" ? textElement.fontWeight : parseInt(textElement.fontWeight);
        overrides.fontWeight = weight;
      }
      if (textElement.backgroundColor) {
        overrides.backgroundColor = textElement.backgroundColor;
        if (!overrides.padding) {
          overrides.padding = "0.25rem 0.5rem";
        }
      }
      if (textElement.marginBottom) {
        const margin = typeof textElement.marginBottom === "number" ? textElement.marginBottom : parseInt(textElement.marginBottom);
        overrides.marginBottom = `${margin}px`;
      }

      return { ...baseStyle, ...overrides };
    }

    return baseStyle;
  };

  // Render text content
  const renderTextContent = (text: any) => {
    const style = getTextStyle(text.type, text.level, text);

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
        <p key={text.id} style={style}>
          {text.content}
        </p>
      );
    }

    if (text.type === "listItem") {
      const listItemIcon = theme.components.featureList?.icon || "✓";
      const listItemColor = theme.components.featureList?.iconColor || theme.colors.accent;
      return (
        <div key={text.id} style={style}>
          <span style={{ color: listItemColor, flexShrink: 0, marginTop: "2px" }}>
            {listItemIcon === "fa-solid fa-circle-check" ? "✓" : listItemIcon}
          </span>
          <span style={{ flex: 1 }}>{text.content}</span>
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
          borderRadius: `${theme.boxModel.borderRadius}px`,
          borderWidth: "2px",
          borderStyle: "dashed",
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundPrimary,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          textAlign: "center",
          marginTop: "1rem",
        }}
      >
        <div style={{ flex: 1, width: "100%", borderBottom: `1px solid ${theme.colors.border}` }} />
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            padding: "8px 4px",
            backgroundColor: theme.colors.accent,
            color: theme.colors.backgroundPrimary,
            borderRadius: `${theme.boxModel.borderRadius}px`,
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
          borderRadius: `${theme.boxModel.borderRadius}px`,
          marginTop: "1rem",
          marginBottom: "1rem",
          display: "block",
        }}
        onError={(e) => {
          console.warn("Failed to load image:", image.url);
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  };

  // Render section
  const renderSection = (section: any) => {
    const sectionStyle: React.CSSProperties = {
      marginBottom: `${theme.layout.sectionGap}px`,
      padding: `${theme.boxModel.defaultPadding.top}px ${theme.boxModel.defaultPadding.right}px ${theme.boxModel.defaultPadding.bottom}px ${theme.boxModel.defaultPadding.left}px`,
      borderRadius: `${theme.boxModel.borderRadius}px`,
      backgroundColor: theme.colors.backgroundPrimary,
      borderWidth: `${theme.boxModel.borderWidth}px`,
      borderStyle: "solid",
      borderColor: theme.colors.border,
    };

    return (
      <div key={section.id} style={sectionStyle}>
        {/* Section Title */}
        {section.title && (
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.primary,
              marginBottom: "1.5rem",
              marginTop: "0px",
              borderBottom: `2px solid ${theme.colors.accent}`,
              paddingBottom: "0.75rem",
            }}
          >
            {section.title}
          </h2>
        )}

        {/* Texts */}
        {section.texts && section.texts.length > 0 && (
          <div style={{ marginBottom: section.images || section.signatureFields ? "1rem" : "0" }}>
            {section.texts.map((text, idx) => (
              <React.Fragment key={text.id || idx}>
                {renderTextContent(text)}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Images */}
        {section.images && section.images.length > 0 && (
          <div style={{ marginBottom: section.signatureFields ? "1rem" : "0" }}>
            {section.images.map((image, idx) => (
              <React.Fragment key={image.id || idx}>
                {renderImage(image)}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Signature Fields */}
        {section.signatureFields && section.signatureFields.length > 0 && (
          <div>
            {section.signatureFields.map((field, idx) => (
              <React.Fragment key={field.id || idx}>
                {renderSignatureField(field)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: `${theme.layout.maxWidth}px`,
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: theme.colors.backgroundPrimary,
        fontFamily: theme.fonts.primary,
        color: theme.colors.textPrimary,
        width: "100%",
      }}
    >
      {/* Proposal Title */}
      {proposalJson.title && (
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: theme.colors.backgroundDark,
            fontFamily: theme.fonts.primary,
            marginBottom: "2rem",
            marginTop: "0px",
            textAlign: "center",
            paddingBottom: "1rem",
            borderBottom: `3px solid ${theme.colors.accent}`,
          }}
        >
          {proposalJson.title}
        </h1>
      )}

      {/* Sections */}
      {proposalJson.sections && proposalJson.sections.length > 0 ? (
        <div>
          {proposalJson.sections.map((section, idx) => (
            <React.Fragment key={section.id || idx}>
              {renderSection(section)}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center", color: theme.colors.textMuted }}>
          <p>No sections available</p>
        </div>
      )}
    </div>
  );
};
