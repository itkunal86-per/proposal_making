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
    <div
      className="w-full h-full bg-white rounded overflow-hidden"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      {/* Title */}
      {proposal.title && (
        <div
          className="px-4 py-3 border-b border-slate-200 overflow-hidden"
          style={{
            color: (proposal as any).titleStyles?.color || '#000000',
            fontSize: `${((proposal as any).titleStyles?.fontSize || 24) / scale}px`,
            textAlign: ((proposal as any).titleStyles?.textAlign || "left") as any,
            backgroundColor: (proposal as any).titleStyles?.backgroundColor,
            backgroundImage: (proposal as any).titleStyles?.backgroundImage ? `url(${(proposal as any).titleStyles?.backgroundImage})` : undefined,
            backgroundSize: (proposal as any).titleStyles?.backgroundSize || "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: `${((proposal as any).titleStyles?.paddingTop || 0) / scale}px ${((proposal as any).titleStyles?.paddingRight || 0) / scale}px ${((proposal as any).titleStyles?.paddingBottom || 0) / scale}px ${((proposal as any).titleStyles?.paddingLeft || 0) / scale}px`,
            borderRadius: (proposal as any).titleStyles?.borderRadius ? `${(proposal as any).titleStyles?.borderRadius / scale}px` : undefined,
            fontWeight: (proposal as any).titleStyles?.bold ? "bold" : "normal",
            fontStyle: (proposal as any).titleStyles?.italic ? "italic" : "normal",
            textDecoration: (proposal as any).titleStyles?.underline ? "underline" : (proposal as any).titleStyles?.strikethrough ? "line-through" : "none",
          }}
        >
          <div className="truncate font-semibold">
            {decodeHtmlEntities(proposal.title)}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="px-4 py-3 space-y-3 overflow-hidden">
        {proposal.sections?.slice(0, 2).map((section, sIdx) => (
          <div key={section.id} className="space-y-2">
            {/* Section Title */}
            {section.title && (
              <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                {section.title}
              </div>
            )}

            {/* Section Content */}
            {section.content && (
              <div
                className="text-xs text-slate-600 line-clamp-2"
                style={{
                  color: (section as any).contentStyles?.color || '#666',
                  fontSize: `${((section as any).contentStyles?.fontSize || 14) / scale}px`,
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: decodeHtmlEntities(section.content).substring(0, 150) + '...',
                  }}
                />
              </div>
            )}

            {/* Images Preview */}
            {(section as any).images && (section as any).images.length > 0 && (
              <div className="flex gap-1 pt-2">
                {(section as any).images.slice(0, 2).map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-8 h-8 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0"
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

            {/* Canvas Elements (Shapes, Tables, Texts) */}
            {(section.shapes?.length || 0) + (section.tables?.length || 0) + ((section as any).texts?.length || 0) > 0 && (
              <div
                className="relative bg-gray-50 rounded border border-slate-200 mt-2"
                style={{
                  minHeight: `${canvasHeights[section.id] || 100}px`,
                  pointerEvents: 'none',
                }}
              >
                {/* Shapes */}
                {section.shapes && section.shapes.map((shape, shapeIdx) => {
                  const backgroundOverlayOpacity = shape.backgroundImage && shape.backgroundOpacity ? (100 - parseInt(shape.backgroundOpacity || "100")) / 100 : 0;

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
                        borderWidth: shape.borderWidth ? `${shape.borderWidth * scale}px` : "0px",
                        borderColor: shape.borderColor,
                        borderStyle: shape.borderWidth ? "solid" : "none",
                        borderRadius: shape.type === 'circle' ? '50%' : shape.borderRadius ? `${shape.borderRadius * scale}px` : "0px",
                      }}
                    />
                  );
                })}

                {/* Tables */}
                {section.tables && section.tables.map((table, tableIdx) => (
                  <div
                    key={`table-${tableIdx}`}
                    style={{
                      position: "absolute",
                      left: `${table.left * scale}px`,
                      top: `${table.top * scale}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'auto',
                    }}
                  >
                    <TableEditor
                      id={`preview-table-${section.id}-${tableIdx}`}
                      rows={table.rows}
                      columns={table.columns}
                      cells={table.cells}
                      borderWidth={table.borderWidth}
                      borderColor={table.borderColor}
                      headerBackground={table.headerBackground}
                      cellBackground={table.cellBackground}
                      textColor={table.textColor}
                      padding={table.padding}
                      width={table.width}
                      height={table.height}
                      top={0}
                      left={0}
                      selected={false}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                    />
                  </div>
                ))}

                {/* Texts */}
                {(section as any).texts && (section as any).texts.map((text: any, textIdx: number) => (
                  <div
                    key={`text-${textIdx}`}
                    style={{
                      position: "absolute",
                      left: `${text.left * scale}px`,
                      top: `${text.top * scale}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'auto',
                    }}
                  >
                    <TextEditor
                      id={`preview-text-${section.id}-${textIdx}`}
                      content={text.content}
                      top={0}
                      left={0}
                      width={text.width}
                      fontSize={text.fontSize}
                      color={text.color}
                      fontWeight={text.fontWeight}
                      backgroundColor={text.backgroundColor}
                      backgroundOpacity={text.backgroundOpacity}
                      borderColor={text.borderColor}
                      borderWidth={text.borderWidth}
                      borderRadius={text.borderRadius}
                      paddingTop={text.paddingTop}
                      paddingRight={text.paddingRight}
                      paddingBottom={text.paddingBottom}
                      paddingLeft={text.paddingLeft}
                      selected={false}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Show indicator if more sections exist */}
        {proposal.sections && proposal.sections.length > 2 && (
          <div className="text-xs text-muted-foreground pt-2">
            +{proposal.sections.length - 2} more section{proposal.sections.length - 2 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
