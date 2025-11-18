import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { X, Plus } from "lucide-react";
import { VariableInserter } from "@/components/VariableInserter";

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
        </div>
      </Card>
    );
  }

  if (selectedElementType === "section-content") {
    const sectionId = selectedElementId.replace("section-content-", "");
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

    return (
      <Card className="p-4 space-y-4 overflow-y-auto max-h-[90vh]">
        <div>
          <Label className="text-xs font-semibold">Section Content</Label>
          <Textarea
            value={section.content}
            onChange={(e) => handleUpdateSection({ content: e.target.value })}
            className="mt-2 min-h-[120px]"
          />
        </div>

        <Separator />

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

  return (
    <Card className="p-4">
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Unable to edit this element</p>
      </div>
    </Card>
  );
};
