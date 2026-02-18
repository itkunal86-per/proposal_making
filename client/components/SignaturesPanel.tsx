import React from "react";
import { Card } from "@/components/ui/card";
import { PenTool } from "lucide-react";

interface SignaturesPanelProps {
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const SignaturesPanel: React.FC<SignaturesPanelProps> = () => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("signature/drag", "true");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Signature</h3>
        <p className="text-xs text-muted-foreground">
          Drag the signature icon to your proposal preview to place it.
        </p>
      </div>

      <Card
        draggable
        onDragStart={handleDragStart}
        className="p-6 cursor-grab active:cursor-grabbing border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors flex flex-col items-center gap-3"
      >
        <PenTool className="w-12 h-12 text-slate-400" />
        <div className="text-center">
          <p className="text-sm font-medium">Signature</p>
          <p className="text-xs text-muted-foreground mt-1">Drag to preview</p>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100">
        <p>
          • You can add multiple signatures to any section
          <br />
          • Drag them to position and resize as needed
          <br />
          • Delete signatures using the × button
        </p>
      </div>
    </div>
  );
};
