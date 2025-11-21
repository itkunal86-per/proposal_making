import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Columns2, Columns3, LayoutList } from "lucide-react";

export type SectionLayout = "single" | "two-column" | "three-column";

interface SectionTemplate {
  id: SectionLayout;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

interface SectionTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (title: string, layout: SectionLayout) => void;
  loading?: boolean;
}

const templates: SectionTemplate[] = [
  {
    id: "single",
    name: "Single Column",
    description: "Full-width single column layout",
    icon: <LayoutList className="w-5 h-5" />,
    preview: (
      <div className="flex flex-col gap-2 p-3">
        <div className="h-2 bg-slate-300 rounded" />
        <div className="h-2 bg-slate-300 rounded" />
        <div className="h-2 bg-slate-200 rounded w-2/3" />
      </div>
    ),
  },
  {
    id: "two-column",
    name: "Two Columns",
    description: "Two-column layout for side-by-side content",
    icon: <Columns2 className="w-5 h-5" />,
    preview: (
      <div className="flex gap-2 p-3">
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-2 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-2 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    ),
  },
  {
    id: "three-column",
    name: "Three Columns",
    description: "Three-column layout for multiple sections",
    icon: <Columns3 className="w-5 h-5" />,
    preview: (
      <div className="flex gap-2 p-3">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-200 rounded" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-200 rounded" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-300 rounded" />
          <div className="h-1.5 bg-slate-200 rounded w-5/6" />
        </div>
      </div>
    ),
  },
];

export const SectionTemplateDialog: React.FC<SectionTemplateDialogProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
  loading = false,
}) => {
  const [sectionTitle, setSectionTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<SectionLayout | null>(
    null
  );

  const handleConfirm = () => {
    if (selectedTemplate && sectionTitle.trim()) {
      onSelectTemplate(sectionTitle, selectedTemplate);
      setSectionTitle("");
      setSelectedTemplate(null);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSectionTitle("");
      setSelectedTemplate(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Choose a section layout and enter a title
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <Input
              placeholder="e.g., Overview, Scope, Timeline"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedTemplate && sectionTitle.trim()) {
                  handleConfirm();
                }
              }}
              autoFocus
            />
          </div>

          {/* Layout Templates */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Layout</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-xl ${
                          selectedTemplate === template.id
                            ? "text-blue-600"
                            : "text-slate-600"
                        }`}
                      >
                        {template.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-slate-500">
                          {template.description}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 bg-slate-50 rounded border border-slate-200">
                      {template.preview}
                    </div>
                  </div>

                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplate || !sectionTitle.trim() || loading}
          >
            {loading ? "Creating..." : "Create Section"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
