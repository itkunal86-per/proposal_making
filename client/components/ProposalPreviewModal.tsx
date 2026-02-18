import React, { useRef, useState } from "react";
import { X, Share2, Copy, FileDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Proposal } from "@/services/proposalsService";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { ShapeEditor } from "@/components/ShapeEditor";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";
import { ImageEditor } from "@/components/ImageEditor";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { enableProposalSharing } from "@/services/proposalsService";
import { EmailShareDialog } from "@/components/EmailShareDialog";

interface ProposalPreviewModalProps {
  proposal: Proposal;
  variables?: Array<{ id: string | number; name: string; value: string }>;
  onClose: () => void;
  isTemplate?: boolean;
  onOpenSignatureDetails?: (sectionId: string, fieldIndex: number) => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  proposal,
  variables = [],
  onClose,
  isTemplate = false,
  onOpenSignatureDetails,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [canvasHeights, setCanvasHeights] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionWidths, setSectionWidths] = useState<Record<string, number>>({});
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const newWidths: Record<string, number> = {};
      proposal.sections.forEach((section) => {
        const element = sectionRefs.current.get(section.id);
        if (element) {
          newWidths[section.id] = element.getBoundingClientRect().width;
        }
      });
      setSectionWidths(newWidths);
    });

    proposal.sections.forEach((section) => {
      const element = sectionRefs.current.get(section.id);
      if (element) {
        resizeObserver.observe(element);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [proposal.sections]);

  React.useEffect(() => {
    const newHeights: Record<string, number> = {};

    proposal.sections.forEach((section) => {
      if ((section.shapes && section.shapes.length > 0) ||
          (section.tables && section.tables.length > 0) ||
          ((section as any).texts && (section as any).texts.length > 0) ||
          ((section as any).images && (section as any).images.length > 0) ||
          (section.signatureFields && section.signatureFields.length > 0)) {
        let maxHeight = 100; // flexible minimum height

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

  const handleCopyShareLink = async () => {
    setIsCopyingLink(true);
    try {
      const result = await enableProposalSharing(proposal.id);
      if (result.success && result.token) {
        const generatedShareLink = `${window.location.origin}/preview/proposal/${result.token}`;
        setShareLink(generatedShareLink);

        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(generatedShareLink);
            toast({ title: "Success", description: "Share link copied to clipboard" });
            return;
          } catch (err) {
            // Fall through to fallback
          }
        }

        // Fallback: create temporary input and copy
        const tempInput = document.createElement('input');
        tempInput.value = generatedShareLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast({ title: "Success", description: "Share link copied to clipboard" });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate share link",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Copy share link error:", error);
      toast({
        title: "Error",
        description: "Failed to copy share link",
        variant: "destructive"
      });
    } finally {
      setIsCopyingLink(false);
    }
  };

  const handleShareViaEmail = async () => {
    try {
      const result = await enableProposalSharing(proposal.id);
      if (result.success && result.token) {
        const generatedShareLink = `${window.location.origin}/preview/proposal/${result.token}`;
        setShareLink(generatedShareLink);
        setEmailDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate share link",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Share via email error:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive"
      });
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
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 9998 }}>
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", backgroundColor: "white", zIndex: 9999, overflow: "visible" }}>
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between overflow-visible">
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-2 overflow-visible">
            {!isTemplate && proposal.status === "accepted" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-blue-100">
                    <div className="text-sm font-bold text-slate-900">Share settings</div>
                    <div className="text-xs text-slate-600 mt-2 mb-3">
                      Document Status
                    </div>
                    <div className="inline-flex items-center rounded-lg px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs font-semibold text-green-700">
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-3 leading-relaxed">
                      Anyone with the link can view and sign.
                    </div>
                    {shareLink && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-slate-600 font-medium mb-2">Share Link:</p>
                        <p className="text-xs bg-white px-2 py-1.5 rounded border border-slate-200 text-slate-700 break-all font-mono">
                          {shareLink}
                        </p>
                      </div>
                    )}
                  </div>

                  <DropdownMenuSeparator className="m-0" />

                  {/* Menu Items Section */}
                  <div className="p-2">
                    <DropdownMenuItem
                      onClick={handleCopyShareLink}
                      disabled={isCopyingLink}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div className="p-1.5 bg-blue-100 rounded-md">
                        <Copy className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">Copy link</div>
                        <div className="text-xs text-slate-500">Share via link</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleShareViaEmail}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors mt-1"
                    >
                      <div className="p-1.5 bg-purple-100 rounded-md">
                        <Mail className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">Share via email</div>
                        <div className="text-xs text-slate-500">Send link by email</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleExportPDF}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors mt-1"
                    >
                      <div className="p-1.5 bg-orange-100 rounded-md">
                        <FileDown className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">Download as PDF</div>
                        <div className="text-xs text-slate-500">Export proposal</div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
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
          <div className="flex-1 overflow-y-auto flex justify-center">
            <div ref={contentRef} className="bg-white p-8 shadow-sm max-w-4xl w-full">
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
                      backgroundColor: (section as any).contentStyles?.backgroundColor || undefined,
                      backgroundImage: (section as any).contentStyles?.backgroundImage ? `url(${(section as any).contentStyles?.backgroundImage})` : undefined,
                      backgroundSize: ((section as any).contentStyles?.backgroundImage ? (section as any).contentStyles?.backgroundSize || "cover" : undefined),
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      padding: `${parseInt((section as any).contentStyles?.paddingTop || "0")}px ${parseInt((section as any).contentStyles?.paddingRight || "0")}px ${parseInt((section as any).contentStyles?.paddingBottom || "0")}px ${parseInt((section as any).contentStyles?.paddingLeft || "0")}px`,
                      borderRadius: (section as any).contentStyles?.borderRadius ? `${(section as any).contentStyles?.borderRadius}px` : undefined,
                      fontWeight: (section as any).contentStyles?.bold ? "bold" : "normal",
                      fontStyle: (section as any).contentStyles?.italic ? "italic" : "normal",
                      textDecoration: (section as any).contentStyles?.underline ? "underline" : (section as any).contentStyles?.strikethrough ? "line-through" : "none",
                      position: "relative",
                      minHeight: (section.shapes && section.shapes.length > 0) || (section.tables && section.tables.length > 0) || ((section as any).texts && (section as any).texts.length > 0) || ((section as any).images && (section as any).images.length > 0) || (section.signatureFields && section.signatureFields.length > 0) ? `${canvasHeights[section.id] || 100}px` : undefined,
                    }}
                  >
                    {(section as any).contentStyles?.backgroundImage && (section as any).contentStyles?.backgroundOpacity ? (
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
                          zIndex: 0,
                        }}
                      />
                    ) : null}
                    <div
                      style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100%" }}
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(replaceVariables(section.content, variables)),
                      }}
                    />
                    {/* Positioned Elements Container */}
                    {((section.shapes && section.shapes.length > 0) || (section.tables && section.tables.length > 0) || ((section as any).texts && (section as any).texts.length > 0) || ((section as any).images && (section as any).images.length > 0) || (section.signatureFields && section.signatureFields.length > 0)) && (
                      <>
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
                        {(section as any).texts && (section as any).texts.map((text: any, tIndex: number) => {
                          const sectionPadLeft = parseInt((section as any).contentStyles?.paddingLeft || "12");
                          const sectionPadRight = parseInt((section as any).contentStyles?.paddingRight || "12");
                          return (
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
                                fullWidth={text.fullWidth}
                                parentWidth={sectionWidths[section.id]}
                                sectionPaddingLeft={sectionPadLeft}
                                sectionPaddingRight={sectionPadRight}
                                lineHeight={text.lineHeight}
                              />
                            </div>
                          );
                        })}
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
                          const isSigned = field.status === "signed" && field.signatureDisplayText;
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
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Main signature field box */}
                              <div
                                style={{
                                  flex: 1,
                                  borderRadius: field.borderRadius ? `${field.borderRadius}px 0 0 0` : "0px",
                                  borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
                                  borderStyle: "dashed",
                                  borderColor: isSigned ? "#22c55e" : field.borderColor || "#cbd5e1",
                                  backgroundColor: isSigned ? "#dcfce7" : "#f8fafc",
                                  display: "flex",
                                  flexDirection: "column",
                                  padding: "8px",
                                  cursor: !isSigned ? "pointer" : "default",
                                  pointerEvents: "auto",
                                }}
                                onClick={() => {
                                  if (!isSigned && onOpenSignatureDetails) {
                                    onOpenSignatureDetails(section.id, sIndex);
                                  }
                                }}
                              >
                                {isSigned ? (
                                  <div style={{ textAlign: "center", fontSize: "14px" }}>
                                    <div
                                      style={{
                                        fontFamily: "cursive",
                                        fontStyle: "italic",
                                        fontWeight: "bold",
                                        marginBottom: "4px",
                                        fontSize: "16px",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {field.signature}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: "#4b5563",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: "1.3",
                                      }}
                                    >
                                      {field.signatureDisplayText?.replace(/\\n/g, '\n')}
                                    </div>
                                    {field.position && (
                                      <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px", fontStyle: "italic" }}>
                                        {field.position}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {/* Empty signature space - just the line, label is shown below */}
                                    <div style={{ flex: 1, borderBottom: "1px solid #cbd5e1" }} />
                                  </>
                                )}
                              </div>

                              {/* Label section */}
                              <div style={{
                                textAlign: "center",
                                padding: "8px",
                                backgroundColor: "#f1f5f9",
                                borderRadius: field.borderRadius ? `0 0 ${field.borderRadius}px ${field.borderRadius}px` : "0px",
                                borderWidth: field.borderWidth ? `${field.borderWidth}px` : "2px",
                                borderTopWidth: "0px",
                                borderStyle: "dashed",
                                borderColor: isSigned ? "#22c55e" : field.borderColor || "#cbd5e1",
                                cursor: !isSigned ? "pointer" : "default",
                                pointerEvents: "auto",
                              }}>
                                <div style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "4px 8px",
                                  backgroundColor: "#cbd5e1",
                                  borderRadius: "4px",
                                  color: "#1f2937",
                                }}>
                                  {field.fullName ? `${field.fullName}${field.position ? ` - ${field.position}` : ""}` : `Signature ${sIndex + 1}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
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
                      const hasBackgroundImage = columnStyle?.backgroundImage || contentStyle?.backgroundImage;

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
                            backgroundSize: hasBackgroundImage ? (columnStyle?.backgroundSize || contentStyle?.backgroundSize || "cover") : undefined,
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
                            position: hasBackgroundImage ? "relative" : undefined,
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
                      const hasBackgroundImage = columnStyle?.backgroundImage || contentStyle?.backgroundImage;

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
                            backgroundSize: hasBackgroundImage ? (columnStyle?.backgroundSize || contentStyle?.backgroundSize || "cover") : undefined,
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
                            position: hasBackgroundImage ? "relative" : undefined,
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
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      <EmailShareDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        proposalTitle={proposal.title}
        shareLink={shareLink || ""}
      />
    </div>
  );
};
