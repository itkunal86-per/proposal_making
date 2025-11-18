import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createVariable, type Variable as ApiVariable } from "@/services/variablesService";

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
              if (e.key === "Enter") {
                handleAddVariable();
              }
            }}
            className="text-sm"
          />
          <Button
            onClick={handleAddVariable}
            size="sm"
            variant="outline"
            className="px-3"
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
              <button
                onClick={() =>
                  setExpandedId(expandedId === variable.id ? null : variable.id)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
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

              {expandedId === variable.id && (
                <div className="px-3 pb-3 border-t bg-slate-50">
                  <Input
                    value={variable.value}
                    onChange={(e) =>
                      onUpdateVariable?.(variable.id, e.target.value)
                    }
                    placeholder="Variable value"
                    className="text-sm"
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
