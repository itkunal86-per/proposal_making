import React from "react";
import { Proposal, ProposalSection } from "@/services/proposalsService";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ElementProps {
  id: string;
  type: "title" | "section-title" | "section-content" | "image" | "video";
  selected: boolean;
  onSelect: () => void;
  onAI?: () => void;
  children?: React.ReactNode;
  value?: string;
  color?: string;
  fontSize?: string;
  textAlign?: "left" | "center" | "right";
}

const SelectableElement: React.FC<ElementProps> = ({
  selected,
  onSelect,
  children,
  type,
  color,
  fontSize,
  textAlign,
}) => {
  const baseClasses =
    "cursor-pointer transition-all duration-200 outline-2 outline-offset-2";
  const selectedClasses = selected
    ? "outline outline-blue-500 bg-blue-50/50"
    : "hover:outline hover:outline-gray-300 hover:outline-offset-2";

  const defaultFontSizes = {
    title: "32",
    "section-title": "24",
    "section-content": "16",
  };

  const defaultFontSize = (defaultFontSizes as any)[type] || "16";

  const styleOverrides: React.CSSProperties = {
    color: color || "inherit",
    fontSize: fontSize ? `${fontSize}px` : `${defaultFontSize}px`,
    textAlign: (textAlign as any) || "left",
  };

  if (type === "image" || type === "video") {
    return (
      <div
        onClick={onSelect}
        className={`${baseClasses} ${selectedClasses} rounded border overflow-hidden`}
      >
        {children}
      </div>
    );
  }

  const textClasses = {
    title: type === "title" && !fontSize ? "font-bold" : "",
    "section-title": type === "section-title" && !fontSize ? "font-bold" : "",
    "section-content": "",
  };

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${selectedClasses} p-2 rounded`}
      style={styleOverrides}
    >
      <div className={(textClasses as any)[type] || ""}>
        {children}
      </div>
    </div>
  );
};

interface ProposalPreviewProps {
  proposal: Proposal;
  selectedElementId: string | null;
  onSelectElement: (id: string, type: string) => void;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  selectedElementId,
  onSelectElement,
}) => {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm">
      <SelectableElement
        id="proposal-title"
        type="title"
        selected={selectedElementId === "proposal-title"}
        onSelect={() => onSelectElement("proposal-title", "title")}
        value={proposal.title}
        color={(proposal as any).titleStyles?.color}
        fontSize={(proposal as any).titleStyles?.fontSize}
        textAlign={(proposal as any).titleStyles?.textAlign}
      >
        {proposal.title}
      </SelectableElement>

      {proposal.client && (
        <div className="text-sm text-gray-600 flex gap-2">
          <span className="font-semibold">Client:</span>
          <span>{proposal.client}</span>
        </div>
      )}

      <div className="border-t pt-4 space-y-6">
        {proposal.sections.map((section, index) => (
          <div key={section.id} className="space-y-3">
            <SelectableElement
              id={`section-title-${section.id}`}
              type="section-title"
              selected={selectedElementId === `section-title-${section.id}`}
              onSelect={() =>
                onSelectElement(`section-title-${section.id}`, "section-title")
              }
              value={section.title}
              color={(section as any).titleStyles?.color}
              fontSize={(section as any).titleStyles?.fontSize}
              textAlign={(section as any).titleStyles?.textAlign}
            >
              {section.title}
            </SelectableElement>

            <SelectableElement
              id={`section-content-${section.id}`}
              type="section-content"
              selected={selectedElementId === `section-content-${section.id}`}
              onSelect={() =>
                onSelectElement(`section-content-${section.id}`, "section-content")
              }
              value={section.content}
              color={(section as any).contentStyles?.color}
              fontSize={(section as any).contentStyles?.fontSize}
              textAlign={(section as any).contentStyles?.textAlign}
            >
              {section.content}
            </SelectableElement>

            {section.media && section.media.length > 0 && (
              <div className="grid gap-4 mt-4">
                {section.media.map((media, mIndex) => (
                  <SelectableElement
                    key={mIndex}
                    id={`media-${section.id}-${mIndex}`}
                    type={media.type}
                    selected={selectedElementId === `media-${section.id}-${mIndex}`}
                    onSelect={() =>
                      onSelectElement(`media-${section.id}-${mIndex}`, media.type)
                    }
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt="proposal media"
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-auto rounded"
                      />
                    )}
                  </SelectableElement>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {proposal.pricing.items.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Pricing</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.pricing.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.label}</td>
                  <td className="text-right">{item.qty}</td>
                  <td className="text-right">
                    ${item.price.toLocaleString()}
                  </td>
                  <td className="text-right font-semibold">
                    ${(item.qty * item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
