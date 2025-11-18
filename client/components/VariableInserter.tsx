import React, { useRef, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface VariableInserterProps {
  value: string;
  onChange: (value: string) => void;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  className?: string;
}

interface VariableDropdown {
  visible: boolean;
  position: { top: number; left: number };
  searchTerm: string;
  cursorPos: number;
}

export const VariableInserter: React.FC<VariableInserterProps> = ({
  value,
  onChange,
  variables = [],
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dropdown, setDropdown] = useState<VariableDropdown>({
    visible: false,
    position: { top: 0, left: 0 },
    searchTerm: "",
    cursorPos: 0,
  });

  const getFilteredVariables = () => {
    if (!dropdown.searchTerm) return variables;
    return variables.filter((v) =>
      v.name.toLowerCase().includes(dropdown.searchTerm.toLowerCase())
    );
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    if (variables.length === 0) {
      setDropdown({ ...dropdown, visible: false });
      return;
    }

    // Find if we're in a variable insertion context (after '{')
    const beforeCursor = newValue.substring(0, cursorPos);
    const lastBraceIndex = beforeCursor.lastIndexOf("{");

    if (lastBraceIndex !== -1) {
      const afterLastBrace = beforeCursor.substring(lastBraceIndex);

      // Check if this is the start of a variable (single '{' or '{{')
      if (afterLastBrace === "{" || afterLastBrace === "{{") {
        // Show dropdown
        if (textareaRef.current && containerRef.current) {
          const coords = getCaretCoordinates(textareaRef.current, cursorPos);
          setDropdown({
            visible: true,
            position: { top: coords.top, left: coords.left },
            searchTerm: "",
            cursorPos,
          });
        }
      } else if (afterLastBrace.match(/^\{\{[a-zA-Z0-9\s]*$/)) {
        // User is typing inside {{...
        const searchTerm = afterLastBrace.substring(2);
        if (textareaRef.current && containerRef.current) {
          const coords = getCaretCoordinates(textareaRef.current, cursorPos);
          setDropdown({
            visible: true,
            position: { top: coords.top, left: coords.left },
            searchTerm,
            cursorPos,
          });
        }
      } else {
        setDropdown({ ...dropdown, visible: false });
      }
    } else {
      setDropdown({ ...dropdown, visible: false });
    }
  };

  const handleVariableSelect = (variableName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursorPos = textarea.selectionStart;
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);

    // Find the position of the opening brace
    const lastBraceIndex = beforeCursor.lastIndexOf("{");
    if (lastBraceIndex === -1) return;

    // Replace from the brace to current position with the variable
    const newText =
      text.substring(0, lastBraceIndex) +
      `{{${variableName}}}` +
      afterCursor;

    onChange(newText);

    // Close dropdown
    setDropdown({ ...dropdown, visible: false });

    // Focus textarea and move cursor after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lastBraceIndex + `{{${variableName}}}`.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const filteredVariables = getFilteredVariables();

  return (
    <div ref={containerRef} className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        className={className}
        style={{ position: "relative", zIndex: 1 }}
      />

      {dropdown.visible && variables.length > 0 && (
        <div
          className="absolute bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-72"
          style={{
            top: `${dropdown.position.top + 28}px`,
            left: `${dropdown.position.left}px`,
            maxHeight: "250px",
            overflowY: "auto",
            minWidth: "250px",
          }}
        >
          {filteredVariables.length > 0 ? (
            filteredVariables.map((variable) => (
              <button
                key={variable.id}
                onClick={() => handleVariableSelect(variable.name)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm border-b last:border-b-0"
                type="button"
              >
                <div className="font-medium text-slate-900">{variable.name}</div>
                {variable.value && (
                  <div className="text-xs text-slate-500 truncate">{variable.value}</div>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500 text-center">
              No variables found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get caret coordinates
function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const div = document.createElement("div");
  const span = document.createElement("span");

  const style = window.getComputedStyle(textarea);
  const props = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
  ];

  props.forEach((prop) => {
    (div.style as any)[prop] = (style as any)[prop];
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  document.body.appendChild(div);

  div.textContent = textarea.value.substring(0, position);
  span.textContent = textarea.value.substring(position) || ".";
  div.appendChild(span);

  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();
  const textareaRect = textarea.getBoundingClientRect();

  document.body.removeChild(div);

  return {
    top: spanRect.top - textareaRect.top,
    left: spanRect.left - textareaRect.left,
  };
}
