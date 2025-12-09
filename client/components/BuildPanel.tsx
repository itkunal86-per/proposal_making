import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Image, Video, Table, Square } from "lucide-react";

interface BuildPanelProps {
  onAddContent?: (type: "text" | "image" | "video" | "table" | "shape") => void;
  onShapeDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onTableDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onTextDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const BuildPanel: React.FC<BuildPanelProps> = ({ onAddContent, onShapeDragStart, onTableDragStart, onTextDragStart }) => {
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);

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
      draggable: true,
    },
    {
      id: "shape",
      label: "Shape",
      icon: Square,
      description: "Add a shape",
      draggable: true,
    },
  ];

  const handleShapeDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "shape", shapeType: "square" }));
    setIsDraggingShape(true);
    onShapeDragStart?.(e);
  };

  const handleTableDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "table" }));
    setIsDraggingTable(true);
    onTableDragStart?.(e);
  };

  const handleDragEnd = () => {
    setIsDraggingShape(false);
    setIsDraggingTable(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Build</h2>

      <div className="grid grid-cols-2 gap-3">
        {contentTypes.map((type) => {
          const IconComponent = type.icon;
          const isShape = type.id === "shape";
          const isTable = type.id === "table";

          if (isShape) {
            return (
              <div
                key={type.id}
                draggable
                onDragStart={handleShapeDragStart}
                onDragEnd={handleDragEnd}
                className={`flex flex-col items-center gap-2 p-4 h-auto border border-slate-200 rounded-md cursor-move hover:bg-slate-50 transition-colors ${isDraggingShape ? "opacity-50" : ""}`}
                title="Drag to add a shape"
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            );
          } else if (isTable) {
            return (
              <div
                key={type.id}
                draggable
                onDragStart={handleTableDragStart}
                onDragEnd={handleDragEnd}
                className={`flex flex-col items-center gap-2 p-4 h-auto border border-slate-200 rounded-md cursor-move hover:bg-slate-50 transition-colors ${isDraggingTable ? "opacity-50" : ""}`}
                title="Drag to add a table"
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            );
          } else {
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
          }
        })}
      </div>
    </Card>
  );
};
