import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";
import { apiConfig } from "@/lib/apiConfig";
import { ShapeEditor } from "@/components/ShapeEditor";
import { TableEditor } from "@/components/TableEditor";
import { TextEditor } from "@/components/TextEditor";
import { ImageEditor } from "@/components/ImageEditor";
import { SignatureDetailsModal } from "@/components/SignatureDetailsModal";
import { SignatureFieldView } from "@/components/SignatureFieldView";

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  layout?: string;
  columnContents?: string[];
  columnStyles?: any[];
  contentStyles?: Record<string, any>;
  titleStyles?: Record<string, any>;
  media?: Array<{ type: string; url: string }>;
  comments?: any[];
  shapes?: any[];
  tables?: any[];
  texts?: any[];
  images?: any[];
  signatureFields?: any[];
  videos?: any[];
}

interface PublicProposalResponse {
  id: string | number;
  title: string;
  client?: string;
  client_id?: string;
  status: string;
  createdBy?: string | null;
  createdAt?: number;
  updatedAt?: number;
  sections: ProposalSection[];
  settings?: Record<string, any>;
  titleStyles?: Record<string, any>;
  signatories?: any[];
}

export default function PublicProposal() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<PublicProposalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canvasHeights, setCanvasHeights] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionWidths, setSectionWidths] = useState<Record<string, number>>({});
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);

  useEffect(() => {
    fetchProposal();
  }, [token]);

  const fetchProposal = async () => {
    if (!token) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiConfig.endpoints.publicProposal}/${token}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to load proposal");
        setLoading(false);
        return;
      }

      const data: PublicProposalResponse = await response.json();

      // Normalize signature fields from API (handle both camelCase and snake_case)
      const normalizedData = {
        ...data,
        sections: data.sections.map(section => ({
          ...section,
          signatureFields: section.signatureFields?.map(field => ({
            id: field.id,
            recipientId: field.recipientId || field.recipient_id || "",
            sectionId: field.sectionId || field.section_id || "",
            width: field.width,
            height: field.height,
            top: field.top,
            left: field.left,
            status: field.status,
            signedAt: field.signedAt || field.signed_at,
            signatureData: field.signatureData || field.signature_data,
            signatureDisplayText: field.signatureDisplayText || field.signature_display_text,
            borderColor: field.borderColor || field.border_color,
            borderWidth: field.borderWidth || field.border_width,
            borderRadius: field.borderRadius || field.border_radius,
            fullName: field.fullName || field.full_name,
            email: field.email,
            position: field.position,
            signature: field.signature,
          })) || []
        }))
      };

      setProposal(normalizedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch proposal:", err);
      setError("Failed to load proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!proposal) return;

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
  }, [proposal]);

  useEffect(() => {
    if (!proposal) return;

    const newHeights: Record<string, number> = {};

    proposal.sections.forEach((section) => {
      if (
        (section.shapes && section.shapes.length > 0) ||
        (section.tables && section.tables.length > 0) ||
        ((section as any).texts && (section as any).texts.length > 0) ||
        ((section as any).images && (section as any).images.length > 0) ||
        (section.signatureFields && section.signatureFields.length > 0)
      ) {
        let maxHeight = 100;

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

        newHeights[section.id] = maxHeight;
      }
    });

    setCanvasHeights(newHeights);
  }, [proposal]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId);
    if (element) {
      setActiveSection(sectionId);
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="rounded-lg bg-white p-8 shadow-sm max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Proposal Not Found
          </h1>
          <p className="text-slate-600 mb-4">
            {error || "This proposal is no longer available."}
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            Return to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-48 border-r border-slate-200 bg-white overflow-y-auto hidden lg:block">
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
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                title={section.title}
              >
                <div className="truncate">{section.title}</div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto flex justify-center p-4 lg:p-8">
          <div
            ref={contentRef}
            className="bg-white p-8 shadow-sm max-w-4xl w-full rounded-lg"
          >
            {/* Title */}
            <div
              className="mb-8 relative"
              style={{
                color: (proposal as any).titleStyles?.color,
                fontSize: `${(proposal as any).titleStyles?.fontSize || 32}px`,
                textAlign:
                  ((proposal as any).titleStyles?.textAlign || "left") as any,
                backgroundColor: (proposal as any).titleStyles?.backgroundColor,
                backgroundImage: (proposal as any).titleStyles?.backgroundImage
                  ? `url(${(proposal as any).titleStyles?.backgroundImage})`
                  : undefined,
                backgroundSize:
                  (proposal as any).titleStyles?.backgroundSize || "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: `${(proposal as any).titleStyles?.paddingTop || 0}px ${
                  (proposal as any).titleStyles?.paddingRight || 0
                }px ${(proposal as any).titleStyles?.paddingBottom || 0}px ${
                  (proposal as any).titleStyles?.paddingLeft || 0
                }px`,
                borderRadius: (proposal as any).titleStyles?.borderRadius
                  ? `${(proposal as any).titleStyles?.borderRadius}px`
                  : undefined,
                fontWeight: (proposal as any).titleStyles?.bold
                  ? "bold"
                  : "normal",
                fontStyle: (proposal as any).titleStyles?.italic
                  ? "italic"
                  : "normal",
                textDecoration: (proposal as any).titleStyles?.underline
                  ? "underline"
                  : (proposal as any).titleStyles?.strikethrough
                    ? "line-through"
                    : "none",
              }}
            >
              {(proposal as any).titleStyles?.backgroundImage &&
                (proposal as any).titleStyles?.backgroundOpacity && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: `rgba(255, 255, 255, ${
                        (100 -
                          parseInt(
                            (proposal as any).titleStyles?.backgroundOpacity ||
                              "100"
                          )) /
                        100
                      })`,
                      borderRadius: (proposal as any).titleStyles?.borderRadius
                        ? `${(proposal as any).titleStyles?.borderRadius}px`
                        : undefined,
                      pointerEvents: "none",
                    }}
                  />
                )}
              <div style={{ position: "relative", zIndex: 1 }}>
                {decodeHtmlEntities(proposal.title)}
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
                {section.layout !== "two-column" &&
                section.layout !== "three-column" ? (
                  <div
                    className="relative prose prose-sm max-w-none"
                    style={{
                      color: (section as any).contentStyles?.color,
                      fontSize: `${
                        (section as any).contentStyles?.fontSize || 16
                      }px`,
                      textAlign:
                        ((section as any).contentStyles?.textAlign ||
                          "left") as any,
                      backgroundColor:
                        (section as any).contentStyles?.backgroundColor ||
                        undefined,
                      backgroundImage: (section as any).contentStyles
                        ?.backgroundImage
                        ? `url(${(section as any).contentStyles?.backgroundImage})`
                        : undefined,
                      backgroundSize: (section as any).contentStyles
                        ?.backgroundImage
                        ? (section as any).contentStyles?.backgroundSize ||
                          "cover"
                        : undefined,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      padding: `${parseInt(
                        (section as any).contentStyles?.paddingTop || "0"
                      )}px ${parseInt(
                        (section as any).contentStyles?.paddingRight || "0"
                      )}px ${parseInt(
                        (section as any).contentStyles?.paddingBottom || "0"
                      )}px ${parseInt(
                        (section as any).contentStyles?.paddingLeft || "0"
                      )}px`,
                      borderRadius: (section as any).contentStyles?.borderRadius
                        ? `${(section as any).contentStyles?.borderRadius}px`
                        : undefined,
                      fontWeight: (section as any).contentStyles?.bold
                        ? "bold"
                        : "normal",
                      fontStyle: (section as any).contentStyles?.italic
                        ? "italic"
                        : "normal",
                      textDecoration: (section as any).contentStyles?.underline
                        ? "underline"
                        : (section as any).contentStyles?.strikethrough
                          ? "line-through"
                          : "none",
                      position: "relative",
                      minHeight:
                        (section.shapes && section.shapes.length > 0) ||
                        (section.tables && section.tables.length > 0) ||
                        ((section as any).texts &&
                          (section as any).texts.length > 0) ||
                        ((section as any).images &&
                          (section as any).images.length > 0) ||
                        (section.signatureFields &&
                          section.signatureFields.length > 0)
                          ? `${canvasHeights[section.id] || 100}px`
                          : undefined,
                    }}
                  >
                    {(section as any).contentStyles?.backgroundImage &&
                    (section as any).contentStyles?.backgroundOpacity ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: `rgba(255, 255, 255, ${
                            (100 -
                              parseInt(
                                (section as any).contentStyles
                                  ?.backgroundOpacity || "100"
                              )) /
                            100
                          })`,
                          borderRadius: (section as any).contentStyles
                            ?.borderRadius
                            ? `${(section as any).contentStyles?.borderRadius}px`
                            : undefined,
                          pointerEvents: "none",
                          zIndex: 0,
                        }}
                      />
                    ) : null}
                    <div
                      style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100%" }}
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(section.content),
                      }}
                    />
                    {/* Positioned Elements */}
                    {((section.shapes && section.shapes.length > 0) ||
                      (section.tables && section.tables.length > 0) ||
                      ((section as any).texts &&
                        (section as any).texts.length > 0) ||
                      ((section as any).images &&
                        (section as any).images.length > 0) ||
                      (section.signatureFields &&
                        section.signatureFields.length > 0)) && (
                      <>
                        {section.shapes &&
                          section.shapes.map((shape, sIndex) => {
                            const backgroundOverlayOpacity =
                              shape.backgroundImage && shape.backgroundOpacity
                                ? (100 -
                                    parseInt(
                                      shape.backgroundOpacity || "100"
                                    )) /
                                  100
                                : 0;
                            const commonShapeStyle: React.CSSProperties = {
                              position: "absolute",
                              left: `${shape.left}px`,
                              top: `${shape.top}px`,
                              width: `${shape.width}px`,
                              height: `${shape.height}px`,
                              cursor: "default",
                              backgroundColor: shape.backgroundColor,
                              backgroundImage: shape.backgroundImage
                                ? `url(${shape.backgroundImage})`
                                : undefined,
                              backgroundSize: shape.backgroundImage
                                ? shape.backgroundSize
                                : undefined,
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              borderWidth: shape.borderWidth
                                ? `${shape.borderWidth}px`
                                : "0px",
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
                                    {shape.backgroundImage &&
                                      backgroundOverlayOpacity > 0 && (
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
                                      borderRadius: shape.borderRadius
                                        ? `${shape.borderRadius}px`
                                        : "0px",
                                    }}
                                  >
                                    {shape.backgroundImage &&
                                      backgroundOverlayOpacity > 0 && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: `rgba(255, 255, 255, ${backgroundOverlayOpacity})`,
                                            borderRadius: shape.borderRadius
                                              ? `${shape.borderRadius}px`
                                              : "0px",
                                            pointerEvents: "none",
                                          }}
                                        />
                                      )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {section.tables &&
                          section.tables.map((table, tIndex) => (
                            <div
                              key={`table-${tIndex}`}
                              style={{ pointerEvents: "auto" }}
                            >
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
                        {(section as any).texts &&
                          (section as any).texts.map(
                            (text: any, tIndex: number) => {
                              const sectionPadLeft = parseInt(
                                (section as any).contentStyles?.paddingLeft ||
                                  "12"
                              );
                              const sectionPadRight = parseInt(
                                (section as any).contentStyles?.paddingRight ||
                                  "12"
                              );
                              return (
                                <div
                                  key={`text-${tIndex}`}
                                  style={{ pointerEvents: "auto" }}
                                >
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
                            }
                          )}
                        {(section as any).images &&
                          (section as any).images.map(
                            (image: any, iIndex: number) => (
                              <div
                                key={`image-${iIndex}`}
                                style={{ pointerEvents: "auto" }}
                              >
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
                            )
                          )}

                        {section.signatureFields &&
                          section.signatureFields.map((field: any, sIndex: number) => (
                            <SignatureFieldView
                              key={`signature-${sIndex}`}
                              field={field}
                              sIndex={sIndex}
                              onClick={() => {
                                const sectionIndex = proposal.sections.findIndex(s => s.id === section.id);
                                setSelectedSignature({ sectionIndex, fieldIndex: sIndex });
                                setSignatureModalOpen(true);
                              }}
                              interactive={true}
                            />
                          ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Multi-column layout */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          section.layout === "two-column"
                            ? "1fr 1fr"
                            : "1fr 1fr 1fr",
                        gap: `${
                          typeof (section as any).titleStyles?.columnGap ===
                          "number"
                            ? (section as any).titleStyles.columnGap
                            : 0
                        }px`,
                      }}
                    >
                      {section.layout === "two-column" &&
                        [
                          (section as any).columnContents?.[0],
                          (section as any).columnContents?.[1],
                        ].map((content, colIndex) => (
                          <div
                            key={colIndex}
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: decodeHtmlEntities(content || ""),
                            }}
                          />
                        ))}
                      {section.layout === "three-column" &&
                        [
                          (section as any).columnContents?.[0],
                          (section as any).columnContents?.[1],
                          (section as any).columnContents?.[2],
                        ].map((content, colIndex) => (
                          <div
                            key={colIndex}
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: decodeHtmlEntities(content || ""),
                            }}
                          />
                        ))}
                    </div>
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
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <video
                            src={media.url}
                            controls
                            className="max-w-full h-auto rounded"
                            style={{ display: "block" }}
                            onError={(e) => {
                              (e.target as HTMLVideoElement).style.display =
                                "none";
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

      {/* Signature Modal */}
      {signatureModalOpen && selectedSignature && proposal && (
        <SignatureDetailsModal
          open={signatureModalOpen}
          signatureDetails={proposal.sections[selectedSignature.sectionIndex]?.signatureFields?.[selectedSignature.fieldIndex] || {}}
          onClose={() => {
            setSignatureModalOpen(false);
            setSelectedSignature(null);
          }}
          onSave={async (details) => {
            // Update the proposal with signature data
            const updatedProposal = {
              ...proposal,
              sections: proposal.sections.map((s, sIdx) =>
                sIdx === selectedSignature.sectionIndex
                  ? {
                      ...s,
                      signatureFields: (s.signatureFields || []).map((f, fIdx) =>
                        fIdx === selectedSignature.fieldIndex ? { ...f, ...details } : f
                      ),
                    }
                  : s
              ),
            };
            setProposal(updatedProposal);

            // Call API to update signature in database
            try {
              const section = proposal.sections[selectedSignature.sectionIndex];
              const sectionId = section?.id;

              // Format all signature fields for the API
              const signatureFields = (section?.signatureFields || []).map((field) => ({
                id: field.id,
                recipientId: field.recipientId || null,
                sectionId: field.sectionId,
                width: field.width,
                height: field.height,
                top: field.top,
                left: field.left,
                status: field.status,
                signedAt: field.signedAt,
                signatureDisplayText: field.signatureDisplayText,
                borderColor: field.borderColor,
                borderWidth: field.borderWidth,
                borderRadius: field.borderRadius,
                fullName: field.fullName,
                email: field.email,
                position: field.position,
                signature: field.signature,
              }));

              const response = await fetch(
                "https://propai-api.hirenq.com/api/public/proposal/update/signature",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    section_id: sectionId,
                    token: token,
                    signatureFields: signatureFields,
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to update signature:", errorData);
                toast({
                  title: "Error",
                  description: "Failed to save signature to database",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error updating signature:", error);
              toast({
                title: "Error",
                description: "Failed to save signature to database",
                variant: "destructive",
              });
            }

            setSignatureModalOpen(false);
            setSelectedSignature(null);
            toast({ title: "Signature saved successfully" });
          }}
        />
      )}
    </div>
  );
}
