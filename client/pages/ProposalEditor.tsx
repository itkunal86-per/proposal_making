import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  getProposalDetails,
  updateProposal,
  valueTotal,
} from "@/services/proposalsService";
import { type ClientRecord, listClients } from "@/services/clientsService";
import { ProposalPreview } from "@/components/ProposalPreview";
import { ProposalPreviewModal } from "@/components/ProposalPreviewModal";
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
import { fetchVariables, type Variable as ApiVariable } from "@/services/variablesService";

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
  const [documentMedia, setDocumentMedia] = useState<Array<{ id: string; url: string; type: "image" | "video"; name: string }>>([]);
  const [libraryMedia, setLibraryMedia] = useState<Array<{ id: string; url: string; type: "image" | "video"; name: string }>>([]);
  const [variables, setVariables] = useState<Array<{ id: string | number; name: string; value: string }>>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const found = await getProposalDetails(id);
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

  useEffect(() => {
    (async () => {
      setIsLoadingVariables(true);
      try {
        const { data, error } = await fetchVariables(id);
        if (error) {
          console.error("Failed to fetch variables:", error);
          setVariables([]);
          return;
        }
        if (data) {
          setVariables(
            data.map((v) => ({
              id: v.id,
              name: v.variable_name,
              value: v.variable_value,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch variables:", error);
        setVariables([]);
      } finally {
        setIsLoadingVariables(false);
      }
    })();
  }, [id]);

  function commit(next: Proposal, keepVersion = false, note?: string) {
    console.log("Proposal Edit Form Submitted:", next);
    setP(next);
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void updateProposal(next, { keepVersion, note });
      setSaving(false);
    }, 400);
  }

  const handleSectionNavigate = (sectionId: string) => {
    const sectionIndex = p?.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex !== undefined && sectionIndex !== -1) {
      setCurrent(sectionIndex);

      // Scroll to the section element
      setTimeout(() => {
        const sectionElement = previewContainerRef.current?.querySelector(
          `[data-section-id="${sectionId}"]`
        );
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const handleMediaUploaded = useCallback((media: { id: string; url: string; type: "image" | "video"; name: string }, destination: "document" | "library") => {
    if (destination === "document") {
      setDocumentMedia((prev) => {
        const exists = prev.some((m) => m.id === media.id);
        return exists ? prev : [...prev, media];
      });
    } else {
      setLibraryMedia((prev) => {
        const exists = prev.some((m) => m.id === media.id);
        return exists ? prev : [...prev, media];
      });
    }
  }, []);

  const handleMediaRemoved = useCallback((mediaId: string, destination: "document" | "library") => {
    if (destination === "document") {
      setDocumentMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } else {
      setLibraryMedia((prev) => prev.filter((m) => m.id !== mediaId));
    }
  }, []);

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
                onValueChange={(value) => {
                  const selectedClient = clients.find((c) => c.name === value);
                  commit({ ...p, client: value, client_id: selectedClient?.id });
                }}
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
                onClick={() => setShowPreviewModal(true)}
                variant="outline"
                size="sm"
              >
                Preview Proposal
              </Button>
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

        {/* Text Formatting Toolbar */}
        <TextFormattingToolbar
          sections={p.sections.map((s) => ({ id: s.id, title: s.title }))}
          onSectionSelect={handleSectionNavigate}
          onFormatChange={(format, value) => {
            setTextFormatting((prev) => ({ ...prev, [format]: value }));

            // Handle undo/redo
            if (format === "undo" || format === "redo") {
              toast({
                title: format === "undo" ? "Undo" : "Redo",
                description: "History tracking will be available in a future update",
              });
              return;
            }

            if (selectedElementId && selectedElementType) {
              if (selectedElementType === "title") {
                const updated = { ...p, titleStyles: { ...(p as any).titleStyles, [format]: value } };
                commit(updated);
              } else if (selectedElementType === "section-title") {
                const parts = selectedElementId.split("-");
                const sectionId = parts[2];
                const section = p.sections.find((s) => s.id === sectionId);
                if (section) {
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      s.id === sectionId
                        ? { ...s, titleStyles: { ...(s as any).titleStyles, [format]: value } }
                        : s
                    ),
                  };
                  commit(updated);
                }
              } else if (selectedElementType === "section-content") {
                // Handle both old format (section-content-id) and new format (section-content-id-col1)
                let sectionId = selectedElementId.replace("section-content-", "");
                sectionId = sectionId.replace(/-col\d+$/, "");
                const section = p.sections.find((s) => s.id === sectionId);
                if (section) {
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      s.id === sectionId
                        ? { ...s, contentStyles: { ...(s as any).contentStyles, [format]: value } }
                        : s
                    ),
                  };
                  commit(updated);
                }
              }
            }
          }}
        />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Editor Preview */}
          <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-6">
            <ProposalPreview
              proposal={p}
              selectedElementId={selectedElementId}
              onSelectElement={(id, type) => {
                setSelectedElementId(id);
                setSelectedElementType(type);
                setActivePanel("properties");
              }}
              onAIElement={(id, type) => {
                setAIElementId(id);
                setAIElementType(type);
                setAIDialogOpen(true);
              }}
              variables={variables}
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
                variables={variables}
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
                proposalId={p.id}
                documentMedia={documentMedia}
                libraryMedia={libraryMedia}
                onMediaUploaded={handleMediaUploaded}
                onMediaRemoved={handleMediaRemoved}
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
                proposalId={p.id}
                variables={variables}
                onAddVariable={(name) => {
                  console.log("Add variable:", name);
                }}
                onUpdateVariable={(id, value) => {
                  setVariables((prev) =>
                    prev.map((v) => (String(v.id) === id ? { ...v, value } : v))
                  );
                }}
                onRemoveVariable={(id) => {
                  setVariables((prev) => prev.filter((v) => String(v.id) !== id));
                }}
                onVariableCreated={(variable: ApiVariable) => {
                  setVariables((prev) => [
                    ...prev,
                    {
                      id: variable.id,
                      name: variable.variable_name,
                      value: variable.variable_value,
                    },
                  ]);
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

      {showPreviewModal && (
        <ProposalPreviewModal
          proposal={p}
          variables={variables}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
}
