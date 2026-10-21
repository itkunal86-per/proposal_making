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
    <div data-scroll-owner="left-controls" className="editor-nav flex min-h-0 w-full flex-col items-center gap-1.5 overflow-y-auto border-b py-2 md:border-b-0 md:border-r">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSections}
        title="Manage sections"
        className="editor-nav-btn"
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenAI}
        title="AI Assistant"
        className="editor-nav-btn"
      >
        <Sparkles className="w-4 h-4" />
      </Button>

      <div className="editor-nav-divider border-t border-slate-200 w-full" />

      <div className="flex flex-col items-center">
        {panelButtons.map(({ id, icon: Icon, title }) => (
          <Button
            key={id}
            variant="ghost"
            size="icon"
            onClick={() => onSelectPanel(id as PanelType)}
            title={title}
            data-active={activePanel === id ? "true" : "false"}
            className="editor-nav-btn"
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      <div className="editor-nav-spacer mt-auto" />

      <Link to={`/proposals/${proposalId}/settings`}>
        <Button
          variant="ghost"
          size="icon"
          title="Settings"
          className="editor-nav-btn"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </Link>

      <a href={backToDealUrl}>
        <Button
          variant="ghost"
          size="icon"
          title="Back to list"
          className="editor-nav-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </a>
    </div>
  );
};
