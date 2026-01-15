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
  const [activeTab, setActiveTab] = useState<"system" | "saved">("system");

  useEffect(() => {
    if (open) {
      setLoadingTemplates(true);
      setError(null);
      setTemplates([]);
      setActiveTab("system");
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

  // Separate templates into system and saved
  const systemTemplates = templates.filter((t) => {
    // Convert to number, handling string values
    let createdBy = typeof t.created_by === 'string' ? parseInt(t.created_by, 10) : (t.created_by ?? 0);
    if (isNaN(createdBy)) createdBy = 0;

    console.log(`Template "${t.title}" - raw created_by:`, t.created_by, "parsed createdBy:", createdBy, "is system:", createdBy === 0);
    return createdBy === 0;
  });

  const savedTemplates = templates.filter((t) => {
    // Convert to number, handling string values
    let createdBy = typeof t.created_by === 'string' ? parseInt(t.created_by, 10) : (t.created_by ?? 0);
    if (isNaN(createdBy)) createdBy = 0;

    return createdBy > 0;
  });

  console.log("TemplateSelectionModal - Total templates:", templates.length);
  console.log("TemplateSelectionModal - System templates:", systemTemplates.length);
  console.log("TemplateSelectionModal - Saved templates:", savedTemplates.length);

  // Auto-switch tab if current tab has no templates
  useEffect(() => {
    if (activeTab === "system" && systemTemplates.length === 0 && savedTemplates.length > 0) {
      setActiveTab("saved");
    } else if (activeTab === "saved" && savedTemplates.length === 0 && systemTemplates.length > 0) {
      setActiveTab("system");
    }
  }, [systemTemplates.length, savedTemplates.length, activeTab]);

  // Determine which templates to show based on active tab
  const displayedTemplates = activeTab === "system" ? systemTemplates : savedTemplates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
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
          <>
            {/* Tabs - Always show System Templates tab, optionally show Saved Templates */}
            {(systemTemplates.length > 0 || true) && (
              <div className="flex gap-2 mb-4 border-b">
                <button
                  onClick={() => setActiveTab("system")}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === "system"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  System Templates {systemTemplates.length > 0 && `(${systemTemplates.length})`}
                </button>
                {savedTemplates.length > 0 && (
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "saved"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Saved Templates ({savedTemplates.length})
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
              {/* Custom Design Card - show on system templates tab or if no system templates exist */}
              {(activeTab === "system" || systemTemplates.length === 0) && (
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow p-4 flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-300 hover:border-primary"
                  onClick={handleCustomDesign}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">✨</div>
                    <h3 className="text-sm font-semibold mb-1">Custom Design</h3>
                    <p className="text-xs text-muted-foreground">
                      Start from scratch
                    </p>
                  </div>
                </Card>
              )}

              {/* Template Cards */}
              {displayedTemplates.length > 0 ? (
                displayedTemplates.map((template) => {
                  const proposalForPreview = convertSystemTemplateToProposal(template);

                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col border hover:border-primary group"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {/* Template Preview Area */}
                      <div className="bg-white border-b overflow-hidden flex-shrink-0" style={{ height: "140px" }}>
                        {template.preview_image ? (
                          <img
                            src={template.preview_image}
                            alt={`${template.title} preview`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <TemplatePreviewRenderer
                            template={proposalForPreview}
                          />
                        )}
                      </div>

                      {/* Template Info Footer */}
                      <div className="p-2 bg-slate-50 flex-1 flex flex-col justify-between">
                        <div className="mb-1">
                          <h3 className="font-semibold text-xs text-slate-900 line-clamp-1">
                            {template.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {template.sections?.length || 0} section{(template.sections?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1 h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(template);
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    {activeTab === "system"
                      ? "No system templates available"
                      : "No saved templates available"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
