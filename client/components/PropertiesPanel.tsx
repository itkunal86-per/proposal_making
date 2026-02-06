import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { X, Plus, Sparkles, Bold, Italic, Underline, List, ListOrdered, Upload, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { uploadMediaToProposal } from "@/services/mediaService";
import { toast } from "@/hooks/use-toast";

interface ElementStyle {
  color?: string;
  fontSize?: string;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: "all" | "top" | "right" | "bottom" | "left";
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
}

interface PropertiesPanelProps {
  proposal: Proposal;
  selectedElementId: string | null;
  selectedElementType: string | null;
  onUpdateProposal: (proposal: Proposal) => void;
  onRemoveMedia?: (sectionId: string, mediaIndex: number) => void;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  onOpenAI?: () => void;
  themeJson?: any;
}

interface ThemeStyles {
  panelBg: string;
  panelText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentColor: string;
  borderColor: string;
  componentBg: string;
  fontSize: string;
  fontFamily: string;
}

// Helper component for themed labels
const ThemedLabel: React.FC<{ children: React.ReactNode; theme: ThemeStyles; size?: string }> = ({ children, theme, size = "12px" }) => (
  <label style={{ fontSize: size, fontWeight: 600, color: theme.textPrimary, display: "block", fontFamily: theme.fontFamily }}>
    {children}
  </label>
);

// Helper component for themed separators
const ThemedSeparator: React.FC<{ theme: ThemeStyles }> = ({ theme }) => (
  <div style={{ height: "1px", backgroundColor: theme.borderColor, margin: "12px 0" }} />
);

// Helper component for themed container
const ThemedContainer: React.FC<{ children: React.ReactNode; theme: ThemeStyles; maxHeight?: string }> = (
  { children, theme, maxHeight = "90vh" }
) => (
  <div
    style={{
      padding: "16px",
      backgroundColor: theme.componentBg,
      borderRadius: "4px",
      border: `1px solid ${theme.borderColor}`,
      overflow: "auto",
      maxHeight: maxHeight,
      fontFamily: theme.fontFamily,
    }}
  >
    {children}
  </div>
);

// Helper component for themed section title
const ThemedSectionTitle: React.FC<{ children: React.ReactNode; theme: ThemeStyles }> = ({ children, theme }) => (
  <h3 style={{ fontSize: "14px", fontWeight: 600, color: theme.textPrimary, marginBottom: "12px" }}>
    {children}
  </h3>
);

// Helper component for themed input wrapper
const ThemedInputWrapper: React.FC<{ children: React.ReactNode; gap?: string }> = ({ children, gap = "8px" }) => (
  <div style={{ display: "flex", gap, marginTop: "8px", alignItems: "center" }}>
    {children}
  </div>
);

// Helper component for themed select
const ThemedSelect: React.FC<{
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  theme: ThemeStyles;
  multiple?: boolean;
}> = ({ value, onChange, children, theme, multiple }) => (
  <select
    value={value}
    onChange={onChange}
    multiple={multiple}
    style={{
      width: "100%",
      marginTop: "8px",
      padding: "8px 12px",
      border: `1px solid ${theme.borderColor}`,
      borderRadius: "4px",
      fontSize: theme.fontSize,
      color: theme.textPrimary,
      backgroundColor: theme.componentBg,
      fontFamily: theme.fontFamily,
      cursor: "pointer",
    }}
  >
    {children}
  </select>
);

// Helper component for themed textarea
const ThemedTextarea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  theme: ThemeStyles;
  minHeight?: string;
}> = ({ value, onChange, placeholder, theme, minHeight = "100px" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%",
      minHeight,
      marginTop: "8px",
      padding: "10px 12px",
      border: `1px solid ${theme.borderColor}`,
      borderRadius: "4px",
      fontSize: theme.fontSize,
      color: theme.textPrimary,
      backgroundColor: theme.componentBg,
      fontFamily: theme.fontFamily,
      resize: "vertical",
    }}
  />
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  proposal,
  selectedElementId,
  selectedElementType,
  onUpdateProposal,
  onRemoveMedia,
  variables,
  onOpenAI,
  themeJson,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const editorRef = useRef<HTMLDivElement>(null);

  // Helper function to get theme-based styles
  const getThemeStyles = (): ThemeStyles => {
    if (!themeJson) {
      return {
        panelBg: "#ffffff",
        panelText: "#000000",
        textPrimary: "#0c2226",
        textSecondary: "#727272",
        textMuted: "#696868",
        accentColor: "#3747ff",
        borderColor: "#d1d5db",
        componentBg: "#ffffff",
        fontSize: "14px",
        fontFamily: "system-ui, sans-serif",
      };
    }

    return {
      panelBg: themeJson.components?.textBlock?.backgroundColor || "#ffffff",
      panelText: themeJson.colors?.textPrimary || "#0c2226",
      textPrimary: themeJson.colors?.textPrimary || "#0c2226",
      textSecondary: themeJson.colors?.textSecondary || "#727272",
      textMuted: themeJson.colors?.textMuted || "#696868",
      accentColor: themeJson.colors?.accent || "#3747ff",
      borderColor: themeJson.colors?.border || "#d1d5db",
      componentBg: themeJson.components?.textBlock?.backgroundColor || "#ffffff",
      fontSize: `${themeJson.typography?.paragraph?.fontSize || 14}px`,
      fontFamily: themeJson.fonts?.primary || "system-ui, sans-serif",
    };
  };

  const themeStyles = getThemeStyles();

  if (!selectedElementId || !selectedElementType) {
    return (
      <ThemedContainer theme={themeStyles}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>
            Select an element to edit its properties
          </p>
        </div>
      </ThemedContainer>
    );
  }

  // Handle JSON text element properties
  if (selectedElementType === "text" && (proposal as any).proposal_json) {
    const jsonProposal = (proposal as any).proposal_json;
    const parts = selectedElementId.split("-");
    const textId = parts[parts.length - 1];
    const sectionId = parts[1];

    const section = jsonProposal.sections?.find((s: any) => String(s.id) === String(sectionId));
    if (!section) {
      return (
        <ThemedContainer theme={themeStyles}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>Text element not found</p>
        </ThemedContainer>
      );
    }

    const text = section.texts?.find((t: any) => t.id === textId);
    if (!text) {
      return (
        <ThemedContainer theme={themeStyles}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>Text element not found</p>
        </ThemedContainer>
      );
    }

    const handleUpdateText = (updates: Partial<typeof text>) => {
      const updatedJson = {
        ...jsonProposal,
        sections: jsonProposal.sections.map((s: any) =>
          String(s.id) === String(sectionId)
            ? {
                ...s,
                texts: s.texts.map((t: any) => (t.id === textId ? { ...t, ...updates } : t)),
              }
            : s
        ),
      };
      onUpdateProposal({ ...proposal, proposal_json: updatedJson });
    };

    return (
      <ThemedContainer theme={themeStyles}>
        <ThemedSectionTitle theme={themeStyles}>Text Properties</ThemedSectionTitle>
        <ThemedSeparator theme={themeStyles} />

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Text Type</ThemedLabel>
          <ThemedSelect value={text.type || "paragraph"} onChange={(e) => handleUpdateText({ type: e.target.value as any })} theme={themeStyles}>
            <option value="heading">Heading</option>
            <option value="paragraph">Paragraph</option>
            <option value="listItem">List Item</option>
          </ThemedSelect>
        </div>

        {text.type === "heading" && (
          <div style={{ marginBottom: "16px" }}>
            <ThemedLabel theme={themeStyles}>Heading Level</ThemedLabel>
            <ThemedSelect value={text.level || "h1"} onChange={(e) => handleUpdateText({ level: e.target.value as any })} theme={themeStyles}>
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </ThemedSelect>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Content</ThemedLabel>
          <ThemedTextarea value={text.content || ""} onChange={(e) => handleUpdateText({ content: e.target.value })} placeholder="Enter text content..." theme={themeStyles} />
        </div>

        <ThemedSeparator theme={themeStyles} />

        <ThemedSectionTitle theme={themeStyles}>Styling</ThemedSectionTitle>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Text Color</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="color"
              value={text.color || themeStyles.textPrimary}
              onChange={(e) => handleUpdateText({ color: e.target.value })}
              style={{ width: "60px", height: "40px", padding: "4px", cursor: "pointer" }}
            />
            <Input
              value={text.color || themeStyles.textPrimary}
              onChange={(e) => handleUpdateText({ color: e.target.value })}
              placeholder="Color"
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Font Size</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="8"
              max="72"
              value={text.fontSize || 16}
              onChange={(e) => handleUpdateText({ fontSize: parseInt(e.target.value) })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Font Weight</ThemedLabel>
          <ThemedSelect value={text.fontWeight || 400} onChange={(e) => handleUpdateText({ fontWeight: parseInt(e.target.value) })} theme={themeStyles}>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semibold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="900">Heavy (900)</option>
          </ThemedSelect>
        </div>

        <ThemedSeparator theme={themeStyles} />

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Background Color</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="color"
              value={text.backgroundColor || "#ffffff"}
              onChange={(e) => handleUpdateText({ backgroundColor: e.target.value })}
              style={{ width: "60px", height: "40px", padding: "4px", cursor: "pointer" }}
            />
            <Input
              value={text.backgroundColor || "#ffffff"}
              onChange={(e) => handleUpdateText({ backgroundColor: e.target.value })}
              placeholder="Background"
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Margin Bottom</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="0"
              max="100"
              value={text.marginBottom || 0}
              onChange={(e) => handleUpdateText({ marginBottom: parseInt(e.target.value) })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>
      </ThemedContainer>
    );
  }

  if (selectedElementType === "section") {
    const sectionId = selectedElementId.replace("section-", "");
    const section = proposal.sections.find((s) => String(s.id) === String(sectionId));

    if (!section) {
      return (
        <ThemedContainer theme={themeStyles}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>Section not found</p>
        </ThemedContainer>
      );
    }

    const handleUpdateSection = (updates: Partial<ProposalSection>) => {
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          String(s.id) === String(sectionId) ? { ...s, ...updates } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    const sectionStyles = (section as any).contentStyles || {};

    return (
      <ThemedContainer theme={themeStyles}>
        <ThemedSectionTitle theme={themeStyles}>Section Properties</ThemedSectionTitle>
        <ThemedSeparator theme={themeStyles} />

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Layout</ThemedLabel>
          <ThemedSelect
            value={section.layout || "single"}
            onChange={(e) =>
              handleUpdateSection({
                layout: e.target.value as "single" | "two-column" | "three-column",
              })
            }
            theme={themeStyles}
          >
            <option value="single">Single Column</option>
            <option value="two-column">Two Columns</option>
            <option value="three-column">Three Columns</option>
          </ThemedSelect>
        </div>

        <ThemedSeparator theme={themeStyles} />

        <ThemedSectionTitle theme={themeStyles}>Background</ThemedSectionTitle>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Color</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="color"
              value={sectionStyles.backgroundColor || "#ffffff"}
              onChange={(e) =>
                handleUpdateSection({
                  contentStyles: { ...sectionStyles, backgroundColor: e.target.value },
                })
              }
              style={{ width: "60px", height: "40px", padding: "4px", cursor: "pointer" }}
            />
            <Input
              value={sectionStyles.backgroundColor || ""}
              onChange={(e) =>
                handleUpdateSection({
                  contentStyles: { ...sectionStyles, backgroundColor: e.target.value },
                })
              }
              placeholder="transparent"
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Image URL</ThemedLabel>
          <Input
            value={sectionStyles.backgroundImage || ""}
            onChange={(e) =>
              handleUpdateSection({
                contentStyles: { ...sectionStyles, backgroundImage: e.target.value },
              })
            }
            placeholder="https://example.com/image.jpg"
            style={{ fontSize: themeStyles.fontSize, marginTop: "8px" }}
          />
        </div>

        {sectionStyles.backgroundImage && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <ThemedLabel theme={themeStyles}>Background Size</ThemedLabel>
              <ThemedSelect
                value={sectionStyles.backgroundSize || "cover"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionStyles, backgroundSize: e.target.value },
                  })
                }
                theme={themeStyles}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="stretch">Stretch</option>
              </ThemedSelect>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <ThemedLabel theme={themeStyles}>Background Opacity</ThemedLabel>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parseInt(sectionStyles.backgroundOpacity || "100")}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionStyles, backgroundOpacity: e.target.value },
                    })
                  }
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600, width: "40px", textAlign: "center", color: themeStyles.textPrimary }}>
                  {parseInt(sectionStyles.backgroundOpacity || "100")}%
                </span>
              </div>
            </div>
          </>
        )}

        <ThemedSeparator theme={themeStyles} />

        <ThemedSectionTitle theme={themeStyles}>Spacing</ThemedSectionTitle>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Gap After Section</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="0"
              max="100"
              value={String(typeof sectionStyles.gapAfter === "number" ? sectionStyles.gapAfter : 24)}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === "" ? 24 : parseInt(value, 10);
                handleUpdateSection({
                  contentStyles: { ...sectionStyles, gapAfter: isNaN(numValue) ? 24 : numValue },
                });
              }}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
          <p style={{ fontSize: "11px", color: themeStyles.textMuted, marginTop: "6px" }}>
            Spacing between this section and the next one (default: 24px)
          </p>
        </div>
      </ThemedContainer>
    );
  }

  if (selectedElementType === "image") {
    const lastHyphenIndex = selectedElementId.lastIndexOf("-");
    const imageIndex = selectedElementId.substring(lastHyphenIndex + 1);
    const sectionId = selectedElementId.substring(6, lastHyphenIndex);

    const section = proposal.sections.find((s) => String(s.id) === String(sectionId));
    if (!section) {
      return (
        <ThemedContainer theme={themeStyles}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>Section not found</p>
        </ThemedContainer>
      );
    }

    const images = (section as any).images || [];
    const image = images[parseInt(imageIndex)];

    if (!image) {
      return (
        <ThemedContainer theme={themeStyles}>
          <p style={{ fontSize: "12px", color: themeStyles.textMuted }}>Image not found</p>
        </ThemedContainer>
      );
    }

    const handleUpdateImage = (updates: Partial<typeof image>) => {
      const newImages = images.map((img: any, idx: number) =>
        idx === parseInt(imageIndex) ? { ...img, ...updates } : img
      );
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          String(s.id) === String(sectionId) ? { ...s, images: newImages } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      try {
        const result = await uploadMediaToProposal(file, proposal.id);

        if (!result.success || !result.data) {
          toast({
            title: "Upload Failed",
            description: result.error || "Failed to upload image",
            variant: "destructive",
          });
          return;
        }

        const imageUrl = result.data.media_record.url;
        handleUpdateImage({ url: imageUrl });

        toast({
          title: "Upload Successful",
          description: "Image uploaded successfully",
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        toast({
          title: "Upload Error",
          description: "An unexpected error occurred during upload",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };

    return (
      <ThemedContainer theme={themeStyles}>
        <ThemedSectionTitle theme={themeStyles}>Image Properties</ThemedSectionTitle>
        <ThemedSeparator theme={themeStyles} />

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Upload Image</ThemedLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            style={{
              width: "100%",
              marginTop: "8px",
              backgroundColor: themeStyles.accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: themeStyles.fontSize,
            }}
          >
            {uploading ? (
              <>
                <Loader2 style={{ marginRight: "8px", width: "16px", height: "16px" }} />
                Uploading...
              </>
            ) : (
              <>
                <Upload style={{ marginRight: "8px", width: "16px", height: "16px" }} />
                Choose Image
              </>
            )}
          </Button>
          {image.url && (
            <p style={{ fontSize: "11px", color: themeStyles.textMuted, marginTop: "8px" }}>
              Current: {image.url.split("/").pop() || "Image loaded"}
            </p>
          )}
        </div>

        <ThemedSeparator theme={themeStyles} />

        <ThemedSectionTitle theme={themeStyles}>Dimensions</ThemedSectionTitle>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Width</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="50"
              value={image.width}
              onChange={(e) => handleUpdateImage({ width: parseInt(e.target.value) || 200 })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Height</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="50"
              value={image.height}
              onChange={(e) => handleUpdateImage({ height: parseInt(e.target.value) || 150 })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>

        <ThemedSeparator theme={themeStyles} />

        <ThemedSectionTitle theme={themeStyles}>Appearance</ThemedSectionTitle>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Opacity</ThemedLabel>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
            <input
              type="range"
              min="0"
              max="100"
              value={parseInt(image.opacity || "100")}
              onChange={(e) => handleUpdateImage({ opacity: e.target.value })}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, width: "40px", textAlign: "center", color: themeStyles.textPrimary }}>
              {parseInt(image.opacity || "100")}%
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Border Width</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="0"
              value={image.borderWidth || 0}
              onChange={(e) => handleUpdateImage({ borderWidth: parseInt(e.target.value) || 0 })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Border Color</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="color"
              value={image.borderColor || "#000000"}
              onChange={(e) => handleUpdateImage({ borderColor: e.target.value })}
              style={{ width: "60px", height: "40px", padding: "4px", cursor: "pointer" }}
            />
            <Input
              value={image.borderColor || "#000000"}
              onChange={(e) => handleUpdateImage({ borderColor: e.target.value })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
          </ThemedInputWrapper>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ThemedLabel theme={themeStyles}>Border Radius</ThemedLabel>
          <ThemedInputWrapper>
            <Input
              type="number"
              min="0"
              value={image.borderRadius || 0}
              onChange={(e) => handleUpdateImage({ borderRadius: parseInt(e.target.value) || 0 })}
              style={{ flex: 1, fontSize: themeStyles.fontSize }}
            />
            <span style={{ fontSize: "12px", color: themeStyles.textMuted, alignSelf: "center", width: "30px" }}>
              px
            </span>
          </ThemedInputWrapper>
        </div>

        <ThemedSeparator theme={themeStyles} />

        <Button
          variant="destructive"
          size="sm"
          style={{
            width: "100%",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: themeStyles.fontSize,
          }}
          onClick={() => {
            const newImages = images.filter((_: any, i: number) => i !== parseInt(imageIndex));
            const updatedProposal = {
              ...proposal,
              sections: proposal.sections.map((s) =>
                String(s.id) === String(sectionId) ? { ...s, images: newImages } : s
              ),
            };
            onUpdateProposal(updatedProposal);
          }}
        >
          Remove Image
        </Button>
      </ThemedContainer>
    );
  }

  // Fallback for other element types (use original Card-based layout for backward compatibility)
  return (
    <Card className="p-4">
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Properties for this element type are not yet themed</p>
      </div>
    </Card>
  );
};
