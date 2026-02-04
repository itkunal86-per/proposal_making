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
}

export const ProposalJsonEditorRenderer: React.FC<ProposalJsonEditorRendererProps> = ({
  proposalJson,
  themeJson,
  onProposalJsonChange,
  onThemeJsonChange,
  editMode = false,
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

  // Helper to get text style
  const getTextStyle = (type: "heading" | "paragraph" | "listItem", level?: string): React.CSSProperties => {
    if (type === "heading" && level) {
      const headingKey = level as keyof typeof theme.typography.heading;
      const headingStyle = theme.typography.heading[headingKey];
      if (!headingStyle) {
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

    return {
      fontFamily: theme.fonts.primary,
    };
  };

  // Render text content
  const renderTextContent = (text: any, sectionId: string | number) => {
    const style = getTextStyle(text.type, text.level);
    const isEditing = editingTextId === text.id;

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
            ...(selectedTextId === text.id && editMode ? { backgroundColor: "#e3f2fd", padding: "0.5rem" } : {}),
          }}
          onClick={() => editMode && setSelectedTextId(text.id)}
        >
          <HeadingTag style={style}>{text.content}</HeadingTag>
          {editMode && selectedTextId === text.id && (
            <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingTextId(text.id);
                  setEditingTextContent(text.content);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteText(sectionId, text.id)}
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
            ...(selectedTextId === text.id && editMode ? { backgroundColor: "#e3f2fd", padding: "0.5rem" } : {}),
          }}
          onClick={() => editMode && setSelectedTextId(text.id)}
        >
          <p style={style}>{text.content}</p>
          {editMode && selectedTextId === text.id && (
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingTextId(text.id);
                  setEditingTextContent(text.content);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteText(sectionId, text.id)}
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
    const sectionStyle: React.CSSProperties = {
      marginBottom: `${theme.layout.sectionGap}px`,
      padding: `${theme.boxModel.defaultPadding.top}px ${theme.boxModel.defaultPadding.right}px ${theme.boxModel.defaultPadding.bottom}px ${theme.boxModel.defaultPadding.left}px`,
      borderRadius: `${theme.boxModel.borderRadius}px`,
      backgroundColor: theme.colors.backgroundPrimary,
      borderWidth: `${theme.boxModel.borderWidth}px`,
      borderStyle: "solid",
      borderColor: selectedSectionId === section.id && editMode ? theme.colors.accent : theme.colors.border,
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
        </div>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center", color: theme.colors.textMuted }}>
          <p>No sections available</p>
        </div>
      )}
    </div>
  );
};
