import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { X, Plus } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";

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
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  proposal,
  selectedElementId,
  selectedElementType,
  onUpdateProposal,
  onRemoveMedia,
  variables,
}) => {
  if (!selectedElementId || !selectedElementType) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </Card>
    );
  }

  const updateTitleStyles = (styles: Partial<ElementStyle>) => {
    const updated = {
      ...proposal,
      titleStyles: { ...proposal.titleStyles, ...styles }
    };
    onUpdateProposal(updated as any);
  };

  if (selectedElementType === "title") {
    const titleStyles = (proposal as any).titleStyles || {};
    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Proposal Title</Label>
          <Input
            value={proposal.title}
            onChange={(e) =>
              onUpdateProposal({ ...proposal, title: e.target.value })
            }
            className="mt-2"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Title Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={titleStyles.color || "#000000"}
                onChange={(e) =>
                  updateTitleStyles({ color: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={titleStyles.color || "#000000"}
                onChange={(e) =>
                  updateTitleStyles({ color: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Font Size</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="12"
                max="72"
                value={parseInt(titleStyles.fontSize || "32")}
                onChange={(e) =>
                  updateTitleStyles({ fontSize: e.target.value })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Text Alignment</Label>
            <div className="flex gap-2 mt-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  variant={
                    titleStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateTitleStyles({ textAlign: align })
                  }
                  className="capitalize flex-1"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Background</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={titleStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateTitleStyles({ backgroundColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={titleStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateTitleStyles({ backgroundColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Image URL</Label>
            <Input
              value={titleStyles.backgroundImage || ""}
              onChange={(e) =>
                updateTitleStyles({ backgroundImage: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>
          {titleStyles.backgroundImage && (
            <>
              <div>
                <Label className="text-xs font-semibold">Background Size</Label>
                <select
                  value={titleStyles.backgroundSize || "cover"}
                  onChange={(e) =>
                    updateTitleStyles({ backgroundSize: e.target.value })
                  }
                  className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Background Opacity</Label>
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parseInt(titleStyles.backgroundOpacity || "100")}
                    onChange={(e) =>
                      updateTitleStyles({ backgroundOpacity: e.target.value })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-center">
                    {parseInt(titleStyles.backgroundOpacity || "100")}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Borders</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={titleStyles.borderColor || "#000000"}
                onChange={(e) =>
                  updateTitleStyles({ borderColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={titleStyles.borderColor || "#000000"}
                onChange={(e) =>
                  updateTitleStyles({ borderColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Borders</Label>
            <select
              value={titleStyles.borderStyle || "all"}
              onChange={(e) =>
                updateTitleStyles({ borderStyle: e.target.value as any })
              }
              className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All sides</option>
              <option value="top">Top</option>
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={parseInt(titleStyles.borderWidth || "0")}
                onChange={(e) =>
                  updateTitleStyles({ borderWidth: e.target.value })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border radius</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="50"
                value={parseInt(titleStyles.borderRadius || "0")}
                onChange={(e) =>
                  updateTitleStyles({ borderRadius: e.target.value })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Spacing</h3>
          <div>
            <Label className="text-xs font-semibold">Padding</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.paddingTop || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ paddingTop: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.paddingRight || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ paddingRight: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.paddingBottom || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ paddingBottom: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.paddingLeft || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ paddingLeft: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Margin</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.marginTop || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ marginTop: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.marginRight || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ marginRight: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.marginBottom || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ marginBottom: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(titleStyles.marginLeft || "0")}
                  onChange={(e) =>
                    updateTitleStyles({ marginLeft: e.target.value })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (selectedElementType === "section-title") {
    const sectionId = selectedElementId.replace("section-title-", "");
    const section = proposal.sections.find((s) => s.id === sectionId);

    if (!section) return null;

    const handleUpdateSection = (updates: Partial<ProposalSection>) => {
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    const sectionTitleStyles = (section as any).titleStyles || {};
    const isMultiColumn = section.layout === "two-column" || section.layout === "three-column";

    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Section Title</Label>
          <Input
            value={section.title}
            onChange={(e) => handleUpdateSection({ title: e.target.value })}
            className="mt-2"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Title Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionTitleStyles.color || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, color: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionTitleStyles.color || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, color: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Font Size</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="12"
                max="72"
                value={parseInt(sectionTitleStyles.fontSize || "24")}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, fontSize: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Text Alignment</Label>
            <div className="flex gap-2 mt-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  variant={
                    sectionTitleStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, textAlign: align }
                    })
                  }
                  className="capitalize flex-1"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Background</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionTitleStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, backgroundColor: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionTitleStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, backgroundColor: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Image URL</Label>
            <Input
              value={sectionTitleStyles.backgroundImage || ""}
              onChange={(e) =>
                handleUpdateSection({
                  titleStyles: { ...sectionTitleStyles, backgroundImage: e.target.value }
                })
              }
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>
          {sectionTitleStyles.backgroundImage && (
            <>
              <div>
                <Label className="text-xs font-semibold">Background Size</Label>
                <select
                  value={sectionTitleStyles.backgroundSize || "cover"}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, backgroundSize: e.target.value }
                    })
                  }
                  className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Background Opacity</Label>
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parseInt(sectionTitleStyles.backgroundOpacity || "100")}
                    onChange={(e) =>
                      handleUpdateSection({
                        titleStyles: { ...sectionTitleStyles, backgroundOpacity: e.target.value }
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-center">
                    {parseInt(sectionTitleStyles.backgroundOpacity || "100")}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Borders</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionTitleStyles.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, borderColor: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionTitleStyles.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, borderColor: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Borders</Label>
            <select
              value={sectionTitleStyles.borderStyle || "all"}
              onChange={(e) =>
                handleUpdateSection({
                  titleStyles: { ...sectionTitleStyles, borderStyle: e.target.value }
                })
              }
              className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All sides</option>
              <option value="top">Top</option>
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={parseInt(sectionTitleStyles.borderWidth || "0")}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, borderWidth: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border radius</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="50"
                value={parseInt(sectionTitleStyles.borderRadius || "0")}
                onChange={(e) =>
                  handleUpdateSection({
                    titleStyles: { ...sectionTitleStyles, borderRadius: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Spacing</h3>
          <div>
            <Label className="text-xs font-semibold">Padding</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.paddingTop || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, paddingTop: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.paddingRight || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, paddingRight: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.paddingBottom || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, paddingBottom: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.paddingLeft || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, paddingLeft: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Margin</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.marginTop || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, marginTop: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.marginRight || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, marginRight: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.marginBottom || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, marginBottom: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionTitleStyles.marginLeft || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, marginLeft: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {isMultiColumn && (
            <div>
              <Label className="text-xs font-semibold">Gap Between Columns</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={String(typeof sectionTitleStyles.columnGap === "number" ? sectionTitleStyles.columnGap : 24)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 24 : parseInt(value, 10);
                    handleUpdateSection({
                      titleStyles: { ...sectionTitleStyles, columnGap: isNaN(numValue) ? 24 : numValue }
                    });
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground self-center">
                  px
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Spacing between columns (default: 24px)
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (selectedElementType === "section-content") {
    // Handle both old format (section-content-id) and new format (section-content-id-col1)
    let sectionId = selectedElementId.replace("section-content-", "");
    const colMatch = sectionId.match(/-col(\d+)$/);
    const columnIndex = colMatch ? parseInt(colMatch[1]) - 1 : -1; // col1 = index 0, col2 = index 1, etc.
    // Remove column identifier if present (e.g., "-col1", "-col2", "-col3")
    sectionId = sectionId.replace(/-col\d+$/, "");
    const section = proposal.sections.find((s) => s.id === sectionId);

    if (!section) return null;

    const handleUpdateSection = (updates: Partial<ProposalSection>) => {
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    const sectionContentStyles = (section as any).contentStyles || {};
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState<"image" | "video">("image");

    const handleAddMedia = () => {
      if (!mediaUrl.trim()) return;
      const newMedia = [...(section.media || []), { type: mediaType, url: mediaUrl }];
      handleUpdateSection({ media: newMedia });
      setMediaUrl("");
    };

    const handleRemoveMedia = (index: number) => {
      const newMedia = section.media!.filter((_, i) => i !== index);
      handleUpdateSection({ media: newMedia });
    };

    const currentContent = columnIndex >= 0
      ? ((section as any).columnContents?.[columnIndex] || "")
      : section.content;

    const handleContentChange = (value: string) => {
      if (columnIndex >= 0) {
        const newColumnContents = [...((section as any).columnContents || [])];
        newColumnContents[columnIndex] = value;
        handleUpdateSection({ columnContents: newColumnContents });
      } else {
        handleUpdateSection({ content: value });
      }
    };

    return (
      <Card className="p-4 space-y-4 overflow-y-auto max-h-[90vh]">
        <div>
          <Label className="text-xs font-semibold">Section Content {columnIndex >= 0 ? `(Column ${columnIndex + 1})` : ""}</Label>
          <div className="mt-2">
            <RichTextEditor
              value={currentContent}
              onChange={handleContentChange}
              variables={variables || []}
              placeholder="Enter your section content with rich text formatting..."
            />
          </div>
        </div>

        <Separator />

        {columnIndex >= 0 && (
          <>
            <div>
              <Label className="text-xs font-semibold mb-2 block">Column Styling</Label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Background Color</label>
                  <Input
                    type="color"
                    value={(section as any).columnStyles?.[columnIndex]?.backgroundColor || "#ffffff"}
                    onChange={(e) => {
                      const newColumnStyles = [...((section as any).columnStyles || [])];
                      newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], backgroundColor: e.target.value };
                      handleUpdateSection({ columnStyles: newColumnStyles });
                    }}
                    className="h-8 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">Border Width</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={(section as any).columnStyles?.[columnIndex]?.borderWidth || 0}
                      onChange={(e) => {
                        const newColumnStyles = [...((section as any).columnStyles || [])];
                        newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderWidth: parseInt(e.target.value) };
                        handleUpdateSection({ columnStyles: newColumnStyles });
                      }}
                      placeholder="0"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Border Color</label>
                    <Input
                      type="color"
                      value={(section as any).columnStyles?.[columnIndex]?.borderColor || "#000000"}
                      onChange={(e) => {
                        const newColumnStyles = [...((section as any).columnStyles || [])];
                        newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderColor: e.target.value };
                        handleUpdateSection({ columnStyles: newColumnStyles });
                      }}
                      className="h-8 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Border Radius</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={(section as any).columnStyles?.[columnIndex]?.borderRadius || 0}
                    onChange={(e) => {
                      const newColumnStyles = [...((section as any).columnStyles || [])];
                      newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderRadius: parseInt(e.target.value) };
                      handleUpdateSection({ columnStyles: newColumnStyles });
                    }}
                    placeholder="0"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block">Padding</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Top</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.paddingTop || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], paddingTop: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Right</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.paddingRight || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], paddingRight: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Bottom</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.paddingBottom || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], paddingBottom: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Left</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.paddingLeft || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], paddingLeft: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block">Margin</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Top</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.marginTop || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], marginTop: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Right</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.marginRight || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], marginRight: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Bottom</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.marginBottom || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], marginBottom: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Left</label>
                      <Input
                        type="number"
                        min="0"
                        value={(section as any).columnStyles?.[columnIndex]?.marginLeft || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], marginLeft: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        placeholder="0"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block">Background Image</label>
                  <Input
                    value={(section as any).columnStyles?.[columnIndex]?.backgroundImage || ""}
                    onChange={(e) => {
                      const newColumnStyles = [...((section as any).columnStyles || [])];
                      newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], backgroundImage: e.target.value };
                      handleUpdateSection({ columnStyles: newColumnStyles });
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="text-xs mt-2"
                  />
                </div>

                {(section as any).columnStyles?.[columnIndex]?.backgroundImage && (
                  <>
                    <div>
                      <label className="text-xs font-medium">Background Size</label>
                      <select
                        value={(section as any).columnStyles?.[columnIndex]?.backgroundSize || "cover"}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], backgroundSize: e.target.value };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Background Opacity</label>
                      <div className="flex gap-2 mt-2 items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt((section as any).columnStyles?.[columnIndex]?.backgroundOpacity || "100")}
                          onChange={(e) => {
                            const newColumnStyles = [...((section as any).columnStyles || [])];
                            newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], backgroundOpacity: e.target.value };
                            handleUpdateSection({ columnStyles: newColumnStyles });
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-center">
                          {parseInt((section as any).columnStyles?.[columnIndex]?.backgroundOpacity || "100")}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-xs font-semibold mb-2 block">Text Formatting</Label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium">Text Color</label>
                      <Input
                        type="color"
                        value={(section as any).columnStyles?.[columnIndex]?.color || "#000000"}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], color: e.target.value };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="h-8 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Font Size</label>
                      <Input
                        type="number"
                        min="8"
                        max="72"
                        value={(section as any).columnStyles?.[columnIndex]?.fontSize || 16}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], fontSize: e.target.value };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Text Align</label>
                      <select
                        value={(section as any).columnStyles?.[columnIndex]?.textAlign || "left"}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], textAlign: e.target.value };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], bold: !(section as any).columnStyles?.[columnIndex]?.bold };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        variant={(section as any).columnStyles?.[columnIndex]?.bold ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <strong>B</strong>
                      </Button>
                      <Button
                        onClick={() => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], italic: !(section as any).columnStyles?.[columnIndex]?.italic };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        variant={(section as any).columnStyles?.[columnIndex]?.italic ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <em>I</em>
                      </Button>
                      <Button
                        onClick={() => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], underline: !(section as any).columnStyles?.[columnIndex]?.underline };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        variant={(section as any).columnStyles?.[columnIndex]?.underline ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <u>U</u>
                      </Button>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Border Width</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={(section as any).columnStyles?.[columnIndex]?.borderWidth || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderWidth: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Border Color</label>
                      <Input
                        type="color"
                        value={(section as any).columnStyles?.[columnIndex]?.borderColor || "#000000"}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderColor: e.target.value };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="h-8 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Border Radius</label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={(section as any).columnStyles?.[columnIndex]?.borderRadius || 0}
                        onChange={(e) => {
                          const newColumnStyles = [...((section as any).columnStyles || [])];
                          newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], borderRadius: parseInt(e.target.value) };
                          handleUpdateSection({ columnStyles: newColumnStyles });
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        <div>
          <Label className="text-xs font-semibold mb-2 block">Media</Label>
          <div className="space-y-2 mb-3">
            <div className="flex gap-2">
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                className="text-xs"
              />
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as "image" | "video")}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <Button
                onClick={handleAddMedia}
                size="sm"
                className="flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {section.media && section.media.length > 0 && (
            <div className="space-y-2">
              {section.media.map((media, index) => (
                <div key={index} className="border rounded p-2 bg-muted/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium">{media.type.toUpperCase()}</span>
                    <Button
                      onClick={() => handleRemoveMedia(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    value={media.url}
                    onChange={(e) => {
                      const newMedia = [...section.media!];
                      newMedia[index] = { ...media, url: e.target.value };
                      handleUpdateSection({ media: newMedia });
                    }}
                    className="text-xs mb-2"
                  />
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="preview"
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-32 object-cover rounded bg-black"
                      onError={() => {}}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Text Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionContentStyles.color || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, color: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionContentStyles.color || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, color: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Font Size</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="12"
                max="72"
                value={parseInt(sectionContentStyles.fontSize || "16")}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, fontSize: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Text Alignment</Label>
            <div className="flex gap-2 mt-2">
              {(["left", "center", "right"] as const).map((align) => (
                <Button
                  key={align}
                  variant={
                    sectionContentStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, textAlign: align }
                    })
                  }
                  className="capitalize flex-1"
                >
                  {align}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Background</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionContentStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, backgroundColor: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionContentStyles.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, backgroundColor: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Image URL</Label>
            <Input
              value={sectionContentStyles.backgroundImage || ""}
              onChange={(e) =>
                handleUpdateSection({
                  contentStyles: { ...sectionContentStyles, backgroundImage: e.target.value }
                })
              }
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>
          {sectionContentStyles.backgroundImage && (
            <>
              <div>
                <Label className="text-xs font-semibold">Background Size</Label>
                <select
                  value={sectionContentStyles.backgroundSize || "cover"}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, backgroundSize: e.target.value }
                    })
                  }
                  className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Background Opacity</Label>
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parseInt(sectionContentStyles.backgroundOpacity || "100")}
                    onChange={(e) =>
                      handleUpdateSection({
                        contentStyles: { ...sectionContentStyles, backgroundOpacity: e.target.value }
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-center">
                    {parseInt(sectionContentStyles.backgroundOpacity || "100")}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Borders</h3>
          <div>
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={sectionContentStyles.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, borderColor: e.target.value }
                  })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={sectionContentStyles.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, borderColor: e.target.value }
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Borders</Label>
            <select
              value={sectionContentStyles.borderStyle || "all"}
              onChange={(e) =>
                handleUpdateSection({
                  contentStyles: { ...sectionContentStyles, borderStyle: e.target.value }
                })
              }
              className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All sides</option>
              <option value="top">Top</option>
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={parseInt(sectionContentStyles.borderWidth || "0")}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, borderWidth: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border radius</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="50"
                value={parseInt(sectionContentStyles.borderRadius || "0")}
                onChange={(e) =>
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, borderRadius: e.target.value }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">Spacing</h3>
          <div>
            <Label className="text-xs font-semibold">Padding</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.paddingTop || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, paddingTop: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.paddingRight || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, paddingRight: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.paddingBottom || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, paddingBottom: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.paddingLeft || "0")}
                  onChange={(e) =>
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, paddingLeft: e.target.value }
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Margin</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.marginTop || "0")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value, 10);
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, marginTop: String(isNaN(numValue) ? 0 : numValue) }
                    });
                  }}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.marginRight || "0")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value, 10);
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, marginRight: String(isNaN(numValue) ? 0 : numValue) }
                    });
                  }}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.marginBottom || "0")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value, 10);
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, marginBottom: String(isNaN(numValue) ? 0 : numValue) }
                    });
                  }}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min="0"
                  value={parseInt(sectionContentStyles.marginLeft || "0")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value, 10);
                    handleUpdateSection({
                      contentStyles: { ...sectionContentStyles, marginLeft: String(isNaN(numValue) ? 0 : numValue) }
                    });
                  }}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Gap After Section</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={String(typeof sectionContentStyles.gapAfter === "number" ? sectionContentStyles.gapAfter : 24)}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? 24 : parseInt(value, 10);
                  handleUpdateSection({
                    contentStyles: { ...sectionContentStyles, gapAfter: isNaN(numValue) ? 24 : numValue }
                  });
                }}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Spacing between this section and the next one (default: 24px)
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (selectedElementType === "image" || selectedElementType === "video") {
    const parts = selectedElementId.split("-");
    const sectionId = parts[1];
    const mediaIndex = parseInt(parts[2]);
    const section = proposal.sections.find((s) => s.id === sectionId);

    if (!section || !section.media || !section.media[mediaIndex]) return null;

    const media = section.media[mediaIndex];

    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Media URL</Label>
          <Input
            value={media.url}
            onChange={(e) => {
              const newMedia = [...(section.media || [])];
              newMedia[mediaIndex] = { ...media, url: e.target.value };
              const updatedProposal = {
                ...proposal,
                sections: proposal.sections.map((s) =>
                  s.id === sectionId ? { ...s, media: newMedia } : s
                ),
              };
              onUpdateProposal(updatedProposal);
            }}
            className="mt-2"
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold">Media Type</Label>
          <div className="mt-2 text-sm font-mono bg-muted p-2 rounded">
            {media.type.toUpperCase()}
          </div>
        </div>

        <div>
          {media.type === "image" ? (
            <img
              src={media.url}
              alt="preview"
              className="w-full h-40 object-cover rounded"
            />
          ) : (
            <video
              src={media.url}
              controls
              className="w-full h-40 object-cover rounded"
            />
          )}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const newMedia = section.media!.filter((_, i) => i !== mediaIndex);
            const updatedProposal = {
              ...proposal,
              sections: proposal.sections.map((s) =>
                s.id === sectionId ? { ...s, media: newMedia } : s
              ),
            };
            onUpdateProposal(updatedProposal);
            onRemoveMedia?.(sectionId, mediaIndex);
          }}
          className="w-full"
        >
          Remove Media
        </Button>
      </Card>
    );
  }

  if (selectedElementType === "shape") {
    const parts = selectedElementId.split("-");
    const sectionId = parts[1];
    const shapeIndex = parseInt(parts[2]);
    const section = proposal.sections.find((s) => s.id === sectionId);

    if (!section || !section.shapes || !section.shapes[shapeIndex]) {
      return (
        <Card className="p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Shape not found</p>
          </div>
        </Card>
      );
    }

    const shape = section.shapes[shapeIndex];

    const handleUpdateShape = (updates: Partial<typeof shape>) => {
      const newShapes = [...(section.shapes || [])];
      newShapes[shapeIndex] = { ...shape, ...updates };
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          s.id === sectionId ? { ...s, shapes: newShapes } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Shape Type</Label>
          <div className="flex gap-2 mt-2">
            {(["square", "circle", "triangle"] as const).map((type) => (
              <Button
                key={type}
                variant={shape.type === type ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdateShape({ type })}
                className="capitalize flex-1"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="10"
                max="500"
                value={shape.width}
                onChange={(e) =>
                  handleUpdateShape({ width: parseInt(e.target.value) || 100 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Height</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="10"
                max="500"
                value={shape.height}
                onChange={(e) =>
                  handleUpdateShape({ height: parseInt(e.target.value) || 100 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Background Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={shape.backgroundColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdateShape({ backgroundColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={shape.backgroundColor || "#e5e7eb"}
                onChange={(e) =>
                  handleUpdateShape({ backgroundColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Background Image URL</Label>
            <Input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={shape.backgroundImage || ""}
              onChange={(e) =>
                handleUpdateShape({ backgroundImage: e.target.value })
              }
              className="flex-1 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the full URL of an image. Leave empty to remove.
            </p>
          </div>

          {shape.backgroundImage && (
            <>
              <div>
                <Label className="text-xs font-semibold">Background Size</Label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={shape.backgroundSize || "cover"}
                    onChange={(e) =>
                      handleUpdateShape({ backgroundSize: e.target.value })
                    }
                    className="flex-1 px-2 py-1 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="100% 100%">Stretch</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Background Opacity</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={parseInt(shape.backgroundOpacity || "0")}
                    onChange={(e) =>
                      handleUpdateShape({ backgroundOpacity: e.target.value })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground self-center">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Adjust how much the background color overlays the image (0 = fully transparent, 100 = fully opaque)
                </p>
              </div>
            </>
          )}

          <div>
            <Label className="text-xs font-semibold">Border Width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={shape.borderWidth || 0}
                onChange={(e) =>
                  handleUpdateShape({ borderWidth: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={shape.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateShape({ borderColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={shape.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateShape({ borderColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          {shape.type !== "triangle" && (
            <div>
              <Label className="text-xs font-semibold">Border Radius</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={shape.borderRadius || 0}
                  onChange={(e) =>
                    handleUpdateShape({ borderRadius: parseInt(e.target.value) || 0 })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground self-center">
                  px
                </span>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold">Position - X</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                value={shape.left}
                onChange={(e) =>
                  handleUpdateShape({ left: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Position - Y</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                value={shape.top}
                onChange={(e) =>
                  handleUpdateShape({ top: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                px
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const newShapes = section.shapes!.filter((_, i) => i !== shapeIndex);
            const updatedProposal = {
              ...proposal,
              sections: proposal.sections.map((s) =>
                s.id === sectionId ? { ...s, shapes: newShapes } : s
              ),
            };
            onUpdateProposal(updatedProposal);
          }}
          className="w-full"
        >
          Remove Shape
        </Button>
      </Card>
    );
  }

  if (selectedElementType === "table") {
    const parts = selectedElementId.split("-");
    const sectionId = parts[1];
    const tableIndex = parseInt(parts[2]);
    const section = proposal.sections.find((s) => s.id === sectionId);

    if (!section || !section.tables || !section.tables[tableIndex]) {
      return (
        <Card className="p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Table not found</p>
          </div>
        </Card>
      );
    }

    const table = section.tables[tableIndex];

    const handleUpdateTable = (updates: Partial<typeof table>) => {
      const newTables = [...(section.tables || [])];
      newTables[tableIndex] = { ...table, ...updates };
      const updatedProposal = {
        ...proposal,
        sections: proposal.sections.map((s) =>
          s.id === sectionId ? { ...s, tables: newTables } : s
        ),
      };
      onUpdateProposal(updatedProposal);
    };

    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Table Dimensions</Label>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <Label className="text-xs">Rows</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={table.rows}
                onChange={(e) => {
                  const newRows = parseInt(e.target.value) || 1;
                  if (newRows !== table.rows) {
                    const newCells = Array.from({ length: newRows }, (_, rIdx) => {
                      if (rIdx < table.cells.length) {
                        return table.cells[rIdx];
                      }
                      return Array.from({ length: table.columns }, (_, cIdx) => ({
                        id: Math.random().toString(36).substring(2, 9),
                        content: "",
                      }));
                    });
                    handleUpdateTable({ rows: newRows, cells: newCells });
                  }
                }}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Columns</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={table.columns}
                onChange={(e) => {
                  const newCols = parseInt(e.target.value) || 1;
                  if (newCols !== table.columns) {
                    const newCells = table.cells.map((row) => {
                      if (newCols > row.length) {
                        return [
                          ...row,
                          ...Array.from({ length: newCols - row.length }, () => ({
                            id: Math.random().toString(36).substring(2, 9),
                            content: "",
                          })),
                        ];
                      } else {
                        return row.slice(0, newCols);
                      }
                    });
                    handleUpdateTable({ columns: newCols, cells: newCells });
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Border Width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="5"
                value={table.borderWidth}
                onChange={(e) =>
                  handleUpdateTable({ borderWidth: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Border Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={table.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateTable({ borderColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={table.borderColor || "#000000"}
                onChange={(e) =>
                  handleUpdateTable({ borderColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Header Background</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={table.headerBackground || "#f3f4f6"}
                onChange={(e) =>
                  handleUpdateTable({ headerBackground: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={table.headerBackground || "#f3f4f6"}
                onChange={(e) =>
                  handleUpdateTable({ headerBackground: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Cell Background</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={table.cellBackground || "#ffffff"}
                onChange={(e) =>
                  handleUpdateTable({ cellBackground: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={table.cellBackground || "#ffffff"}
                onChange={(e) =>
                  handleUpdateTable({ cellBackground: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Text Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={table.textColor || "#000000"}
                onChange={(e) =>
                  handleUpdateTable({ textColor: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={table.textColor || "#000000"}
                onChange={(e) =>
                  handleUpdateTable({ textColor: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Cell Padding</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                max="20"
                value={table.padding}
                onChange={(e) =>
                  handleUpdateTable({ padding: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Position - X</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                value={table.left}
                onChange={(e) =>
                  handleUpdateTable({ left: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Position - Y</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="0"
                value={table.top}
                onChange={(e) =>
                  handleUpdateTable({ top: parseInt(e.target.value) || 0 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Width</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="300"
                value={table.width}
                onChange={(e) =>
                  handleUpdateTable({ width: parseInt(e.target.value) || 300 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Height</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="200"
                value={table.height}
                onChange={(e) =>
                  handleUpdateTable({ height: parseInt(e.target.value) || 200 })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">px</span>
            </div>
          </div>
        </div>

        <Separator />

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const newTables = section.tables!.filter((_, i) => i !== tableIndex);
            const updatedProposal = {
              ...proposal,
              sections: proposal.sections.map((s) =>
                s.id === sectionId ? { ...s, tables: newTables } : s
              ),
            };
            onUpdateProposal(updatedProposal);
          }}
          className="w-full"
        >
          Remove Table
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Unable to edit this element</p>
      </div>
    </Card>
  );
};
