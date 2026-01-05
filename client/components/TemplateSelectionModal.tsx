import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getActiveSystemTemplates, type SystemTemplate, convertSystemTemplateToProposal } from "@/services/systemTemplatesService";
import { TemplatePreviewRenderer } from "@/components/TemplatePreviewRenderer";

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: SystemTemplate | null) => void;
  isLoading?: boolean;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
  isLoading = false,
}) => {
  const [templates, setTemplates] = useState<SystemTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoadingTemplates(true);
      setError(null);
      setTemplates([]);
      loadTemplates();
    }
  }, [open]);

  async function loadTemplates() {
    setLoadingTemplates(true);
    setError(null);
    try {
      console.log("Loading active system templates...");
      const activeTemplates = await getActiveSystemTemplates();
      console.log("Loaded templates:", activeTemplates);
      setTemplates(activeTemplates);
      if (activeTemplates.length === 0) {
        console.warn("No active templates returned from API");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      setError(error instanceof Error ? error.message : "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }

  const handleSelectTemplate = (template: SystemTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const handleCustomDesign = () => {
    onSelectTemplate(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select from our pre-designed templates or start with a custom design
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 mb-4">
            {error}
          </div>
        )}

        {loadingTemplates || isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {/* Custom Design Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow p-6 flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed border-slate-300 hover:border-primary"
              onClick={handleCustomDesign}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-lg font-semibold mb-2">Custom Design</h3>
                <p className="text-sm text-muted-foreground">
                  Start from scratch with a blank canvas
                </p>
              </div>
            </Card>

            {/* Template Cards */}
            {templates.length > 0 ? (
              templates.map((template) => {
                const firstSection = template.sections?.[0];
                const previewText = firstSection?.content ||
                  (firstSection?.texts?.[0]?.content ?
                    firstSection.texts[0].content.replace(/<[^>]*>/g, '') :
                    "");

                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col border hover:border-primary"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {/* Template Preview Area */}
                    <div className="bg-white border-b p-4 min-h-[200px] flex flex-col relative">
                      {/* White background for proposal-like preview */}
                      <div className="absolute inset-0 bg-white"></div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Section Title */}
                        {firstSection?.title && (
                          <h4 className="font-semibold text-sm text-slate-900 mb-2">
                            {firstSection.title}
                          </h4>
                        )}

                        {/* Preview Content */}
                        <div className="text-xs text-slate-600 line-clamp-4 flex-1 leading-relaxed">
                          {previewText ? (
                            <p>{previewText.substring(0, 200)}{previewText.length > 200 ? '...' : ''}</p>
                          ) : (
                            <p className="text-muted-foreground italic">No content preview</p>
                          )}
                        </div>

                        {/* Images Preview */}
                        {firstSection?.images && firstSection.images.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {firstSection.images.slice(0, 2).map((img: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-12 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden text-xs flex items-center justify-center"
                              >
                                <span className="text-slate-400">🖼️</span>
                              </div>
                            ))}
                            {firstSection.images.length > 2 && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                +{firstSection.images.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template Info Footer */}
                    <div className="p-3 bg-slate-50 flex-1 flex flex-col justify-between">
                      <div className="mb-2">
                        <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {template.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.sections?.length || 0} section{(template.sections?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template);
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No active templates available</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
