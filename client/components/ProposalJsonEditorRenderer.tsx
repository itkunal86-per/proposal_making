import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Edit2, X } from "lucide-react";

interface ProposalJsonEditorRendererProps {
  proposalJson: any;
  themeJson: any;
  onProposalJsonChange: (updatedJson: any) => void;
  onThemeJsonChange?: (updatedJson: any) => void;
  onSelectElement?: (elementId: string, elementType: string) => void;
  selectedElementId?: string | null;
  selectedElementType?: string | null;
  editMode?: boolean;
  onAddSection?: () => void;
}

export const ProposalJsonEditorRenderer: React.FC<ProposalJsonEditorRendererProps> = ({
  proposalJson,
  themeJson,
  onProposalJsonChange,
  onThemeJsonChange,
  onSelectElement,
  selectedElementId,
  selectedElementType,
  editMode = false,
  onAddSection,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | number | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextContent, setEditingTextContent] = useState<string>("");

  if (!proposalJson || !themeJson) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        <p>Unable to render proposal - missing data</p>
      </div>
    );
  }

  const theme = themeJson;

  // Handle proposal title change
  const handleTitleChange = (newTitle: string) => {
    const updated = { ...proposalJson, title: newTitle };
    onProposalJsonChange(updated);
  };

  // Handle section title change
  const handleSectionTitleChange = (sectionId: string | number, newTitle: string) => {
    const updated = {
      ...proposalJson,
      sections: proposalJson.sections.map((s: any) =>
        s.id === sectionId ? { ...s, title: newTitle } : s
      ),
    };
    onProposalJsonChange(updated);
  };

  // Handle text content change
  const handleTextChange = (sectionId: string | number, textId: string, newContent: string) => {
    const updated = {
      ...proposalJson,
      sections: proposalJson.sections.map((s: any) =>
        s.id === sectionId
          ? {
              ...s,
              texts: s.texts.map((t: any) =>
                t.id === textId ? { ...t, content: newContent } : t
              ),
            }
          : s
      ),
    };
    onProposalJsonChange(updated);
  };

  // Handle delete text
  const handleDeleteText = (sectionId: string | number, textId: string) => {
    const updated = {
      ...proposalJson,
      sections: proposalJson.sections.map((s: any) =>
        s.id === sectionId
          ? {
              ...s,
              texts: s.texts.filter((t: any) => t.id !== textId),
            }
          : s
      ),
    };
    onProposalJsonChange(updated);
  };

  // Handle add text
  const handleAddText = (sectionId: string | number) => {
    const updated = {
      ...proposalJson,
      sections: proposalJson.sections.map((s: any) =>
        s.id === sectionId
          ? {
              ...s,
              texts: [
                ...(s.texts || []),
                {
                  id: `text-${Date.now()}`,
                  type: "paragraph",
                  content: "New paragraph",
                },
              ],
            }
          : s
      ),
    };
    onProposalJsonChange(updated);
  };

  // Helper to get text style - merges theme styles with individual text element overrides
  const getTextStyle = (type: "heading" | "paragraph" | "listItem", level?: string, textElement?: any): React.CSSProperties => {
    let baseStyle: React.CSSProperties = {};

    if (type === "heading" && level) {
      const headingKey = level as keyof typeof theme.typography.heading;
      const headingStyle = theme.typography.heading[headingKey];
      if (!headingStyle) {
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
  const renderTextContent = (text: any, sectionId: string | number) => {
    const style = getTextStyle(text.type, text.level, text);
    const isEditing = editingTextId === text.id;
    const elementId = `text-${sectionId}-${text.id}`;
    const isSelected = selectedElementId === elementId && selectedElementType === "text";

    if (isEditing && editMode) {
      return (
        <div
          key={text.id}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            marginBottom: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <textarea
            value={editingTextContent}
            onChange={(e) => setEditingTextContent(e.target.value)}
            style={{
              flex: 1,
              fontFamily: theme.fonts.primary,
              fontSize: "14px",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            rows={3}
          />
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                handleTextChange(sectionId, text.id, editingTextContent);
                setEditingTextId(null);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingTextId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (text.type === "heading") {
      const HeadingTag = (text.level || "h3") as any;
      return (
        <div
          key={text.id}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            marginBottom: "0.5rem",
            ...(isSelected ? { backgroundColor: "#e3f2fd", padding: "0.5rem", outline: "2px solid #3b82f6", outlineOffset: "2px" } : {}),
          }}
          onClick={() => {
            onSelectElement?.(elementId, "text");
            setSelectedTextId(text.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <HeadingTag style={style}>{text.content}</HeadingTag>
          {editMode && isSelected && (
            <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(text.id);
                  setEditingTextContent(text.content);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteText(sectionId, text.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (text.type === "paragraph") {
      return (
        <div
          key={text.id}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            marginBottom: "0.5rem",
            ...(isSelected ? { backgroundColor: "#e3f2fd", padding: "0.5rem", outline: "2px solid #3b82f6", outlineOffset: "2px" } : {}),
          }}
          onClick={() => {
            onSelectElement?.(elementId, "text");
            setSelectedTextId(text.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <p style={style}>{text.content}</p>
          {editMode && isSelected && (
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(text.id);
                  setEditingTextContent(text.content);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteText(sectionId, text.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
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
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  };

  // Render section
  const renderSection = (section: any) => {
    // Get safe defaults for theme.boxModel
    const boxModel = theme?.boxModel || { defaultPadding: { top: 8, right: 8, bottom: 8, left: 8 }, borderRadius: 4, borderWidth: 1 };
    const layout = theme?.layout || { sectionGap: 10 };
    const colors = theme?.colors || { backgroundPrimary: "#ffffff", border: "#d1d5db", accent: "#3747ff" };

    const sectionStyle: React.CSSProperties = {
      marginBottom: `${layout.sectionGap}px`,
      padding: `${boxModel.defaultPadding?.top || 8}px ${boxModel.defaultPadding?.right || 8}px ${boxModel.defaultPadding?.bottom || 8}px ${boxModel.defaultPadding?.left || 8}px`,
      borderRadius: `${boxModel.borderRadius || 4}px`,
      backgroundColor: colors.backgroundPrimary,
      borderWidth: `${boxModel.borderWidth || 1}px`,
      borderStyle: "solid",
      borderColor: selectedSectionId === section.id && editMode ? colors.accent : colors.border,
      cursor: editMode ? "pointer" : "default",
    };

    return (
      <div
        key={section.id}
        style={sectionStyle}
        onClick={() => editMode && setSelectedSectionId(section.id)}
      >
        {/* Section Title */}
        {section.title && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            {editMode && selectedSectionId === section.id ? (
              <Input
                value={section.title}
                onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                }}
              />
            ) : (
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
                  flex: 1,
                }}
              >
                {section.title}
              </h2>
            )}
          </div>
        )}

        {/* Texts */}
        {section.texts && section.texts.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            {section.texts.map((text: any) => renderTextContent(text, section.id))}
          </div>
        )}

        {/* Add Text Button */}
        {editMode && selectedSectionId === section.id && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddText(section.id)}
            className="gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            Add Text
          </Button>
        )}

        {/* Images */}
        {section.images && section.images.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            {section.images.map((image: any) => renderImage(image))}
          </div>
        )}

        {/* Signature Fields */}
        {section.signatureFields && section.signatureFields.length > 0 && (
          <div>
            {section.signatureFields.map((field: any, idx: number) => (
              <div
                key={field.id || idx}
                style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  borderRadius: `${theme?.boxModel?.borderRadius || 4}px`,
                  borderWidth: "2px",
                  borderStyle: "dashed",
                  borderColor: theme?.colors?.border || "#d1d5db",
                  backgroundColor: theme?.colors?.backgroundPrimary || "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px",
                  textAlign: "center",
                  marginTop: "1rem",
                }}
              >
                <div style={{ flex: 1, width: "100%", borderBottom: `1px solid ${theme?.colors?.border || "#d1d5db"}` }} />
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: "8px 4px",
                    backgroundColor: theme?.colors?.accent || "#3747ff",
                    color: theme?.colors?.backgroundPrimary || "#ffffff",
                    borderRadius: `${theme?.boxModel?.borderRadius || 4}px`,
                    marginTop: "8px",
                  }}
                >
                  Signature
                </div>
              </div>
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
      {editMode ? (
        <Input
          value={proposalJson.title || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
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
        />
      ) : (
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
          {proposalJson.sections.map((section: any, idx: number) => (
            <React.Fragment key={section.id || idx}>
              {renderSection(section)}
            </React.Fragment>
          ))}
          {editMode && (
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
              <Button
                onClick={onAddSection}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center", color: theme.colors.textMuted }}>
          <p>No sections available</p>
          {editMode && (
            <Button
              onClick={onAddSection}
              className="gap-2 mt-4"
            >
              <Plus className="w-4 h-4" />
              Add First Section
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
