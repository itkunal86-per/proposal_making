import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Proposal, addSection, removeSection, reorderSection } from "@/services/proposalsService";
import { SectionTemplateDialog, type SectionLayout } from "@/components/SectionTemplateDialog";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Simple UUID generator (same as in proposalsService)
function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface SectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  onUpdateProposal: (proposal: Proposal) => void;
  onSelectElement?: (elementId: string, elementType: string) => void;
  isTemplateEdit?: boolean;
}

export const SectionsDialog: React.FC<SectionsDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  currentSectionIndex,
  onSelectSection,
  onUpdateProposal,
  onSelectElement,
  isTemplateEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Local-only version for template edits (no API calls)
  const addSectionLocal = (p: Proposal, title = "New Section", layout: SectionLayout = "single"): Proposal => {
    const columnCount = layout === "two-column" ? 2 : layout === "three-column" ? 3 : 0;
    const columnContents = columnCount > 0 ? Array(columnCount).fill("") : undefined;
    const columnStyles = columnCount > 0 ? Array(columnCount).fill({
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    }) : undefined;
    const titleStyles = columnCount > 0 ? { columnGap: 0 } : {};
    const contentStyles = { gapAfter: 10 };

    const newSection = {
      id: uuid(),
      title,
      content: "",
      layout,
      columnContents,
      columnStyles,
      titleStyles,
      contentStyles,
      media: [],
      shapes: [],
      tables: [],
      texts: [],
      images: [],
      comments: []
    };

    console.log("addSectionLocal: Creating new section:", {
      sectionId: newSection.id,
      title,
      layout,
      columnCount
    });

    return {
      ...p,
      sections: [...p.sections, newSection],
      updatedAt: Date.now(),
    };
  };

  // Local-only version for template edits (no API calls)
  const removeSectionLocal = (p: Proposal, id: string): Proposal => {
    return {
      ...p,
      sections: p.sections.filter((s) => s.id !== id),
      updatedAt: Date.now(),
    };
  };

  // Local-only version for template edits (no API calls)
  const reorderSectionLocal = (p: Proposal, from: number, to: number): Proposal => {
    const sections = [...p.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    return {
      ...p,
      sections,
      updatedAt: Date.now(),
    };
  };

  const handleAddSection = async (title: string, layout: SectionLayout) => {
    try {
      setLoading(true);
      const updated = isTemplateEdit
        ? addSectionLocal(proposal, title, layout)
        : await addSection(proposal, title, layout);

      console.log("✅ Section added:", {
        newSection: updated.sections[updated.sections.length - 1],
        totalSections: updated.sections.length,
        sectionIds: updated.sections.map(s => s.id),
        isTemplateEdit,
      });

      onUpdateProposal(updated);
      setTemplateDialogOpen(false);
      toast({ title: "Section added", description: `New ${layout} section has been created. Click on it to edit.` });
    } catch (error) {
      console.error("Error adding section:", error);
      toast({ title: "Error", description: "Failed to add section.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSection = async (index: number) => {
    try {
      setLoading(true);
      const id = proposal.sections[index].id;
      const updated = isTemplateEdit
        ? removeSectionLocal(proposal, id)
        : await removeSection(proposal, id);
      onUpdateProposal(updated);
      toast({ title: "Section deleted", description: "Section has been removed." });
    } catch (error) {
      console.error("Error removing section:", error);
      toast({ title: "Error", description: "Failed to delete section.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReorderSection = async (from: number, to: number) => {
    try {
      setLoading(true);
      const updated = isTemplateEdit
        ? reorderSectionLocal(proposal, from, to)
        : await reorderSection(proposal, from, to);
      onUpdateProposal(updated);
    } catch (error) {
      console.error("Error reordering section:", error);
      toast({ title: "Error", description: "Failed to reorder sections.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Sections</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {proposal.sections.map((section, index) => (
            <div
              key={section.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                index === currentSectionIndex
                  ? "bg-blue-50 border-blue-300"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => {
                onSelectSection(index);
                onOpenChange(false);
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{section.title}</p>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index > 0) {
                      handleReorderSection(index, index - 1);
                    }
                  }}
                  disabled={index === 0 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index < proposal.sections.length - 1) {
                      handleReorderSection(index, index + 1);
                    }
                  }}
                  disabled={index === proposal.sections.length - 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(index);
                  }}
                  disabled={proposal.sections.length === 1 || loading}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <Button onClick={() => setTemplateDialogOpen(true)} disabled={loading} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>

        <SectionTemplateDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={handleAddSection}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
