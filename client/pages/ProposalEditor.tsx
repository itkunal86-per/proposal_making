import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  persistProposal,
  valueTotal,
} from "@/services/proposalsService";
import { updateSystemTemplate, getSystemTemplateDetails, type SystemTemplate } from "@/services/systemTemplatesService";
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
import { getSignatories } from "@/services/signaturesService";

interface DocumentSettings {
  company?: string;
  contact?: string;
  sender?: string;
  currency?: string;
}

export default function ProposalEditor() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const isSystemTemplateEdit = !!searchParams.get("templateId");
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
  const [textFormatting, setTextFormatting] = useState<Record<string, any>>({});
  const [addingSignatureMode, setAddingSignatureMode] = useState(false);
  const [selectedSignatoryId, setSelectedSignatoryId] = useState<string | null>(null);
  const [documentMedia, setDocumentMedia] = useState<Array<{ id: string; url: string; type: "image" | "video"; name: string }>>([]);
  const [libraryMedia, setLibraryMedia] = useState<Array<{ id: string; url: string; type: "image" | "video"; name: string }>>([]);
  const [variables, setVariables] = useState<Array<{ id: string | number; name: string; value: string }>>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);



  useEffect(() => {
    (async () => {
      try {
        let found: Proposal | null = null;

        // Check if this is a system template edit
        const templateId = searchParams.get("templateId");
        if (isSystemTemplateEdit && templateId) {
          const storedData = localStorage.getItem(`template_draft_${templateId}`);
          if (storedData) {
            found = JSON.parse(storedData) as Proposal;
            console.log("Loaded system template from localStorage:", found);
          } else {
            console.warn("Template data not found in localStorage");
            nav("/admin/templates/system");
            return;
          }
        } else {
          // Load regular proposal from API
          console.log("ProposalEditor: Loading proposal with id:", id);
          found = await getProposalDetails(id);
          console.log("ProposalEditor: getProposalDetails returned:", found);
          if (!found) {
            console.warn("ProposalEditor: Proposal not found, redirecting to /my/proposals");
            nav("/my/proposals");
            return;
          }
        }

        console.log("Loaded proposal:", {
          id: found.id,
          sections: found.sections.map(s => ({
            id: s.id,
            title: s.title,
            layout: s.layout,
            columnContents: (s as any).columnContents,
          })),
        });
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
      } catch (error) {
        console.error("Failed to load proposal:", error);
        toast({
          title: "Error",
          description: "Failed to load proposal. Please try again.",
          variant: "destructive",
        });
        nav("/my/proposals");
      }
    })();
  }, [id, nav, isSystemTemplateEdit, searchParams]);

  useEffect(() => {
    // Skip variables fetch for system template edits
    if (isSystemTemplateEdit) {
      setVariables([]);
      return;
    }

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
          const mappedVariables = data.map((v) => ({
            id: v.id,
            name: v.variable_name,
            value: v.variable_value,
          }));
          console.log("✅ Variables loaded from API:", mappedVariables.map(v => `${v.name}=${v.value}`));
          setVariables(mappedVariables);
          console.log("✅ setVariables called with", mappedVariables.length, "variables");
        } else {
          console.log("⚠️ fetchVariables returned no data");
        }
      } catch (error) {
        console.error("Failed to fetch variables:", error);
        setVariables([]);
      } finally {
        setIsLoadingVariables(false);
      }
    })();
  }, [id, isSystemTemplateEdit]);

  // Fetch and sync signatories when proposal is loaded (skip for template edits)
  useEffect(() => {
    if (!p || !p.id || isSystemTemplateEdit) return;

    const proposalId = p.id;

    (async () => {
      try {
        const result = await getSignatories(proposalId);
        // Check if proposal ID is still the same (in case it changed while fetching)
        if (p?.id !== proposalId) return;

        if (result.success && result.data) {
          // Sync API signatories with proposal
          const converted = result.data.map((s) => ({
            id: String(s.id),
            name: s.name,
            email: s.email,
            role: s.role,
            order: s.order,
          }));

          // Only update if different
          if (JSON.stringify(p.signatories) !== JSON.stringify(converted)) {
            setP((prevP) => ({
              ...prevP,
              signatories: converted,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch signatories:", error);
      }
    })();
  }, [p?.id, isSystemTemplateEdit]);

  function commit(next: Proposal, keepVersion = false, note?: string) {
    console.log("Proposal Edit Form Submitted:", next);
    setP(next);
    setSaving(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    // Persist immediately to localStorage to prevent data loss on page reload
    void persistProposal(next);

    saveTimer.current = window.setTimeout(() => {
      if (isSystemTemplateEdit) {
        // For system templates, call the update template API
        const templateId = searchParams.get("templateId");
        if (templateId) {
          const updateData = {
            title: next.title,
            status: (next.status === "draft" ? "Active" : "Inactive") as "Active" | "Inactive",
            client: next.client,
            client_id: next.client_id,
            sections: next.sections.map((s) => {
              const sectionData: any = {
                id: s.id,
                title: s.title,
                content: s.content || "",
                layout: s.layout || "",
                columnContents: s.columnContents || [],
                columnStyles: (s as any).columnStyles || [],
                media: s.media || [],
                contentStyles: (s as any).contentStyles || {},
                titleStyles: (s as any).titleStyles || {},
                texts: (s as any).texts || [],
                shapes: s.shapes || [],
                tables: s.tables || [],
                images: (s as any).images || [],
                signatureFields: s.signatureFields || [],
              };

              return sectionData;
            }),
            pricing: next.pricing,
            settings: next.settings,
            signatories: next.signatories,
            createdBy: next.createdBy,
            createdAt: next.createdAt,
            updatedAt: Date.now(),
            versions: next.versions,
          };
          void updateSystemTemplate(templateId, updateData).then((result) => {
            if (result.success) {
              toast({ title: "Template saved successfully" });
            } else {
              toast({ title: result.error || "Failed to save template", variant: "destructive" });
            }
            setSaving(false);
          });
        } else {
          setSaving(false);
        }
      } else {
        // For regular proposals, use the existing update logic
        void updateProposal(next, { keepVersion, note });
        setSaving(false);
      }
    }, 400);
  }

  const handleSectionNavigate = (sectionId: string) => {
    const sectionIndex = p?.sections.findIndex((s) => String(s.id) === String(sectionId));
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

  console.log("ProposalEditor render - variables and content:", {
    variablesCount: variables.length,
    variables: variables.map(v => ({ id: v.id, name: v.name, value: v.value })),
    sectionsWithContent: p.sections.map(s => ({
      id: s.id,
      title: s.title,
      contentLength: s.content?.length || 0,
      contentSample: s.content?.substring(0, 100) || "",
      columnContents: (s as any).columnContents?.map((c: string) => c?.substring(0, 50) || "") || [],
    })),
  });

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
              {!isSystemTemplateEdit && (
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
              )}
              <Select
                value={isSystemTemplateEdit ? (p.status === "draft" ? "Active" : "Inactive") : p.status}
                onValueChange={(v) => {
                  if (isSystemTemplateEdit) {
                    // For system templates, map Active/Inactive to proposal status
                    const newStatus = (v === "Active" ? "draft" : "sent") as ProposalStatus;
                    commit({ ...p, status: newStatus });
                  } else {
                    commit({ ...p, status: v as ProposalStatus });
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSystemTemplateEdit ? (
                    <>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </>
                  )}
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
              try {
                // Find the contentEditable element - try multiple selectors
                let contentEditableElement = document.querySelector('[data-testid="rich-text-editor"]') as HTMLElement;
                if (!contentEditableElement) {
                  contentEditableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                }
                if (contentEditableElement) {
                  // Save the current selection
                  const selection = window.getSelection();
                  let savedRange: Range | null = null;
                  if (selection && selection.rangeCount > 0) {
                    savedRange = selection.getRangeAt(0).cloneRange();
                  }

                  // Focus and restore selection
                  contentEditableElement.focus();
                  if (savedRange) {
                    selection?.removeAllRanges();
                    selection?.addRange(savedRange);
                  }

                  // Execute command
                  document.execCommand(format, false);
                  toast({
                    title: format === "undo" ? "Undo" : "Redo",
                    description: format === "undo" ? "Last action undone" : "Last action redone",
                  });
                } else {
                  toast({
                    title: "No editor active",
                    description: "Please click in the editor to activate it first",
                  });
                }
              } catch (error) {
                console.error(`Failed to execute ${format}:`, error);
              }
              return;
            }

            // Handle content formatting commands (heading2, bulletList, numberList, blockquote)
            const contentFormats = ["heading2", "bulletList", "numberList", "blockquote"];
            if (contentFormats.includes(format)) {
              try {
                // Find the contentEditable element - try multiple selectors
                let contentEditableElement = document.querySelector('[data-testid="rich-text-editor"]') as HTMLElement;
                console.log("Searched for [data-testid='rich-text-editor']:", contentEditableElement);

                if (!contentEditableElement) {
                  contentEditableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                  console.log("Searched for [contenteditable='true']:", contentEditableElement);
                }

                if (!contentEditableElement) {
                  contentEditableElement = document.querySelector('[contenteditable]') as HTMLElement;
                  console.log("Searched for [contenteditable]:", contentEditableElement);
                }

                console.log("Final found element:", contentEditableElement);
                console.log("All contenteditable elements in document:", document.querySelectorAll('[contenteditable]'));

                if (contentEditableElement) {
                  // Save the current selection
                  const selection = window.getSelection();
                  console.log("Current selection:", selection);
                  let savedRange: Range | null = null;
                  if (selection && selection.rangeCount > 0) {
                    savedRange = selection.getRangeAt(0).cloneRange();
                    console.log("Saved range from selection");
                  } else if (contentEditableElement) {
                    // If no selection, create range at the end
                    const range = document.createRange();
                    range.selectNodeContents(contentEditableElement);
                    range.collapse(false);
                    savedRange = range;
                    console.log("Created new range at end of editor");
                  }

                  // Focus the editor
                  contentEditableElement.focus();
                  console.log("Focused editor");

                  // Restore selection before executing command
                  if (savedRange) {
                    selection?.removeAllRanges();
                    selection?.addRange(savedRange);
                    console.log("Restored selection");
                  }

                  // Execute command immediately (no setTimeout)
                  let command = "";
                  let value_param = "";
                  if (format === "heading2") {
                    command = "formatBlock";
                    value_param = "<h2>";
                  } else if (format === "bulletList") {
                    command = "insertUnorderedList";
                  } else if (format === "numberList") {
                    command = "insertOrderedList";
                  } else if (format === "blockquote") {
                    command = "formatBlock";
                    value_param = "<blockquote>";
                  }

                  if (command) {
                    const result = document.execCommand(command, false, value_param);
                    console.log(`execCommand("${command}", false, "${value_param}") returned:`, result);
                    console.log("Editor content after command:", contentEditableElement.innerHTML);

                    toast({
                      title: "Formatting applied",
                      description: `${format} applied successfully`,
                    });
                  }
                } else {
                  console.log("No contentEditable element found");
                  toast({
                    title: "No editor active",
                    description: "Please click in the editor to activate it first",
                  });
                }
              } catch (error) {
                console.error(`Failed to execute ${format}:`, error);
                toast({
                  title: "Error",
                  description: `Failed to apply ${format}`,
                });
              }
              return;
            }

            if (selectedElementId && selectedElementType) {
              if (selectedElementType === "title") {
                const updated = { ...p, titleStyles: { ...(p as any).titleStyles, [format]: value } };
                commit(updated);
              } else if (selectedElementType === "section-title") {
                // Handle both old format (section-title-id) and new format (section-title-id-colX if needed)
                let sectionId = selectedElementId.replace("section-title-", "");
                sectionId = sectionId.replace(/-col\d+$/, "");
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? { ...s, titleStyles: { ...(s as any).titleStyles, [format]: value } }
                        : s
                    ),
                  };
                  commit(updated);
                }
              } else if (selectedElementType === "section-content") {
                // Handle both old format (section-content-id) and new format (section-content-id-col1)
                let sectionId = selectedElementId.replace("section-content-", "");
                const colMatch = sectionId.match(/-col(\d+)$/);
                const columnIndex = colMatch ? parseInt(colMatch[1]) - 1 : -1; // col1 = index 0, col2 = index 1, etc.
                sectionId = sectionId.replace(/-col\d+$/, "");
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? columnIndex >= 0
                          ? {
                              ...s,
                              columnStyles: ((s as any).columnStyles || []).map((style: any, idx: number) =>
                                idx === columnIndex ? { ...style, [format]: value } : style
                              ),
                            }
                          : { ...s, contentStyles: { ...(s as any).contentStyles, [format]: value } }
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
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Editor Preview */}
          <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-6">
            <ProposalPreview
              proposal={p}
              selectedElementId={selectedElementId}
              onSelectElement={(elementId, elementType) => {
                setSelectedElementId(elementId);
                setSelectedElementType(elementType);
                setActivePanel("properties");
              }}
              onAIElement={(id, type) => {
                setAIElementId(id);
                setAIElementType(type);
                setAIDialogOpen(true);
              }}
              onDeleteContent={(sectionId, columnIndex) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? columnIndex !== undefined
                        ? {
                            ...s,
                            columnContents: ((s as any).columnContents || []).map((content: string, idx: number) =>
                              idx === columnIndex ? "" : content
                            ),
                          }
                        : { ...s, content: "" }
                      : s
                  ),
                };
                commit(updated);
              }}
              variables={variables}
              onAddShape={(sectionId, shapeType, x, y) => {
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const newShape = {
                    id: Math.random().toString(36).substring(2, 9),
                    type: shapeType as "square" | "circle" | "triangle",
                    width: 100,
                    height: 100,
                    backgroundColor: "#e5e7eb",
                    backgroundImage: undefined,
                    backgroundSize: "cover",
                    backgroundOpacity: "0",
                    borderWidth: 2,
                    borderColor: "#6b7280",
                    borderRadius: 0,
                    left: Math.round(x),
                    top: Math.round(y),
                  };
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? { ...s, shapes: [...(s.shapes || []), newShape] }
                        : s
                    ),
                  };
                  commit(updated);
                  setSelectedElementId(`shape-${sectionId}-${(section.shapes || []).length}`);
                  setSelectedElementType("shape");
                  setActivePanel("properties");
                }
              }}
              onUpdateShape={(sectionId, shapeIndex, updates) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          shapes: (s.shapes || []).map((shape, idx) =>
                            idx === shapeIndex ? { ...shape, ...updates } : shape
                          ),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onAddTable={(sectionId, x, y) => {
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const createTableCells = (rows: number, cols: number) => {
                    return Array.from({ length: rows }, (_, rIdx) =>
                      Array.from({ length: cols }, (_, cIdx) => ({
                        id: Math.random().toString(36).substring(2, 9),
                        content: rIdx === 0 ? `Header ${cIdx + 1}` : "",
                      }))
                    );
                  };

                  const newTable = {
                    id: Math.random().toString(36).substring(2, 9),
                    rows: 3,
                    columns: 3,
                    cells: createTableCells(3, 3),
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    headerBackground: "#f3f4f6",
                    cellBackground: "#ffffff",
                    textColor: "#000000",
                    padding: 8,
                    width: 500,
                    height: 300,
                    left: Math.round(x),
                    top: Math.round(y),
                  };
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? { ...s, tables: [...(s.tables || []), newTable] }
                        : s
                    ),
                  };
                  commit(updated);
                  setSelectedElementId(`table-${sectionId}-${(section.tables || []).length}`);
                  setSelectedElementType("table");
                  setActivePanel("properties");
                }
              }}
              onUpdateTable={(sectionId, tableIndex, updates) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          tables: (s.tables || []).map((table, idx) =>
                            idx === tableIndex ? { ...table, ...updates } : table
                          ),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onAddText={(sectionId, x, y) => {
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const newText = {
                    id: Math.random().toString(36).substring(2, 9),
                    content: "Double-click to edit text",
                    fontSize: "16",
                    color: "#000000",
                    fontWeight: false,
                    backgroundColor: "#ffffff",
                    backgroundOpacity: "100",
                    borderColor: "#d1d5db",
                    borderWidth: "1",
                    borderRadius: "4",
                    paddingTop: "8",
                    paddingRight: "8",
                    paddingBottom: "8",
                    paddingLeft: "8",
                    width: 200,
                    left: Math.round(x),
                    top: Math.round(y),
                  };
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? { ...s, texts: [...((s as any).texts || []), newText] }
                        : s
                    ),
                  };
                  commit(updated);
                  setSelectedElementId(`text-${sectionId}-${((section as any).texts || []).length}`);
                  setSelectedElementType("text");
                  setActivePanel("properties");
                }
              }}
              onUpdateText={(sectionId, textIndex, updates) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          texts: ((s as any).texts || []).map((text: any, idx: number) =>
                            idx === textIndex ? { ...text, ...updates } : text
                          ),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onAddImage={(sectionId, x, y) => {
                const section = p.sections.find((s) => String(s.id) === String(sectionId));
                if (section) {
                  const newImage = {
                    id: Math.random().toString(36).substring(2, 9),
                    url: "",
                    width: 200,
                    height: 150,
                    opacity: "100",
                    borderWidth: 0,
                    borderColor: "#000000",
                    borderRadius: 0,
                    left: Math.round(x),
                    top: Math.round(y),
                  };
                  const updated = {
                    ...p,
                    sections: p.sections.map((s) =>
                      String(s.id) === String(sectionId)
                        ? { ...s, images: [...((s as any).images || []), newImage] }
                        : s
                    ),
                  };
                  commit(updated);
                  setSelectedElementId(`image-${sectionId}-${((section as any).images || []).length}`);
                  setSelectedElementType("image");
                  setActivePanel("properties");
                }
              }}
              onUpdateImage={(sectionId, imageIndex, updates) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          images: ((s as any).images || []).map((image: any, idx: number) =>
                            idx === imageIndex ? { ...image, ...updates } : image
                          ),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onUpdateSignatureField={(sectionId, fieldId, updates) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          signatureFields: (s.signatureFields || []).map((field) =>
                            field.id === fieldId ? { ...field, ...updates } : field
                          ),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onDeleteSignatureField={(sectionId, fieldId) => {
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          signatureFields: (s.signatureFields || []).filter((field) => field.id !== fieldId),
                        }
                      : s
                  ),
                };
                commit(updated);
              }}
              onAddSignatureField={(sectionId, recipientId, x, y) => {
                const newField = {
                  id: 0,
                  recipientId,
                  sectionId,
                  width: 200,
                  height: 80,
                  top: y,
                  left: x,
                  status: "pending" as const,
                  borderColor: "#d1d5db",
                  borderWidth: 2,
                  borderRadius: 4,
                };
                const updated = {
                  ...p,
                  sections: p.sections.map((s) =>
                    String(s.id) === String(sectionId)
                      ? {
                          ...s,
                          signatureFields: [...(s.signatureFields || []), newField],
                        }
                      : s
                  ),
                };
                commit(updated);
                setAddingSignatureMode(false);
                setSelectedSignatoryId(null);
              }}
              isAddingSignatureMode={addingSignatureMode}
              selectedSignatoryId={selectedSignatoryId}
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
                onOpenAI={() => {
                  if (selectedElementId && selectedElementType) {
                    setAIElementId(selectedElementId);
                    setAIElementType(selectedElementType);
                    setAIDialogOpen(true);
                  }
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
                proposalId={p.id}
                documentMedia={documentMedia}
                libraryMedia={libraryMedia}
                onMediaUploaded={handleMediaUploaded}
                onMediaRemoved={handleMediaRemoved}
              />
            ) : activePanel === "signatures" ? (
              <SignaturesPanel
                proposal={p}
                onUpdateProposal={commit}
                isAddingSignatureField={addingSignatureMode}
                selectedSignatoryId={selectedSignatoryId}
                onStartAddingSignatureField={(signatoryId) => {
                  setAddingSignatureMode(true);
                  setSelectedSignatoryId(signatoryId);
                }}
                onStopAddingSignatureField={() => {
                  setAddingSignatureMode(false);
                  setSelectedSignatoryId(null);
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
        isTemplateEdit={isSystemTemplateEdit}
        onSelectSection={(index) => {
          setCurrent(index);
          setSectionsDialogOpen(false);
        }}
        onSelectElement={(elementId, elementType) => {
          setSelectedElementId(elementId);
          setSelectedElementType(elementType);
          setActivePanel("properties");
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
