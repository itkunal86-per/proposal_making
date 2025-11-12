import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  type Proposal,
  type ProposalStatus,
  getProposal,
  updateProposal,
  valueTotal,
} from "@/services/proposalsService";
import { type ClientRecord, listClients } from "@/services/clientsService";
import { ProposalPreview } from "@/components/ProposalPreview";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { ProposalEditorSidebar, type PanelType } from "@/components/ProposalEditorSidebar";
import { SectionsDialog } from "@/components/SectionsDialog";
import { AIAssistantDialog } from "@/components/AIAssistantDialog";
import { DocumentPanel } from "@/components/DocumentPanel";
import { BuildPanel } from "@/components/BuildPanel";
import { UploadsPanel } from "@/components/UploadsPanel";
import { SignaturesPanel } from "@/components/SignaturesPanel";
import { VariablesPanel } from "@/components/VariablesPanel";
import { TextFormattingToolbar } from "@/components/TextFormattingToolbar";

interface DocumentSettings {
  company?: string;
  contact?: string;
  sender?: string;
  currency?: string;
}

export default function ProposalEditor() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Proposal | null>(null);
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<string | null>(null);
  const [sectionsDialogOpen, setSectionsDialogOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [aiElementId, setAIElementId] = useState<string | undefined>(undefined);
  const [aiElementType, setAIElementType] = useState<string | undefined>(undefined);
  const [activePanel, setActivePanel] = useState<PanelType>("properties");
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({});
  const [signatureRecipient, setSignatureRecipient] = useState("");
  const [textFormatting, setTextFormatting] = useState<Record<string, any>>({});
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const found = await getProposal(id);
      if (!found) {
        nav("/proposals");
        return;
      }
      setP(found);

      try {
        setIsLoadingClients(true);
        const clientsList = await listClients();
        setClients(clientsList);
      } catch (error) {
        console.error("Failed to load clients:", error);
      } finally {
        setIsLoadingClients(false);
      }
    })();
  }, [id, nav]);

  function commit(next: Proposal, keepVersion = false, note?: string) {
    setP(next);
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void updateProposal(next, { keepVersion, note });
      setSaving(false);
    }, 400);
  }

  if (!p) return null;

  const section = p.sections[current];

  return (
    <div className="flex h-screen bg-slate-50">
      <ProposalEditorSidebar
        proposalId={p.id}
        onOpenSections={() => setSectionsDialogOpen(true)}
        onOpenAI={() => setAIDialogOpen(true)}
        onSelectPanel={setActivePanel}
        activePanel={activePanel}
      />

      <div className="flex-1 flex flex-col ml-16">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Input
                value={p.title}
                onChange={(e) => commit({ ...p, title: e.target.value })}
                className="flex-1 max-w-md"
                placeholder="Proposal title"
              />
              <Select
                value={p.client}
                onValueChange={(value) => commit({ ...p, client: value })}
                disabled={isLoadingClients}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name} ({client.company || "No company"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={p.status}
                onValueChange={(v: ProposalStatus) =>
                  commit({ ...p, status: v })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              {section && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="ml-2 font-medium">{section.title}</span>
                </div>
              )}
              <Button
                onClick={() => {
                  setAIElementId(undefined);
                  setAIElementType(undefined);
                  setAIDialogOpen(true);
                }}
                variant="outline"
                size="sm"
              >
                Ask AI
              </Button>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {saving ? "Saving..." : "Saved"}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Editor Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            <ProposalPreview
              proposal={p}
              selectedElementId={selectedElementId}
              onSelectElement={(id, type) => {
                setSelectedElementId(id);
                setSelectedElementType(type);
              }}
              onAIElement={(id, type) => {
                setAIElementId(id);
                setAIElementType(type);
                setAIDialogOpen(true);
              }}
            />
          </div>

          {/* Properties Panel */}
          <div className="w-96 overflow-y-auto p-6 border-l border-slate-200 bg-white">
            {activePanel === "properties" ? (
              <PropertiesPanel
                proposal={p}
                selectedElementId={selectedElementId}
                selectedElementType={selectedElementType}
                onUpdateProposal={(updated) => commit(updated)}
                onRemoveMedia={() => {
                  setSelectedElementId(null);
                  setSelectedElementType(null);
                }}
              />
            ) : activePanel === "document" ? (
              <DocumentPanel
                documentSettings={documentSettings}
                onUpdateSettings={(settings) => setDocumentSettings(settings)}
              />
            ) : activePanel === "build" ? (
              <BuildPanel
                onAddContent={(type) => {
                  console.log("Add content:", type);
                }}
              />
            ) : activePanel === "uploads" ? (
              <UploadsPanel
                documentMedia={[]}
                libraryMedia={[]}
                onUpload={(file, destination) => {
                  console.log("Upload:", file, destination);
                }}
              />
            ) : activePanel === "signatures" ? (
              <SignaturesPanel
                signatureRecipient={signatureRecipient}
                onChangeRecipient={setSignatureRecipient}
                onAddSignature={() => {
                  console.log("Add signature");
                }}
              />
            ) : activePanel === "variables" ? (
              <VariablesPanel
                variables={[
                  { id: "1", name: "Name", value: "Landwise" },
                  { id: "2", name: "Company Name", value: "" },
                  { id: "3", name: "User Name", value: "Sams Roy" },
                  { id: "4", name: "Company Name", value: "Hirenq" },
                ]}
                onAddVariable={(name) => {
                  console.log("Add variable:", name);
                }}
                onUpdateVariable={(id, value) => {
                  console.log("Update variable:", id, value);
                }}
                onRemoveVariable={(id) => {
                  console.log("Remove variable:", id);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SectionsDialog
        open={sectionsDialogOpen}
        onOpenChange={setSectionsDialogOpen}
        proposal={p}
        currentSectionIndex={current}
        onSelectSection={(index) => {
          setCurrent(index);
          setSectionsDialogOpen(false);
        }}
        onUpdateProposal={(updated) => {
          setP(updated);
          commit(updated);
        }}
      />

      <AIAssistantDialog
        open={aiDialogOpen}
        onOpenChange={setAIDialogOpen}
        proposal={p}
        sectionId={section?.id}
        elementId={aiElementId}
        elementType={aiElementType}
        onUpdateProposal={(updated) => {
          setP(updated);
          commit(updated);
        }}
      />
    </div>
  );
}
