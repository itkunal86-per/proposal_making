import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  className?: string;
  placeholder?: string;
  color?: string;
  fontSize?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface VariableDropdown {
  visible: boolean;
  searchTerm: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  variables = [],
  className = "",
  placeholder = "Enter text...",
  color = "inherit",
  fontSize = "16",
  backgroundColor = "transparent",
  textAlign = "left",
  bold = false,
  italic = false,
  underline = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [dropdown, setDropdown] = useState<VariableDropdown>({
    visible: false,
    searchTerm: "",
  });


  // Initialize editor content and update when value prop changes
  useEffect(() => {
    if (editorRef.current) {
      const isEditorFocused = document.activeElement === editorRef.current;
      const currentInnerHTML = editorRef.current.innerHTML;
      const newValue = value || "";

      // Only update innerHTML if:
      // 1. Editor is not currently focused (user is not typing), OR
      // 2. It's the initial load (isInitializedRef is false)
      if (!isInitializedRef.current || !isEditorFocused) {
        if (currentInnerHTML !== newValue) {
          editorRef.current.innerHTML = newValue;
        }
      }

      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }
    }
  }, [value]);

  const captureContent = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const textContent = editorRef.current.textContent || "";

    console.log("📤 RichTextEditor captureContent:", {
      innerHTML: content,
      textContent: textContent,
      htmlLength: content.length,
      textLength: textContent.length,
      hasPlaceholder_literal: content.includes("{{"),
      hasPlaceholder_encoded: content.includes("&lcub;"),
      sample: content.substring(0, 200),
      textSample: textContent.substring(0, 200),
    });
    onChange(content);
  };

  const handleInput = () => {
    captureContent();

    // Check for variable insertion trigger
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current!);
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
    captureContent();
  };

  const filteredVariables = getFilteredVariables();

  return (
    <div
      ref={containerRef}
      className={cn("border rounded-lg overflow-hidden", className)}
    >
      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable="true"
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => captureContent()}
          dir="ltr"
          className={cn(
            "p-4 min-h-[200px] focus:outline-none prose prose-sm max-w-none",
            "text-foreground"
          )}
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            color: color || "inherit",
            fontSize: fontSize ? `${fontSize}px` : "16px",
            backgroundColor: backgroundColor || "transparent",
            textAlign: (textAlign as any) || "left",
            fontWeight: bold ? "bold" : "normal",
            fontStyle: italic ? "italic" : "normal",
            textDecoration: underline ? "underline" : "none",
            direction: "ltr",
          }}
          data-placeholder={placeholder}
          data-testid="rich-text-editor"
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
