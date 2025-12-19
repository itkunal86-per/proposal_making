import React, { useState } from "react";
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
import { PenTool, Trash2, Plus } from "lucide-react";
import { Proposal, SignatureRecipient, SignatureField } from "@/services/proposalsService";

interface SignaturesPanelProps {
  proposal: Proposal;
  onUpdateProposal: (proposal: Proposal) => void;
}

export const SignaturesPanel: React.FC<SignaturesPanelProps> = ({
  proposal,
  onUpdateProposal,
}) => {
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "", role: "" });
  const [addingRecipient, setAddingRecipient] = useState(false);

  const signatories = proposal.signatories || [];
  const signatureFields = proposal.signatureFields || [];

  const handleAddRecipient = () => {
    if (!newRecipient.name || !newRecipient.email) {
      alert("Please fill in name and email");
      return;
    }

    const recipient: SignatureRecipient = {
      id: Math.random().toString(36).substring(2, 9),
      name: newRecipient.name,
      email: newRecipient.email,
      role: newRecipient.role,
      order: signatories.length + 1,
    };

    const updated = {
      ...proposal,
      signatories: [...signatories, recipient],
    };
    onUpdateProposal(updated);
    setNewRecipient({ name: "", email: "", role: "" });
    setAddingRecipient(false);
  };

  const handleRemoveRecipient = (id: string) => {
    const updated = {
      ...proposal,
      signatories: signatories.filter((r) => r.id !== id),
      signatureFields: signatureFields.filter((f) => f.recipientId !== id),
    };
    onUpdateProposal(updated);
  };

  const handleUpdateRecipientOrder = (id: string, newOrder: number) => {
    const updated = {
      ...proposal,
      signatories: signatories.map((r) =>
        r.id === id ? { ...r, order: newOrder } : r
      ),
    };
    onUpdateProposal(updated);
  };

  const getSignatureStatusCount = (status: "pending" | "signed" | "declined") => {
    return signatureFields.filter((f) => f.status === status).length;
  };

  return (
    <Tabs defaultValue="recipients" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="recipients">Recipients</TabsTrigger>
        <TabsTrigger value="fields">Fields</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
      </TabsList>

      {/* TAB 1: RECIPIENTS */}
      <TabsContent value="recipients" className="space-y-4">
        <div className="space-y-3">
          {signatories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No signatories added yet</p>
            </div>
          ) : (
            signatories
              .sort((a, b) => a.order - b.order)
              .map((recipient) => (
                <Card key={recipient.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{recipient.name}</div>
                      <div className="text-xs text-muted-foreground">{recipient.email}</div>
                      {recipient.role && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Role: {recipient.role}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Order:</Label>
                    <Select
                      value={String(recipient.order)}
                      onValueChange={(value) =>
                        handleUpdateRecipientOrder(recipient.id, parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {signatories.map((_, idx) => (
                          <SelectItem key={idx} value={String(idx + 1)}>
                            {idx + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add
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
        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded p-3">
          <p className="font-semibold text-blue-900 mb-1">How to add signature fields:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Click in the proposal to select where you want the signature</li>
            <li>Use the "Add Signature" button below to place a field</li>
            <li>Select which signatory should sign at that location</li>
          </ol>
        </div>

        <div className="space-y-3">
          {signatureFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No signature fields added yet</p>
            </div>
          ) : (
            signatureFields.map((field) => {
              const recipient = signatories.find((r) => r.id === field.recipientId);
              return (
                <Card key={field.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {recipient?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Section: {proposal.sections.find((s) => s.id === field.sectionId)?.title || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Position: ({field.left}, {field.top})
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded ${
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
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {signatories.length > 0 && (
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            disabled
            title="Click on the proposal to add a signature field. This button is for reference only."
          >
            <PenTool className="w-5 h-5" />
            <span className="text-sm font-medium">Add Signature Field (Click on proposal)</span>
          </Button>
        )}

        {signatories.length === 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-muted-foreground">
            Add at least one signatory in the Recipients tab first.
          </div>
        )}
      </TabsContent>

      {/* TAB 3: STATUS */}
      <TabsContent value="status" className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {getSignatureStatusCount("pending")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {getSignatureStatusCount("signed")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Signed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {getSignatureStatusCount("declined")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Declined</div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Signature Details</h3>
          <div className="space-y-3">
            {signatureFields.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No signatures to track yet</p>
              </div>
            ) : (
              signatureFields
                .sort((a, b) => {
                  const recipientA = signatories.find((r) => r.id === a.recipientId);
                  const recipientB = signatories.find((r) => r.id === b.recipientId);
                  return (recipientA?.order || 0) - (recipientB?.order || 0);
                })
                .map((field) => {
                  const recipient = signatories.find((r) => r.id === field.recipientId);
                  return (
                    <div key={field.id} className="pb-3 border-b last:pb-0 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            {recipient?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {recipient?.email}
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
                      {field.signedAt && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Signed: {new Date(field.signedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
