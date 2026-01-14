import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Proposal } from "@/services/proposalsService";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { ShapeEditor } from "@/components/ShapeEditor";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";
import { ImageEditor } from "@/components/ImageEditor";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [canvasHeights, setCanvasHeights] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    const newHeights: Record<string, number> = {};

    proposal.sections.forEach((section) => {
      if ((section.shapes && section.shapes.length > 0) ||
          (section.tables && section.tables.length > 0) ||
          ((section as any).texts && (section as any).texts.length > 0) ||
          ((section as any).images && (section as any).images.length > 0) ||
          (section.signatureFields && section.signatureFields.length > 0)) {
        let maxHeight = 400; // minimum height

        // Calculate max height needed for shapes
        if (section.shapes) {
          section.shapes.forEach((shape) => {
            const bottomPos = shape.top + shape.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for tables
        if (section.tables) {
          section.tables.forEach((table) => {
            const bottomPos = table.top + table.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for text elements
        if ((section as any).texts) {
          (section as any).texts.forEach((text: any) => {
            const bottomPos = text.top + (text.height || 100) + 20; // 20px padding, assume 100px if no height
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for image elements
        if ((section as any).images) {
          (section as any).images.forEach((image: any) => {
            const bottomPos = image.top + image.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        // Calculate max height needed for signature fields
        if (section.signatureFields) {
          section.signatureFields.forEach((field) => {
            const bottomPos = field.top + field.height + 20; // 20px padding
            if (bottomPos > maxHeight) {
              maxHeight = bottomPos;
            }
          });
        }

        newHeights[section.id] = maxHeight;
      }
    });

    setCanvasHeights(newHeights);
  }, [proposal.sections]);

  const handleExportPDF = async () => {
    try {
      const response = await import("html2pdf.js");
      const html2pdf = response.default;

      const element = contentRef.current;
      if (!element) {
        toast({ title: "Error", description: "Could not find content to export" });
        return;
      }

      // Clone the element to avoid modifying the actual modal
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Find and process all elements with background-image style
      const elementsWithBg = clonedElement.querySelectorAll("[style*='background-image']");

      elementsWithBg.forEach((el) => {
        const htmlElement = el as HTMLElement;
        const styleAttr = htmlElement.getAttribute('style') || '';

        // Extract background image URL
        const bgMatch = styleAttr.match(/background-image:\s*url\(["']?([^"'()]+)["']?\)/);

        if (bgMatch?.[1]) {
          const imageUrl = bgMatch[1];

          // Create actual img element
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            display: block;
            margin: 0;
            padding: 0;
            border: none;
          `;

          // Wrap existing content
          const contentWrapper = document.createElement('div');
          contentWrapper.style.cssText = 'position: relative; z-index: 1; width: 100%; height: 100%;';

          while (htmlElement.firstChild) {
            contentWrapper.appendChild(htmlElement.firstChild);
          }

          htmlElement.style.position = 'relative';
          htmlElement.appendChild(img);
          if (contentWrapper.children.length > 0 || contentWrapper.textContent) {
            htmlElement.appendChild(contentWrapper);
          }

          // Remove background-image styles
          const newStyle = styleAttr
            .replace(/background-image:\s*url\([^)]+\);?/g, '')
            .replace(/background-size:\s*[^;]+;?/g, '')
            .replace(/background-position:\s*[^;]+;?/g, '')
            .replace(/background-repeat:\s*[^;]+;?/g, '');

          if (newStyle.trim()) {
            htmlElement.setAttribute('style', newStyle);
          } else {
            htmlElement.removeAttribute('style');
          }
        }
      });

      // Wait for all images in cloned element to load
      const allImages = clonedElement.querySelectorAll('img');
      const imageLoadPromises = Array.from(allImages).map(
        (img) =>
          new Promise<void>((resolve) => {
            const imgEl = img as HTMLImageElement;
            // Force image loading from cloned element
            const tempImg = new Image();
            tempImg.onload = () => resolve();
            tempImg.onerror = () => resolve();
            tempImg.src = imgEl.src;
          })
      );

      await Promise.all(imageLoadPromises);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Export to PDF from cloned element
      const opt = {
        margin: 10,
        filename: `${proposal.title}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
      };

      html2pdf().set(opt).from(clonedElement).save();
      toast({ title: 'Success', description: 'Proposal exported as PDF' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: 'Error', description: 'Failed to export PDF' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId);
    if (element) {
      setActiveSection(sectionId);
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-9999" style={{ zIndex: 9998 }}>
      <div className="fixed inset-0 flex flex-col bg-white" style={{ zIndex: 9999 }}>
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
        <div className="flex-1 flex overflow-hidden bg-slate-50">
          {/* Left Sidebar */}
          <div className="w-48 border-r border-slate-200 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
              <h3 className="text-sm font-semibold text-slate-900">Sections</h3>
            </div>
            <nav className="p-2">
              {proposal.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  title={section.title}
                >
                  <div className="truncate">{section.title}</div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div ref={contentRef} className="max-w-4xl mx-auto bg-white p-8 shadow-sm">
            {/* Title */}
            <div
              className="mb-8 relative"
              style={{
                color: (proposal as any).titleStyles?.color,
                fontSize: `${(proposal as any).titleStyles?.fontSize || 32}px`,
                textAlign: ((proposal as any).titleStyles?.textAlign || "left") as any,
                backgroundColor: (proposal as any).titleStyles?.backgroundColor,
                backgroundImage: (proposal as any).titleStyles?.backgroundImage ? `url(${(proposal as any).titleStyles?.backgroundImage})` : undefined,
                backgroundSize: (proposal as any).titleStyles?.backgroundSize || "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: `${(proposal as any).titleStyles?.paddingTop || 0}px ${(proposal as any).titleStyles?.paddingRight || 0}px ${(proposal as any).titleStyles?.paddingBottom || 0}px ${(proposal as any).titleStyles?.paddingLeft || 0}px`,
                borderRadius: (proposal as any).titleStyles?.borderRadius ? `${(proposal as any).titleStyles?.borderRadius}px` : undefined,
                fontWeight: (proposal as any).titleStyles?.bold ? "bold" : "normal",
                fontStyle: (proposal as any).titleStyles?.italic ? "italic" : "normal",
                textDecoration: (proposal as any).titleStyles?.underline ? "underline" : (proposal as any).titleStyles?.strikethrough ? "line-through" : "none",
              }}
            >
              {(proposal as any).titleStyles?.backgroundImage && (proposal as any).titleStyles?.backgroundOpacity && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: `rgba(255, 255, 255, ${(100 - parseInt((proposal as any).titleStyles?.backgroundOpacity || "100")) / 100})`,
                    borderRadius: (proposal as any).titleStyles?.borderRadius ? `${(proposal as any).titleStyles?.borderRadius}px` : undefined,
                    pointerEvents: "none",
                  }}
                />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                {decodeHtmlEntities(replaceVariables(proposal.title, variables))}
              </div>
            </div>

            {/* Sections */}
            {proposal.sections.map((section) => (
              <div
                key={section.id}
                className="mb-8"
                ref={(el) => {
                  if (el) sectionRefs.current.set(section.id, el);
                }}
              >
                {/* Section Content */}
                {section.layout !== "two-column" && section.layout !== "three-column" ? (
                  <div
                    className="relative prose prose-sm max-w-none"
                    style={{
                      color: (section as any).contentStyles?.color,
                      fontSize: `${(section as any).contentStyles?.fontSize || 16}px`,
                      textAlign: ((section as any).contentStyles?.textAlign || "left") as any,
                      backgroundColor: (section as any).contentStyles?.backgroundColor,
                      backgroundImage: (section as any).contentStyles?.backgroundImage ? `url(${(section as any).contentStyles?.backgroundImage})` : undefined,
                      backgroundSize: (section as any).contentStyles?.backgroundSize || "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      padding: `${(section as any).contentStyles?.paddingTop || 0}px ${(section as any).contentStyles?.paddingRight || 0}px ${(section as any).contentStyles?.paddingBottom || 0}px ${(section as any).contentStyles?.paddingLeft || 0}px`,
                      borderRadius: (section as any).contentStyles?.borderRadius ? `${(section as any).contentStyles?.borderRadius}px` : undefined,
                      fontWeight: (section as any).contentStyles?.bold ? "bold" : "normal",
                      fontStyle: (section as any).contentStyles?.italic ? "italic" : "normal",
                      textDecoration: (section as any).contentStyles?.underline ? "underline" : (section as any).contentStyles?.strikethrough ? "line-through" : "none",
                    }}
                  >
                    {(section as any).contentStyles?.backgroundImage && (section as any).contentStyles?.backgroundOpacity && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: `rgba(255, 255, 255, ${(100 - parseInt((section as any).contentStyles?.backgroundOpacity || "100")) / 100})`,
                          borderRadius: (section as any).contentStyles?.borderRadius ? `${(section as any).contentStyles?.borderRadius}px` : undefined,
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <div
                      style={{ position: "relative", zIndex: 1 }}
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(replaceVariables(section.content, variables)),
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: section.layout === "two-column" ? "1fr 1fr" : "1fr 1fr 1fr",
                      gap: `${typeof (section as any).titleStyles?.columnGap === "number" ? (section as any).titleStyles.columnGap : 0}px`,
                    }}
                  >
                    {section.layout === "two-column" && [(section as any).columnContents?.[0], (section as any).columnContents?.[1]].map((content, colIndex) => {
                      const columnStyle = (section as any).columnStyles?.[colIndex];
                      const contentStyle = (section as any).contentStyles;
                      const borderWidth = columnStyle?.borderWidth || contentStyle?.borderWidth || 0;
                      const borderColor = columnStyle?.borderColor || contentStyle?.borderColor || "#000000";
                      const borderStyle = borderWidth > 0 ? "solid" : "none";

                      return (
                        <div
                          key={colIndex}
                          className="relative prose prose-sm max-w-none"
                          style={{
                            color: columnStyle?.color || contentStyle?.color,
                            fontSize: `${columnStyle?.fontSize || contentStyle?.fontSize || 16}px`,
                            textAlign: ((columnStyle?.textAlign || contentStyle?.textAlign || "left") as any),
                            backgroundColor: columnStyle?.backgroundColor || contentStyle?.backgroundColor,
                            backgroundImage: columnStyle?.backgroundImage ? `url(${columnStyle.backgroundImage})` : undefined,
                            backgroundSize: columnStyle?.backgroundSize || contentStyle?.backgroundSize || "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            paddingTop: `${columnStyle?.paddingTop || contentStyle?.paddingTop || 0}px`,
                            paddingRight: `${columnStyle?.paddingRight || contentStyle?.paddingRight || 0}px`,
                            paddingBottom: `${columnStyle?.paddingBottom || contentStyle?.paddingBottom || 0}px`,
                            paddingLeft: `${columnStyle?.paddingLeft || contentStyle?.paddingLeft || 0}px`,
                            marginTop: `${columnStyle?.marginTop || contentStyle?.marginTop || 0}px`,
                            marginRight: `${columnStyle?.marginRight || contentStyle?.marginRight || 0}px`,
                            marginBottom: `${columnStyle?.marginBottom || contentStyle?.marginBottom || 0}px`,
                            marginLeft: `${columnStyle?.marginLeft || contentStyle?.marginLeft || 0}px`,
                            borderWidth: `${borderWidth}px`,
                            borderColor: borderColor,
                            borderStyle: borderStyle,
                            borderRadius: (columnStyle?.borderRadius || contentStyle?.borderRadius) ? `${columnStyle?.borderRadius || contentStyle?.borderRadius}px` : undefined,
                            fontWeight: columnStyle?.bold || contentStyle?.bold ? "bold" : "normal",
                            fontStyle: columnStyle?.italic || contentStyle?.italic ? "italic" : "normal",
                            textDecoration: columnStyle?.underline || contentStyle?.underline ? "underline" : columnStyle?.strikethrough || contentStyle?.strikethrough ? "line-through" : "none",
                          }}
                        >
                          <div
                            style={{ position: "relative", zIndex: 1 }}
                            dangerouslySetInnerHTML={{
                              __html: decodeHtmlEntities(replaceVariables(content || "", variables)),
                            }}
                          />
                        </div>
                      );
                    })}
                    {section.layout === "three-column" && [(section as any).columnContents?.[0], (section as any).columnContents?.[1], (section as any).columnContents?.[2]].map((content, colIndex) => {
                      const columnStyle = (section as any).columnStyles?.[colIndex];
                      const contentStyle = (section as any).contentStyles;
                      const borderWidth = columnStyle?.borderWidth || contentStyle?.borderWidth || 0;
                      const borderColor = columnStyle?.borderColor || contentStyle?.borderColor || "#000000";
                      const borderStyle = borderWidth > 0 ? "solid" : "none";

                      return (
                        <div
                          key={colIndex}
                          className="relative prose prose-sm max-w-none"
                          style={{
                            color: columnStyle?.color || contentStyle?.color,
                            fontSize: `${columnStyle?.fontSize || contentStyle?.fontSize || 16}px`,
                            textAlign: ((columnStyle?.textAlign || contentStyle?.textAlign || "left") as any),
                            backgroundColor: columnStyle?.backgroundColor || contentStyle?.backgroundColor,
                            backgroundImage: columnStyle?.backgroundImage ? `url(${columnStyle.backgroundImage})` : undefined,
                            backgroundSize: columnStyle?.backgroundSize || contentStyle?.backgroundSize || "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            paddingTop: `${columnStyle?.paddingTop || contentStyle?.paddingTop || 0}px`,
                            paddingRight: `${columnStyle?.paddingRight || contentStyle?.paddingRight || 0}px`,
                            paddingBottom: `${columnStyle?.paddingBottom || contentStyle?.paddingBottom || 0}px`,
                            paddingLeft: `${columnStyle?.paddingLeft || contentStyle?.paddingLeft || 0}px`,
                            marginTop: `${columnStyle?.marginTop || contentStyle?.marginTop || 0}px`,
                            marginRight: `${columnStyle?.marginRight || contentStyle?.marginRight || 0}px`,
                            marginBottom: `${columnStyle?.marginBottom || contentStyle?.marginBottom || 0}px`,
                            marginLeft: `${columnStyle?.marginLeft || contentStyle?.marginLeft || 0}px`,
                            borderWidth: `${borderWidth}px`,
                            borderColor: borderColor,
                            borderStyle: borderStyle,
                            borderRadius: (columnStyle?.borderRadius || contentStyle?.borderRadius) ? `${columnStyle?.borderRadius || contentStyle?.borderRadius}px` : undefined,
                            fontWeight: columnStyle?.bold || contentStyle?.bold ? "bold" : "normal",
                            fontStyle: columnStyle?.italic || contentStyle?.italic ? "italic" : "normal",
                            textDecoration: columnStyle?.underline || contentStyle?.underline ? "underline" : columnStyle?.strikethrough || contentStyle?.strikethrough ? "line-through" : "none",
                          }}
                        >
                          <div
                            style={{ position: "relative", zIndex: 1 }}
                            dangerouslySetInnerHTML={{
                              __html: decodeHtmlEntities(replaceVariables(content || "", variables)),
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

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

                {/* Shapes, Tables, Texts, Images, and Signature Fields */}
                {(section.shapes && section.shapes.length > 0) || (section.tables && section.tables.length > 0) || ((section as any).texts && (section as any).texts.length > 0) || ((section as any).images && (section as any).images.length > 0) || (section.signatureFields && section.signatureFields.length > 0) ? (
                  <div className="relative mt-4 bg-gray-50 rounded" style={{ position: "relative", minHeight: `${canvasHeights[section.id] || 400}px`, pointerEvents: "none" }}>
                    {section.shapes && section.shapes.map((shape, sIndex) => {
                      const backgroundOverlayOpacity = shape.backgroundImage && shape.backgroundOpacity ? (100 - parseInt(shape.backgroundOpacity || "100")) / 100 : 0;
                      const commonShapeStyle: React.CSSProperties = {
                        position: "absolute",
                        left: `${shape.left}px`,
                        top: `${shape.top}px`,
                        width: `${shape.width}px`,
                        height: `${shape.height}px`,
                        cursor: "default",
                        backgroundColor: shape.backgroundColor,
                        backgroundImage: shape.backgroundImage ? `url(${shape.backgroundImage})` : undefined,
                        backgroundSize: shape.backgroundImage ? shape.backgroundSize : undefined,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        borderWidth: shape.borderWidth ? `${shape.borderWidth}px` : "0px",
                        borderColor: shape.borderColor,
                        borderStyle: shape.borderWidth ? "solid" : "none",
                      };

                      return (
                        <div key={`shape-${sIndex}`} style={{ pointerEvents: "none" }}>
                          {shape.type === "circle" ? (
                            <div
                              style={{
                                ...commonShapeStyle,
                                borderRadius: "50%",
                              }}
                            >
                              {shape.backgroundImage && backgroundOverlayOpacity > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: `rgba(255, 255, 255, ${backgroundOverlayOpacity})`,
                                    borderRadius: "50%",
                                    pointerEvents: "none",
                                  }}
                                />
                              )}
                            </div>
                          ) : shape.type === "triangle" ? (
                            <div
                              style={{
                                position: "absolute",
                                left: `${shape.left}px`,
                                top: `${shape.top}px`,
                                width: 0,
                                height: 0,
                                borderLeft: `${shape.width / 2}px solid transparent`,
                                borderRight: `${shape.width / 2}px solid transparent`,
                                borderBottom: `${shape.height}px solid ${shape.backgroundColor}`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                ...commonShapeStyle,
                                borderRadius: shape.borderRadius ? `${shape.borderRadius}px` : "0px",
                              }}
                            >
                              {shape.backgroundImage && backgroundOverlayOpacity > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: `rgba(255, 255, 255, ${backgroundOverlayOpacity})`,
                                    borderRadius: shape.borderRadius ? `${shape.borderRadius}px` : "0px",
                                    pointerEvents: "none",
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {section.tables && section.tables.map((table, tIndex) => (
                      <div key={`table-${tIndex}`} style={{ pointerEvents: "auto" }}>
                        <TableEditor
                          id={`table-${section.id}-${tIndex}`}
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
                          top={table.top}
                          left={table.left}
                          selected={false}
                          onSelect={() => {}}
                          onUpdate={() => {}}
                        />
                      </div>
                    ))}
                    {(section as any).texts && (section as any).texts.map((text: any, tIndex: number) => (
                      <div key={`text-${tIndex}`} style={{ pointerEvents: "auto" }}>
                        <TextEditor
                          id={`text-${section.id}-${tIndex}`}
                          content={text.content}
                          top={text.top}
                          left={text.left}
                          width={text.width}
                          height={text.height}
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
                    {(section as any).images && (section as any).images.map((image: any, iIndex: number) => (
                      <div key={`image-${iIndex}`} style={{ pointerEvents: "auto" }}>
                        <ImageEditor
                          id={`image-${section.id}-${iIndex}`}
                          url={image.url}
                          width={image.width}
                          height={image.height}
                          opacity={image.opacity}
                          borderWidth={image.borderWidth}
                          borderColor={image.borderColor}
                          borderRadius={image.borderRadius}
                          top={image.top}
                          left={image.left}
                          selected={false}
                          onSelect={() => {}}
                          onUpdate={() => {}}
                        />
                      </div>
                    ))}
                    {section.signatureFields && section.signatureFields.map((field, sIndex) => {
                      const recipient = proposal.signatories?.find((s) => s.id === field.recipientId);
                      return (
                        <div
                          key={`signature-${sIndex}`}
                          style={{
                            position: "absolute",
                            left: `${field.left}px`,
                            top: `${field.top}px`,
                            width: `${field.width}px`,
                            height: `${field.height}px`,
                            borderRadius: field.borderRadius ? `${field.borderRadius}px` : "0px",
                            borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
                            borderStyle: "dashed",
                            borderColor: field.borderColor || "#d1d5db",
                            backgroundColor: "#f1f5f9",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", fontWeight: "bold", padding: "4px 8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}>
                              {recipient?.name || "Unknown"}
                            </div>
                            {recipient?.role && (
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                                {recipient.role}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
