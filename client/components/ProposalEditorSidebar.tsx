import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { List, Settings, ArrowLeft, Sparkles, Layers, Upload, PenTool, Variable } from "lucide-react";

export type PanelType = "properties" | "document" | "build" | "uploads" | "signatures" | "variables";

interface ProposalEditorSidebarProps {
  onOpenSections: () => void;
  onOpenAI: () => void;
  onSelectPanel: (panel: PanelType) => void;
  activePanel: PanelType;
  proposalId: string;
  dealId?: string | number;
  isTemplateEdit?: boolean;
}

export const ProposalEditorSidebar: React.FC<ProposalEditorSidebarProps> = ({
  onOpenSections,
  onOpenAI,
  onSelectPanel,
  activePanel,
  proposalId,
  dealId,
  isTemplateEdit = false,
}) => {
  const mainAppUrl = (import.meta.env.VITE_MAIN_APP_URL ?? "https://pitchsuite.io/").replace(/\/+$/, "");
  const backToDealUrl = dealId === undefined || dealId === null || dealId === ""
    ? `${mainAppUrl}#proposals`
    : `${mainAppUrl}/deals/${encodeURIComponent(String(dealId))}#proposals`;
  const allPanelButtons = [
    // { id: "document", icon: FileText, title: "Document" },
    { id: "build", icon: Layers, title: "Build" },
    { id: "uploads", icon: Upload, title: "Uploads" },
    { id: "signatures", icon: PenTool, title: "Signatures" },
    { id: "variables", icon: Variable, title: "Variables" },
  ] as const;

  // Filter out signatures and variables for template editing
  const panelButtons = isTemplateEdit
    ? allPanelButtons.filter((btn) => btn.id !== "signatures" && btn.id !== "variables")
    : allPanelButtons;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-white flex flex-col items-center py-4 gap-4 border-r border-slate-200 z-40">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSections}
        title="Manage sections"
        className="text-[#373530] hover:text-[#373530] hover:bg-[#373530]/10"
      >
        <List className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenAI}
        title="AI Assistant"
        className="text-[#373530] hover:text-[#373530] hover:bg-[#373530]/10"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      <div className="border-t border-slate-200 w-full" />

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
                ? "text-[#373530] bg-[#373530]/10 hover:bg-[#373530]/15"
                : "text-[#373530] hover:text-[#373530] hover:bg-[#373530]/10"
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
          className="text-[#373530] hover:text-[#373530] hover:bg-[#373530]/10"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </Link>

      <a href={backToDealUrl}>
        <Button
          variant="ghost"
          size="icon"
          title="Back to list"
          className="text-[#373530] hover:text-[#373530] hover:bg-[#373530]/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </a>
    </div>
  );
};
