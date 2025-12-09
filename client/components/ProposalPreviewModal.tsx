import React, { useRef, useState } from "react";
import { X, Share2, Download, Mail, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Proposal } from "@/services/proposalsService";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { ShareLinkDialog } from "@/components/ShareLinkDialog";
import { ShapeEditor } from "@/components/ShapeEditor";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";

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
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleExportPDF = async () => {
    try {
      const response = await import("html2pdf.js");
      const html2pdf = response.default;

      const element = contentRef.current;
      if (!element) {
        toast({ title: "Error", description: "Could not find content to export" });
        return;
      }

      const opt = {
        margin: 10,
        filename: `${proposal.title}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" as const },
      };

      html2pdf().set(opt).from(element).save();
      toast({ title: "Success", description: "Proposal exported as PDF" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({ title: "Error", description: "Failed to export PDF" });
    }
  };

  const handleShareLink = () => {
    setShowShareDialog(true);
  };

  const handleSendEmail = () => {
    toast({ title: "Coming soon", description: "Send email feature will be available soon" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40">
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-2">
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleShareLink}>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSendEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <div className="flex-1 overflow-y-auto bg-slate-50">
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
                {proposal.title}
              </div>
            </div>

            {/* Sections */}
            {proposal.sections.map((section) => (
              <div key={section.id} className="mb-8">
                {/* Section Title */}
                <div
                  className="mb-4 relative"
                  style={{
                    color: (section as any).titleStyles?.color,
                    fontSize: `${(section as any).titleStyles?.fontSize || 24}px`,
                    textAlign: ((section as any).titleStyles?.textAlign || "left") as any,
                    backgroundColor: (section as any).titleStyles?.backgroundColor,
                    backgroundImage: (section as any).titleStyles?.backgroundImage ? `url(${(section as any).titleStyles?.backgroundImage})` : undefined,
                    backgroundSize: (section as any).titleStyles?.backgroundSize || "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    padding: `${(section as any).titleStyles?.paddingTop || 0}px ${(section as any).titleStyles?.paddingRight || 0}px ${(section as any).titleStyles?.paddingBottom || 0}px ${(section as any).titleStyles?.paddingLeft || 0}px`,
                    borderRadius: (section as any).titleStyles?.borderRadius ? `${(section as any).titleStyles?.borderRadius}px` : undefined,
                    fontWeight: (section as any).titleStyles?.bold ? "bold" : "normal",
                    fontStyle: (section as any).titleStyles?.italic ? "italic" : "normal",
                    textDecoration: (section as any).titleStyles?.underline ? "underline" : (section as any).titleStyles?.strikethrough ? "line-through" : "none",
                  }}
                >
                  {(section as any).titleStyles?.backgroundImage && (section as any).titleStyles?.backgroundOpacity && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: `rgba(255, 255, 255, ${(100 - parseInt((section as any).titleStyles?.backgroundOpacity || "100")) / 100})`,
                        borderRadius: (section as any).titleStyles?.borderRadius ? `${(section as any).titleStyles?.borderRadius}px` : undefined,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {section.title}
                  </div>
                </div>

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
              </div>
            ))}
          </div>
        </div>
      </div>

      <ShareLinkDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
      />
    </div>
  );
};
