import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { List, Settings, ArrowLeft, Sparkles } from "lucide-react";

interface ProposalEditorSidebarProps {
  onOpenSections: () => void;
  onOpenAI: () => void;
  proposalId: string;
}

export const ProposalEditorSidebar: React.FC<ProposalEditorSidebarProps> = ({
  onOpenSections,
  onOpenAI,
  proposalId,
}) => {
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
