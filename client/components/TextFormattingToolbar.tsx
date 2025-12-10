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
  ChevronDown,
  Heading2,
  Quote,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Section {
  id: string;
  title: string;
}

interface TextFormattingToolbarProps {
  onFormatChange?: (format: string, value: any) => void;
  selectedText?: string;
  sections?: Section[];
  onSectionSelect?: (sectionId: string) => void;
}

export const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({
  onFormatChange,
  sections = [],
  onSectionSelect,
}) => {
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("normal-text");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showSectionsMenu, setShowSectionsMenu] = useState(false);

  const toggleFormat = (format: string) => {
    const newFormats = new Set(activeFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setActiveFormats(newFormats);

    // Try to apply inline formatting to contentEditable element
    try {
      let contentEditableElement = document.querySelector('[data-testid="rich-text-editor"]') as HTMLElement;
      if (!contentEditableElement) {
        contentEditableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      }

      if (contentEditableElement) {
        const selection = window.getSelection();
        let savedRange: Range | null = null;
        if (selection && selection.rangeCount > 0) {
          savedRange = selection.getRangeAt(0).cloneRange();
        }

        contentEditableElement.focus();
        if (savedRange) {
          selection?.removeAllRanges();
          selection?.addRange(savedRange);
        }

        let command = "";
        if (format === "bold") {
          command = "bold";
        } else if (format === "italic") {
          command = "italic";
        } else if (format === "underline") {
          command = "underline";
        } else if (format === "strikethrough") {
          command = "strikeThrough";
        } else if (format === "code") {
          command = "formatBlock";
        }

        if (command) {
          if (command === "formatBlock") {
            document.execCommand(command, false, "<code>");
          } else {
            document.execCommand(command, false);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to apply inline formatting ${format}:`, error);
    }

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

    // Try to apply alignment to contentEditable element
    try {
      let contentEditableElement = document.querySelector('[data-testid="rich-text-editor"]') as HTMLElement;
      if (!contentEditableElement) {
        contentEditableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      }

      if (contentEditableElement) {
        const selection = window.getSelection();
        let savedRange: Range | null = null;
        if (selection && selection.rangeCount > 0) {
          savedRange = selection.getRangeAt(0).cloneRange();
        }

        contentEditableElement.focus();
        if (savedRange) {
          selection?.removeAllRanges();
          selection?.addRange(savedRange);
        }

        const alignCommand = align === "left" ? "justifyLeft" : align === "center" ? "justifyCenter" : "justifyRight";
        document.execCommand(alignCommand, false);
      }
    } catch (error) {
      console.error(`Failed to apply text alignment ${align}:`, error);
    }

    onFormatChange?.("textAlign", align);
  };

  const handleSectionSelect = (sectionId: string) => {
    onSectionSelect?.(sectionId);
    setShowSectionsMenu(false);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border-b border-slate-200 flex-wrap">
      {/* Sections Dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 hover:bg-slate-100"
          onClick={() => setShowSectionsMenu(!showSectionsMenu)}
        >
          Sections
          <ChevronDown className="w-4 h-4" />
        </Button>

        {showSectionsMenu && sections.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200" />

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

      {/* Heading Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("heading2")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("heading2")}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>

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

      {/* Blockquote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-9 w-9 p-0 ${
          activeFormats.has("blockquote")
            ? "bg-slate-200 text-slate-900"
            : "hover:bg-slate-100"
        }`}
        onClick={() => toggleFormat("blockquote")}
        title="Block quote"
      >
        <Quote className="w-4 h-4" />
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
        onClick={() => onFormatChange?.("undo", true)}
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-slate-100"
        onClick={() => onFormatChange?.("redo", true)}
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
