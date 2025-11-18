import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Proposal } from "@/services/proposalsService";
import { replaceVariables } from "@/lib/variableUtils";

interface ProposalPreviewModalProps {
  proposal: Proposal;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  onClose: () => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  proposal,
  variables = [],
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-40">
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm">
            {/* Title */}
            <div
              className="mb-8"
              style={{
                color: (proposal as any).titleStyles?.color,
                fontSize: `${(proposal as any).titleStyles?.fontSize || 32}px`,
                textAlign: ((proposal as any).titleStyles?.textAlign || "left") as any,
                backgroundColor: (proposal as any).titleStyles?.backgroundColor,
                padding: `${(proposal as any).titleStyles?.paddingTop || 0}px ${(proposal as any).titleStyles?.paddingRight || 0}px ${(proposal as any).titleStyles?.paddingBottom || 0}px ${(proposal as any).titleStyles?.paddingLeft || 0}px`,
                borderRadius: (proposal as any).titleStyles?.borderRadius ? `${(proposal as any).titleStyles?.borderRadius}px` : undefined,
              }}
            >
              {proposal.title}
            </div>

            {/* Sections */}
            {proposal.sections.map((section) => (
              <div key={section.id} className="mb-8">
                {/* Section Title */}
                <div
                  className="mb-4"
                  style={{
                    color: (section as any).titleStyles?.color,
                    fontSize: `${(section as any).titleStyles?.fontSize || 24}px`,
                    textAlign: ((section as any).titleStyles?.textAlign || "left") as any,
                    backgroundColor: (section as any).titleStyles?.backgroundColor,
                    padding: `${(section as any).titleStyles?.paddingTop || 0}px ${(section as any).titleStyles?.paddingRight || 0}px ${(section as any).titleStyles?.paddingBottom || 0}px ${(section as any).titleStyles?.paddingLeft || 0}px`,
                    borderRadius: (section as any).titleStyles?.borderRadius ? `${(section as any).titleStyles?.borderRadius}px` : undefined,
                    fontWeight: (section as any).titleStyles?.bold ? "bold" : "normal",
                    fontStyle: (section as any).titleStyles?.italic ? "italic" : "normal",
                    textDecoration: (section as any).titleStyles?.underline ? "underline" : (section as any).titleStyles?.strikethrough ? "line-through" : "none",
                  }}
                >
                  {section.title}
                </div>

                {/* Section Content */}
                <div
                  style={{
                    color: (section as any).contentStyles?.color,
                    fontSize: `${(section as any).contentStyles?.fontSize || 16}px`,
                    textAlign: ((section as any).contentStyles?.textAlign || "left") as any,
                    backgroundColor: (section as any).contentStyles?.backgroundColor,
                    padding: `${(section as any).contentStyles?.paddingTop || 0}px ${(section as any).contentStyles?.paddingRight || 0}px ${(section as any).contentStyles?.paddingBottom || 0}px ${(section as any).contentStyles?.paddingLeft || 0}px`,
                    borderRadius: (section as any).contentStyles?.borderRadius ? `${(section as any).contentStyles?.borderRadius}px` : undefined,
                    fontWeight: (section as any).contentStyles?.bold ? "bold" : "normal",
                    fontStyle: (section as any).contentStyles?.italic ? "italic" : "normal",
                    textDecoration: (section as any).contentStyles?.underline ? "underline" : (section as any).contentStyles?.strikethrough ? "line-through" : "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {replaceVariables(section.content, variables)}
                </div>

                {/* Media */}
                {section.media && section.media.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {section.media.map((media, index) => (
                      <div key={index}>
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="max-w-full h-auto rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <video
                            src={media.url}
                            controls
                            className="max-w-full h-auto rounded"
                            style={{ display: "block" }}
                            onError={(e) => {
                              (e.target as HTMLVideoElement).style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
