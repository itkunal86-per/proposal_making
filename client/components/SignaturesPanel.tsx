import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenTool, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Proposal, SignatureRecipient, SignatureField } from "@/services/proposalsService";
import { createSignatory, getSignatories, deleteSignatory, SignatoryData } from "@/services/signaturesService";

interface SignaturesPanelProps {
  proposal: Proposal;
  onUpdateProposal: (proposal: Proposal) => void;
  isAddingSignatureField?: boolean;
  selectedSignatoryId?: string | null;
  onStartAddingSignatureField?: (signatoryId: string) => void;
  onStopAddingSignatureField?: () => void;
}

export const SignaturesPanel: React.FC<SignaturesPanelProps> = ({
  proposal,
  onUpdateProposal,
  isAddingSignatureField = false,
  selectedSignatoryId = null,
  onStartAddingSignatureField,
  onStopAddingSignatureField,
}) => {
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "", role: "" });
  const [addingRecipient, setAddingRecipient] = useState(false);
  const [apiSignatories, setApiSignatories] = useState<SignatoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Fetch signatories on component mount
  useEffect(() => {
    const fetchSignatories = async () => {
      setIsLoading(true);
      try {
        const result = await getSignatories(proposal.id);
        if (result.success && result.data) {
          setApiSignatories(result.data);

          // Sync API signatories with proposal
          const converted: SignatureRecipient[] = result.data.map((s) => ({
            id: String(s.id),
            name: s.name,
            email: s.email,
            role: s.role,
            order: s.order,
          }));

          if (JSON.stringify(proposal.signatories) !== JSON.stringify(converted)) {
            onUpdateProposal({
              ...proposal,
              signatories: converted,
            });
          }
        } else {
          console.error("Failed to fetch signatories:", result.error);
        }
      } catch (error) {
        console.error("Error fetching signatories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignatories();
  }, [proposal.id, onUpdateProposal]);

  const signatories = proposal.signatories || [];

  // Aggregate all signature fields from all sections
  const allSignatureFields = proposal.sections.flatMap(s => s.signatureFields || []);

  const handleAddRecipient = async () => {
    if (!newRecipient.name || !newRecipient.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and email",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createSignatory({
        proposal_id: proposal.id,
        name: newRecipient.name,
        email: newRecipient.email,
        role: newRecipient.role,
        order: apiSignatories.length + 1,
      });

      if (result.success && result.data) {
        setApiSignatories([...apiSignatories, result.data]);

        // Update proposal with new signatory
        const recipient: SignatureRecipient = {
          id: String(result.data.id),
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
          order: result.data.order,
        };
        const updated = {
          ...proposal,
          signatories: [...signatories, recipient],
        };
        onUpdateProposal(updated);

        toast({
          title: "Success",
          description: `${result.data.name} added as signatory`,
        });

        setNewRecipient({ name: "", email: "", role: "" });
        setAddingRecipient(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add signatory",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add signatory",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveRecipient = async (apiId: number | string, localId: string) => {
    setIsDeletingId(apiId as number);
    try {
      const result = await deleteSignatory(apiId);

      if (result.success) {
        setApiSignatories(apiSignatories.filter((s) => s.id !== apiId));

        const updated = {
          ...proposal,
          signatories: signatories.filter((r) => r.id !== localId),
          sections: proposal.sections.map((s) => ({
            ...s,
            signatureFields: (s.signatureFields || []).filter((f) => f.recipientId !== localId),
          })),
        };
        onUpdateProposal(updated);

        toast({
          title: "Success",
          description: "Signatory removed",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove signatory",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove signatory",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };



  return (
    <Tabs defaultValue="recipients" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recipients">Recipients</TabsTrigger>
        <TabsTrigger value="fields">Fields</TabsTrigger>
      </TabsList>

      {/* TAB 1: RECIPIENTS */}
      <TabsContent value="recipients" className="space-y-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Loading signatories...</p>
            </div>
          ) : apiSignatories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No signatories added yet</p>
            </div>
          ) : (
            apiSignatories
              .sort((a, b) => parseInt(String(a.order)) - parseInt(String(b.order)))
              .map((signatory) => (
                <Card key={signatory.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{signatory.name}</div>
                      <div className="text-xs text-muted-foreground">{signatory.email}</div>
                      {signatory.role && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Role: {signatory.role}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(signatory.id!, String(signatory.id!))}
                      disabled={isDeletingId === signatory.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeletingId === signatory.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))
          )}
        </div>

        {addingRecipient ? (
          <Card className="p-4 space-y-3 border-blue-200 bg-blue-50">
            <div className="space-y-2">
              <Label htmlFor="recipient-name" className="text-xs font-semibold">
                Name
              </Label>
              <Input
                id="recipient-name"
                placeholder="John Doe"
                value={newRecipient.name}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-email" className="text-xs font-semibold">
                Email
              </Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="john@example.com"
                value={newRecipient.email}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-role" className="text-xs font-semibold">
                Role (optional)
              </Label>
              <Input
                id="recipient-role"
                placeholder="e.g., Manager, Director"
                value={newRecipient.role}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, role: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddRecipient}
                disabled={isCreating}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddingRecipient(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setAddingRecipient(true)}
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Signatory</span>
          </Button>
        )}
      </TabsContent>

      {/* TAB 2: FIELDS */}
      <TabsContent value="fields" className="space-y-4">
        {isAddingSignatureField ? (
          <div className="bg-blue-50 border border-blue-300 rounded p-3 space-y-3">
            <div className="text-sm text-blue-900 font-semibold">
              Adding signature field for: <span className="block mt-1">{signatories.find((s) => s.id === selectedSignatoryId)?.name || "Select signatory"}</span>
            </div>
            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
              Now click on the proposal editor to place the signature field at your desired location.
            </div>
            <Button
              variant="outline"
              onClick={onStopAddingSignatureField}
              className="w-full text-sm text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
        ) : apiSignatories.length > 0 ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select signatory to add field for:</Label>
              <Select value={selectedSignatoryId || ""} onValueChange={(id) => onStartAddingSignatureField?.(id)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a signatory..." />
                </SelectTrigger>
                <SelectContent>
                  {apiSignatories.map((signatory) => (
                    <SelectItem key={signatory.id} value={String(signatory.id)}>
                      {signatory.name} ({signatory.role || "No role"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
              Select a signatory above, then click on the proposal to place their signature field.
            </div>
          </>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-sm text-muted-foreground">
            <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Add at least one signatory in the Recipients tab first.</p>
          </div>
        )}

        {signatureFields.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold">Added fields</h3>
            {signatureFields.map((field) => {
              const recipient = signatories.find((r) => r.id === field.recipientId);
              return (
                <Card key={field.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{recipient?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">
                        {proposal.sections.find((s) => s.id === field.sectionId)?.title || "Unknown"}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        field.status === "signed"
                          ? "bg-green-100 text-green-700"
                          : field.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

    </Tabs>
  );
};
