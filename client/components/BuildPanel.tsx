import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Image, Video, Table, Square } from "lucide-react";

interface BuildPanelProps {
  onAddContent?: (type: "text" | "image" | "video" | "table" | "shape") => void;
  onShapeDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const BuildPanel: React.FC<BuildPanelProps> = ({ onAddContent }) => {
  const contentTypes = [
    {
      id: "text",
      label: "Text",
      icon: Type,
      description: "Add text content",
    },
    {
      id: "image",
      label: "Image",
      icon: Image,
      description: "Add an image",
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
      description: "Embed a video",
    },
    {
      id: "table",
      label: "Table",
      icon: Table,
      description: "Insert a table",
    },
    {
      id: "shape",
      label: "Shape",
      icon: Square,
      description: "Add a shape",
    },
  ];

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Build</h2>

      <div className="grid grid-cols-2 gap-3">
        {contentTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Button
              key={type.id}
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 p-4"
              onClick={() =>
                onAddContent?.(type.id as "text" | "image" | "video" | "table" | "shape")
              }
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-sm font-medium">{type.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
