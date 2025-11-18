import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createVariable, updateVariable, deleteVariable, type Variable as ApiVariable } from "@/services/variablesService";

interface Variable {
  id: string | number;
  name: string;
  value: string;
}

interface VariablesPanelProps {
  proposalId: string;
  variables?: Variable[];
  onAddVariable?: (name: string) => void;
  onUpdateVariable?: (id: string, value: string) => void;
  onRemoveVariable?: (id: string) => void;
  onVariableCreated?: (variable: ApiVariable) => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  proposalId,
  variables = [
    { id: "1", name: "Name", value: "Landwise" },
    { id: "2", name: "Company Name", value: "" },
    { id: "3", name: "User Name", value: "Sams Roy" },
    { id: "4", name: "Company Name", value: "Hirenq" },
  ],
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
  onVariableCreated,
}) => {
  const [newVariableName, setNewVariableName] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string | number, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(null);

  const handleAddVariable = async () => {
    if (!newVariableName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await createVariable(proposalId, newVariableName);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        toast({
          title: "Success",
          description: `Variable "${newVariableName}" created successfully`,
        });
        setNewVariableName("");
        onVariableCreated?.(data);
        onAddVariable?.(newVariableName);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVariable = async (id: string | number, value: string) => {
    setUpdatingId(id);
    try {
      const { data, error } = await updateVariable(id, value);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setEditingValues((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        return;
      }

      if (data) {
        toast({
          title: "Success",
          description: "Variable updated successfully",
        });
        setEditingValues((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        onUpdateVariable?.(String(id), value);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setEditingValues((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const showDeleteConfirm = (id: string | number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteVariable = async () => {
    if (!deleteConfirm) return;

    const { id } = deleteConfirm;
    setDeletingId(id);
    try {
      const { success, error } = await deleteVariable(id);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        toast({
          title: "Success",
          description: "Variable deleted successfully",
        });
        onRemoveVariable?.(String(id));
        setExpandedId(null);
        setDeleteConfirm(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Variables
        <span className="text-sm font-normal text-slate-500 bg-slate-100 rounded px-2 py-1">
          [{variables.length}]
        </span>
      </h2>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <div className="text-blue-600 text-sm">
            <p className="font-medium mb-1">Add a Variable</p>
            <p className="text-xs">
              Just type { "{" } in the text to your left and your variables list
              will appear.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={newVariableName}
            onChange={(e) => setNewVariableName(e.target.value)}
            placeholder="Variable name"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleAddVariable();
              }
            }}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            onClick={handleAddVariable}
            size="sm"
            variant="outline"
            className="px-3"
            disabled={isLoading}
            type="button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Used Variables</h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {variables.map((variable) => (
            <div key={variable.id} className="border rounded-lg">
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === variable.id ? null : variable.id)
                  }
                  className="flex-1 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {variable.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedId === variable.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVariable(variable.id)}
                  disabled={deletingId === variable.id}
                  className="ml-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {expandedId === variable.id && (
                <div className="px-3 pb-3 border-t bg-slate-50">
                  <Input
                    value={editingValues[variable.id] ?? variable.value}
                    onChange={(e) =>
                      setEditingValues((prev) => ({
                        ...prev,
                        [variable.id]: e.target.value,
                      }))
                    }
                    onBlur={() => {
                      const newValue = editingValues[variable.id] ?? variable.value;
                      if (newValue !== variable.value) {
                        handleUpdateVariable(variable.id, newValue);
                      } else {
                        setEditingValues((prev) => {
                          const updated = { ...prev };
                          delete updated[variable.id];
                          return updated;
                        });
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const newValue = editingValues[variable.id] ?? variable.value;
                        if (newValue !== variable.value) {
                          handleUpdateVariable(variable.id, newValue);
                        } else {
                          setEditingValues((prev) => {
                            const updated = { ...prev };
                            delete updated[variable.id];
                            return updated;
                          });
                        }
                      }
                    }}
                    placeholder="Variable value"
                    className="text-sm"
                    disabled={updatingId === variable.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
