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
import { Proposal, addSection, removeSection, reorderSection, getProposal } from "@/services/proposalsService";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  onUpdateProposal: (proposal: Proposal) => void;
}

export const SectionsDialog: React.FC<SectionsDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  currentSectionIndex,
  onSelectSection,
  onUpdateProposal,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAddSection = async () => {
    try {
      setLoading(true);
      const title = `Section ${proposal.sections.length + 1}`;
      await addSection(proposal, title);
      const np = await getProposal(proposal.id);
      if (np) {
        onUpdateProposal(np);
        toast({ title: "Section added", description: "New section has been created." });
      }
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
      await removeSection(proposal, id);
      const np = await getProposal(proposal.id);
      if (np) {
        onUpdateProposal(np);
        toast({ title: "Section deleted", description: "Section has been removed." });
      }
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
      await reorderSection(proposal, from, to);
      const np = await getProposal(proposal.id);
      if (np) {
        onUpdateProposal(np);
      }
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

        <Button onClick={handleAddSection} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </DialogContent>
    </Dialog>
  );
};
