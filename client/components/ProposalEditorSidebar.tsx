import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { List, Settings, ArrowLeft, Sparkles, FileText, Layers, Upload, PenTool, Variable } from "lucide-react";

export type PanelType = "properties" | "document" | "build" | "uploads" | "signatures" | "variables";

interface ProposalEditorSidebarProps {
  onOpenSections: () => void;
  onOpenAI: () => void;
  onSelectPanel: (panel: PanelType) => void;
  activePanel: PanelType;
  proposalId: string;
}

export const ProposalEditorSidebar: React.FC<ProposalEditorSidebarProps> = ({
  onOpenSections,
  onOpenAI,
  onSelectPanel,
  activePanel,
  proposalId,
}) => {
  const panelButtons = [
    { id: "document", icon: FileText, title: "Document" },
    { id: "build", icon: Layers, title: "Build" },
    { id: "uploads", icon: Upload, title: "Uploads" },
    { id: "signatures", icon: PenTool, title: "Signatures" },
    { id: "variables", icon: Variable, title: "Variables" },
  ] as const;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 border-r border-slate-700 z-40">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSections}
        title="Manage sections"
        className="text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <List className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenAI}
        title="AI Assistant"
        className="text-slate-300 hover:text-white hover:bg-slate-800"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      <div className="border-t border-slate-700 w-full" />

      <div className="flex flex-col items-center gap-2">
        {panelButtons.map(({ id, icon: Icon, title }) => (
          <Button
            key={id}
            variant="ghost"
            size="icon"
            onClick={() => onSelectPanel(id as PanelType)}
            title={title}
            className={`transition-colors ${
              activePanel === id
                ? "text-white bg-slate-700 hover:bg-slate-600"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-6 h-6" />
          </Button>
        ))}
      </div>

      <div className="flex-1" />

      <Link to={`/proposals/${proposalId}/settings`}>
        <Button
          variant="ghost"
          size="icon"
          title="Settings"
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </Link>

      <Link to="/proposals">
        <Button
          variant="ghost"
          size="icon"
          title="Back to list"
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
};
