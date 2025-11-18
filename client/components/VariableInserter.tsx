import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
}

export const VariableInserter: React.FC<VariableInserterProps> = ({
  value,
  onChange,
  variables = [],
  className = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dropdown, setDropdown] = useState<VariableDropdown>({
    visible: false,
    position: { top: 0, left: 0 },
    searchTerm: "",
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

      // Check if this is the start of a variable ({{ pattern)
      const isOpeningBrace = afterLastBrace === "{" || afterLastBrace === "{{";
      const isInsideVariable = afterLastBrace.match(/^\{\{[a-zA-Z0-9\s]*$/);

      if (isOpeningBrace || isInsideVariable) {
        // Calculate search term
        let searchTerm = "";
        if (isInsideVariable) {
          searchTerm = afterLastBrace.substring(2);
        }

        console.log("Variable trigger detected:", { afterLastBrace, isOpeningBrace, isInsideVariable, variables: variables.length });

        // Calculate dropdown position
        if (textareaRef.current) {
          try {
            const textareaRect = textareaRef.current.getBoundingClientRect();
            const div = document.createElement("div");
            const span = document.createElement("span");

            const style = window.getComputedStyle(textareaRef.current);
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

            div.textContent = newValue.substring(0, cursorPos);
            span.textContent = newValue.substring(cursorPos) || ".";
            div.appendChild(span);

            const spanRect = span.getBoundingClientRect();
            document.body.removeChild(div);

            // Calculate position relative to viewport, accounting for textarea position
            const dropdownTop = spanRect.top + 20;
            const dropdownLeft = spanRect.left;

            setDropdown({
              visible: true,
              position: { top: dropdownTop, left: dropdownLeft },
              searchTerm,
            });
          } catch (e) {
            console.error("Error calculating caret coordinates:", e);
            setDropdown({ ...dropdown, visible: false });
          }
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

    const cursorPos = textarea.selectionStart;
    const beforeCursor = value.substring(0, cursorPos);
    const afterCursor = value.substring(cursorPos);

    // Find the position of the opening brace
    const lastBraceIndex = beforeCursor.lastIndexOf("{");
    if (lastBraceIndex === -1) return;

    // Replace from the brace to current position with the variable
    const newText =
      value.substring(0, lastBraceIndex) +
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
    <>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        className={className}
      />

      {dropdown.visible && variables.length > 0 && filteredVariables.length > 0 &&
        createPortal(
          <div
            className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-72"
            style={{
              top: `${dropdown.position.top}px`,
              left: `${Math.max(0, dropdown.position.left)}px`,
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
                  <div className="text-xs text-slate-500 truncate">{variable.value}</div>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};
