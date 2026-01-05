import React, { useMemo } from "react";
import { Proposal } from "@/services/proposalsService";
import { SystemTemplate } from "@/services/systemTemplatesService";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";
import { ImageEditor } from "@/components/ImageEditor";

interface TemplatePreviewRendererProps {
  template: SystemTemplate | Proposal;
}

export const TemplatePreviewRenderer: React.FC<TemplatePreviewRendererProps> = ({
  template,
}) => {
  // Convert SystemTemplate to Proposal structure if needed
  const proposal = useMemo(() => {
    if ('client' in template) {
      return template as Proposal;
    }
    // Already a SystemTemplate, use as-is (structure is compatible)
    return template as any as Proposal;
  }, [template]);

  const canvasHeights = useMemo(() => {
    const newHeights: Record<string, number> = {};

    proposal.sections?.forEach((section) => {
      if ((section.shapes && section.shapes.length > 0) ||
          (section.tables && section.tables.length > 0) ||
          ((section as any).texts && (section as any).texts.length > 0) ||
          ((section as any).images && (section as any).images.length > 0) ||
          (section.signatureFields && section.signatureFields.length > 0)) {
        let maxHeight = 100; // minimum height for preview

        if (section.shapes) {
          section.shapes.forEach((shape) => {
            const bottomPos = shape.top + shape.height + 20;
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        if (section.tables) {
          section.tables.forEach((table) => {
            const bottomPos = table.top + table.height + 20;
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        if ((section as any).texts) {
          (section as any).texts.forEach((text: any) => {
            const bottomPos = text.top + (text.height || 100) + 20;
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        if ((section as any).images) {
          (section as any).images.forEach((image: any) => {
            const bottomPos = image.top + image.height + 20;
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        if (section.signatureFields) {
          section.signatureFields.forEach((field) => {
            const bottomPos = field.top + field.height + 20;
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Limit height for preview to avoid taking too much space
        newHeights[section.id] = Math.min(maxHeight, 150);
      }
    });

    return newHeights;
  }, [proposal.sections]);

  return (
    <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col text-sm">
      {/* Title */}
      {proposal.title && (
        <div
          className="px-3 py-2 border-b border-slate-200 overflow-hidden flex-shrink-0"
          style={{
            color: (proposal as any).titleStyles?.color || '#000000',
            fontSize: '14px',
            textAlign: ((proposal as any).titleStyles?.textAlign || "left") as any,
            backgroundColor: (proposal as any).titleStyles?.backgroundColor,
            backgroundImage: (proposal as any).titleStyles?.backgroundImage ? `url(${(proposal as any).titleStyles?.backgroundImage})` : undefined,
            backgroundSize: (proposal as any).titleStyles?.backgroundSize || "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: '8px 12px',
            borderRadius: (proposal as any).titleStyles?.borderRadius ? `${Math.max((proposal as any).titleStyles?.borderRadius / 2, 4)}px` : undefined,
            fontWeight: (proposal as any).titleStyles?.bold ? "bold" : "normal",
            fontStyle: (proposal as any).titleStyles?.italic ? "italic" : "normal",
            textDecoration: (proposal as any).titleStyles?.underline ? "underline" : (proposal as any).titleStyles?.strikethrough ? "line-through" : "none",
          }}
        >
          <div className="truncate font-semibold text-sm">
            {decodeHtmlEntities(proposal.title)}
          </div>
        </div>
      )}

      {/* Sections Content */}
      <div className="px-3 py-2 space-y-2 overflow-hidden flex-1 overflow-y-auto">
        {proposal.sections?.slice(0, 2).map((section, sIdx) => (
          <div key={section.id} className="space-y-1">
            {/* Section Title */}
            {section.title && (
              <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                {section.title}
              </div>
            )}

            {/* Section Content */}
            {section.content && (
              <div className="text-xs text-slate-600 line-clamp-2 leading-tight">
                <div
                  dangerouslySetInnerHTML={{
                    __html: decodeHtmlEntities(section.content).substring(0, 120) + '...',
                  }}
                />
              </div>
            )}

            {/* Images Preview */}
            {(section as any).images && (section as any).images.length > 0 && (
              <div className="flex gap-1 pt-1">
                {(section as any).images.slice(0, 2).map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-6 h-6 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={img.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
                {(section as any).images.length > 2 && (
                  <div className="text-xs text-muted-foreground flex items-center">
                    +{(section as any).images.length - 2}
                  </div>
                )}
              </div>
            )}

            {/* Canvas Elements (Shapes, Tables, Texts) - Simplified preview */}
            {(section.shapes?.length || 0) + (section.tables?.length || 0) + ((section as any).texts?.length || 0) > 0 && (
              <div
                className="relative bg-gray-50 rounded border border-slate-200 mt-1"
                style={{
                  height: `${canvasHeights[section.id] || 80}px`,
                  pointerEvents: 'none',
                  fontSize: '10px',
                }}
              >
                {/* Shapes */}
                {section.shapes && section.shapes.slice(0, 3).map((shape, shapeIdx) => {
                  const scale = 0.25;
                  return (
                    <div
                      key={`shape-${shapeIdx}`}
                      style={{
                        position: "absolute",
                        left: `${shape.left * scale}px`,
                        top: `${shape.top * scale}px`,
                        width: `${shape.width * scale}px`,
                        height: `${shape.height * scale}px`,
                        backgroundColor: shape.backgroundColor,
                        backgroundImage: shape.backgroundImage ? `url(${shape.backgroundImage})` : undefined,
                        backgroundSize: shape.backgroundImage ? shape.backgroundSize : undefined,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        borderWidth: shape.borderWidth ? `${Math.max(shape.borderWidth * scale, 1)}px` : "0px",
                        borderColor: shape.borderColor,
                        borderStyle: shape.borderWidth ? "solid" : "none",
                        borderRadius: shape.type === 'circle' ? '50%' : shape.borderRadius ? `${shape.borderRadius * scale}px` : "0px",
                      }}
                    />
                  );
                })}

                {/* Tables - Simplified */}
                {section.tables && section.tables.slice(0, 1).map((table, tableIdx) => (
                  <div key={`table-${tableIdx}`} className="text-xs text-slate-500 p-1">
                    <div>Table: {table.rows || 0} rows × {table.columns || 0} cols</div>
                  </div>
                ))}

                {/* Texts */}
                {(section as any).texts && (section as any).texts.slice(0, 2).map((text: any, textIdx: number) => (
                  <div
                    key={`text-${textIdx}`}
                    style={{
                      position: "absolute",
                      left: `${text.left * 0.25}px`,
                      top: `${text.top * 0.25}px`,
                      width: `${text.width * 0.25}px`,
                      fontSize: `${Math.max((text.fontSize || 12) * 0.25, 8)}px`,
                      color: text.color || '#000',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {text.content?.substring(0, 30) || ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Show indicator if more sections exist */}
        {proposal.sections && proposal.sections.length > 2 && (
          <div className="text-xs text-muted-foreground pt-1">
            +{proposal.sections.length - 2} more section{proposal.sections.length - 2 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
