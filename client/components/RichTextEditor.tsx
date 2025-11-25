import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading2,
  Code,
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
  selectedIndex: number;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<VariableDropdown>({
    visible: false,
    searchTerm: "",
    selectedIndex: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
      const lastBraceIndex = textBefore.lastIndexOf("{");

      if (lastBraceIndex !== -1) {
        const afterLastBrace = textBefore.substring(lastBraceIndex);
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
            selectedIndex: 0,
          });
        } else {
          setDropdown({ ...dropdown, visible: false });
        }
      } else {
        setDropdown({ ...dropdown, visible: false });
      }
    },
  });

  const getFilteredVariables = () => {
    if (!dropdown.searchTerm) return variables;
    return variables.filter((v) =>
      v.name.toLowerCase().includes(dropdown.searchTerm.toLowerCase())
    );
  };

  const handleVariableSelect = (variableName: string) => {
    if (!editor) return;

    const { $from } = editor.state.selection;
    const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
    const lastBraceIndex = textBefore.lastIndexOf("{");

    if (lastBraceIndex === -1) return;

    const nodeStart = $from.start();
    const deleteStart = nodeStart + lastBraceIndex;
    const deleteEnd = $from.pos;

    editor
      .chain()
      .deleteRange({ from: deleteStart, to: deleteEnd })
      .insertContent(`{{${variableName}}} `)
      .focus()
      .run();

    setDropdown({ ...dropdown, visible: false });
  };

  const filteredVariables = getFilteredVariables();

  if (!editor) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none",
            "p-4 min-h-[200px] focus:outline-none",
            "[&_.is-empty:before]:text-muted-foreground"
          )}
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
            {filteredVariables.map((variable, index) => (
              <button
                key={variable.id}
                onClick={() => handleVariableSelect(variable.name)}
                className={cn(
                  "w-full text-left px-3 py-2 transition-colors text-sm border-b last:border-b-0",
                  index === dropdown.selectedIndex
                    ? "bg-blue-100"
                    : "hover:bg-blue-50"
                )}
                type="button"
              >
                <div className="font-medium text-slate-900">{variable.name}</div>
                {variable.value && (
                  <div className="text-xs text-slate-500 truncate">{variable.value}</div>
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
