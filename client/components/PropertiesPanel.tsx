import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Proposal, ProposalSection } from "@/services/proposalsService";

interface ElementStyle {
  color?: string;
  fontSize?: string;
  textAlign?: "left" | "center" | "right";
}

interface PropertiesPanelProps {
  proposal: Proposal;
  selectedElementId: string | null;
  selectedElementType: string | null;
  onUpdateProposal: (proposal: Proposal) => void;
  onRemoveMedia?: (sectionId: string, mediaIndex: number) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  proposal,
  selectedElementId,
  selectedElementType,
  onUpdateProposal,
  onRemoveMedia,
}) => {
  const [elementStyles, setElementStyles] = useState<ElementStyle>({});

  if (!selectedElementId || !selectedElementType) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </Card>
    );
  }

  if (selectedElementType === "title") {
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
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
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
                value={parseInt(elementStyles.fontSize || "32")}
                onChange={(e) =>
                  setElementStyles({
                    ...elementStyles,
                    fontSize: e.target.value,
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
                    elementStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setElementStyles({
                      ...elementStyles,
                      textAlign: align,
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
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
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
                value={parseInt(elementStyles.fontSize || "24")}
                onChange={(e) =>
                  setElementStyles({
                    ...elementStyles,
                    fontSize: e.target.value,
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
                    elementStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setElementStyles({
                      ...elementStyles,
                      textAlign: align,
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

    return (
      <Card className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
        <div>
          <Label className="text-xs font-semibold">Section Content</Label>
          <Textarea
            value={section.content}
            onChange={(e) => handleUpdateSection({ content: e.target.value })}
            className="mt-2 min-h-[200px]"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Text Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
                }
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={elementStyles.color || "#000000"}
                onChange={(e) =>
                  setElementStyles({ ...elementStyles, color: e.target.value })
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
                value={parseInt(elementStyles.fontSize || "16")}
                onChange={(e) =>
                  setElementStyles({
                    ...elementStyles,
                    fontSize: e.target.value,
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
                    elementStyles.textAlign === align ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setElementStyles({
                      ...elementStyles,
                      textAlign: align,
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
