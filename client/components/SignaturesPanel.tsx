import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignaturePanelProps {
  signatureRecipient?: string;
  onAddSignature?: () => void;
  onChangeRecipient?: (recipient: string) => void;
}

export const SignaturesPanel: React.FC<SignaturePanelProps> = ({
  signatureRecipient = "",
  onAddSignature,
  onChangeRecipient,
}) => {
  const [recipient, setRecipient] = useState(signatureRecipient);

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    onChangeRecipient?.(value);
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Signatures</h2>

      <div>
        <Label className="text-xs font-semibold block mb-2">
          Signatures for
        </Label>
        <Select value={recipient} onValueChange={handleRecipientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Start typing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="authorized-person">
              Authorized Person
            </SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onAddSignature}
        variant="outline"
        className="w-full h-auto py-4 flex flex-col items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
      >
        <PenTool className="w-6 h-6" />
        <span className="text-sm font-medium">Signature</span>
      </Button>
    </Card>
  );
};

// Import Label here since we're using it in the component
import { Label } from "@/components/ui/label";
