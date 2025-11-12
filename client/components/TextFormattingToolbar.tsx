import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Strikethrough,
  Code,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TextFormattingToolbarProps {
  onFormatChange?: (format: string, value: any) => void;
  selectedText?: string;
}

export const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({
  onFormatChange,
}) => {
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("normal-text");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const toggleFormat = (format: string) => {
    const newFormats = new Set(activeFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setActiveFormats(newFormats);
    onFormatChange?.(format, newFormats.has(format));
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    onFormatChange?.("fontSize", value);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    onFormatChange?.("fontFamily", value);
  };

  const handleTextAlignChange = (align: "left" | "center" | "right") => {
    setTextAlign(align);
    onFormatChange?.("textAlign", align);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border-b border-slate-200 flex-wrap">
      {/* Text Style Dropdown */}
      <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
        <SelectTrigger className="w-32 h-9 border-0 bg-slate-50 hover:bg-slate-100 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="normal-text">Normal Text</SelectItem>
          <SelectItem value="work-sans">Work Sans</SelectItem>
          <SelectItem value="georgia">Georgia</SelectItem>
          <SelectItem value="courier">Courier New</SelectItem>
          <SelectItem value="arial">Arial</SelectItem>
          <SelectItem value="times-new-roman">Times New Roman</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-slate-200" />

      {/* Font Size Dropdown */}
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger className="w-16 h-9 border-0 bg-slate-50 hover:bg-slate-100 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-slate-200" />

      {/* Text Formatting Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("bold")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("bold")}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("italic")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("italic")}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("underline")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("underline")}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("strikethrough")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("strikethrough")}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      {/* Alignment Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          textAlign === "left" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100"
        }`}
        onClick={() => handleTextAlignChange("left")}
        title="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          textAlign === "center" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100"
        }`}
        onClick={() => handleTextAlignChange("center")}
        title="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          textAlign === "right" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100"
        }`}
        onClick={() => handleTextAlignChange("right")}
        title="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      {/* List Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("bulletList")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("bulletList")}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("numberList")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("numberList")}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      {/* Link & Code Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-slate-100"
        title="Insert link"
      >
        <Link className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("code")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("code")}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      {/* Undo/Redo Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-slate-100"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-slate-100"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
