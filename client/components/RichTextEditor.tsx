import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading2,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  className?: string;
  placeholder?: string;
}

interface VariableDropdown {
  visible: boolean;
  searchTerm: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded hover:bg-slate-100 transition-colors",
      isActive && "bg-slate-200",
      disabled && "opacity-50 cursor-not-allowed"
    )}
    type="button"
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  variables = [],
  className = "",
  placeholder = "Enter text...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<VariableDropdown>({
    visible: false,
    searchTerm: "",
  });
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor with value
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);

    // Check for variable insertion trigger
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const text = preCaretRange.toString();
    const lastBraceIndex = text.lastIndexOf("{");

    if (lastBraceIndex !== -1) {
      const afterLastBrace = text.substring(lastBraceIndex);
      const isOpeningBrace = afterLastBrace === "{" || afterLastBrace === "{{";
      const isInsideVariable = afterLastBrace.match(/^\{\{[a-zA-Z0-9\s]*$/);

      if (isOpeningBrace || isInsideVariable) {
        let searchTerm = "";
        if (isInsideVariable) {
          searchTerm = afterLastBrace.substring(2);
        }

        setDropdown({
          visible: true,
          searchTerm,
        });
      } else {
        setDropdown({ ...dropdown, visible: false });
      }
    } else {
      setDropdown({ ...dropdown, visible: false });
    }
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const getFilteredVariables = () => {
    if (!dropdown.searchTerm) return variables;
    return variables.filter((v) =>
      v.name.toLowerCase().includes(dropdown.searchTerm.toLowerCase())
    );
  };

  const handleVariableSelect = (variableName: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const text = preCaretRange.toString();
    const lastBraceIndex = text.lastIndexOf("{");

    if (lastBraceIndex === -1) return;

    // Find and delete the opening brace(s)
    editorRef.current.focus();
    range.setStart(range.endContainer, range.endOffset);

    // Move cursor back to the brace position
    const preText = text.substring(0, lastBraceIndex);
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    let charCount = 0;
    let startNode = range.endContainer;
    let startOffset = 0;

    while ((node = walker.nextNode())) {
      const nodeLen = (node.textContent || "").length;
      if (charCount + nodeLen >= lastBraceIndex) {
        startNode = node;
        startOffset = lastBraceIndex - charCount;
        break;
      }
      charCount += nodeLen;
    }

    // Delete from brace position to cursor
    const deleteRange = document.createRange();
    deleteRange.setStart(startNode, startOffset);
    deleteRange.setEnd(range.endContainer, range.endOffset);
    deleteRange.deleteContents();

    // Insert variable
    const variableNode = document.createTextNode(`{{${variableName}}} `);
    deleteRange.insertNode(variableNode);

    // Move cursor after the variable
    const newRange = document.createRange();
    newRange.setStartAfter(variableNode);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setDropdown({ visible: false, searchTerm: "" });
    handleInput();
  };

  const filteredVariables = getFilteredVariables();

  return (
    <div
      ref={containerRef}
      className={cn("border rounded-lg overflow-hidden", className)}
    >
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 flex-wrap">
        <ToolbarButton
          onClick={() => execCommand("bold")}
          isActive={isCommandActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("italic")}
          isActive={isCommandActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("underline")}
          isActive={isCommandActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => execCommand("formatBlock", "<h2>")}
          isActive={isCommandActive("formatBlock")}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          isActive={isCommandActive("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          isActive={isCommandActive("insertOrderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("formatBlock", "<blockquote>")}
          isActive={isCommandActive("formatBlock")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => execCommand("undo")}
          disabled={!document.queryCommandEnabled("undo")}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => execCommand("redo")}
          disabled={!document.queryCommandEnabled("redo")}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleInput();
          }}
          className={cn(
            "p-4 min-h-[200px] focus:outline-none prose prose-sm max-w-none",
            "text-foreground bg-white"
          )}
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
          data-placeholder={placeholder}
        />

        {/* Variable dropdown */}
        {dropdown.visible && variables.length > 0 && filteredVariables.length > 0 && (
          <div
            className="absolute top-0 left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              minWidth: "250px",
            }}
          >
            {filteredVariables.map((variable) => (
              <button
                key={variable.id}
                onClick={() => handleVariableSelect(variable.name)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm border-b last:border-b-0"
                type="button"
              >
                <div className="font-medium text-slate-900">{variable.name}</div>
                {variable.value && (
                  <div className="text-xs text-slate-500 truncate">
                    {variable.value}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="text-xs text-slate-500 bg-blue-50 border-t border-blue-200 p-3">
        <p className="font-medium mb-1">💡 Add Variables</p>
        <p>Type a single brace to insert variables like {`{{variable_name}}`}</p>
      </div>
    </div>
  );
};
