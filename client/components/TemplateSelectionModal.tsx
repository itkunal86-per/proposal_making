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
import { getActiveSystemTemplates, type SystemTemplate } from "@/services/systemTemplatesService";

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

        {loadingTemplates || isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Preview */}
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 min-h-[150px] flex flex-col justify-center">
                    <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3">
                      {template.description || `${template.sections?.length || 0} sections`}
                    </p>
                  </div>

                  {/* Template Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Sections: {template.sections?.length || 0}
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
              ))
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
