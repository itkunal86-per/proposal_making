import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPublicProposal, type Proposal } from "@/services/proposalsService";
import { replaceVariables, decodeHtmlEntities } from "@/lib/variableUtils";

export default function ProposalPublicView() {
  const { token } = useParams<{ token: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const loadProposal = async () => {
      if (!token) {
        setError("Invalid sharing link");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Loading public proposal with token:", token);
        const data = await getPublicProposal(token);
        console.log("Loaded proposal data:", data);

        if (data) {
          console.log("Proposal sections:", data.sections.map(s => ({
            id: s.id,
            title: s.title,
            hasContent: !!s.content,
            shapesCount: s.shapes?.length || 0,
            textsCount: (s as any).texts?.length || 0,
            tablesCount: s.tables?.length || 0,
            imagesCount: (s as any).images?.length || 0,
          })));
          setProposal(data);
        } else {
          setError("Proposal not found or link has expired");
        }
      } catch (err) {
        console.error("Error loading proposal:", err);
        setError("Failed to load proposal");
      } finally {
        setIsLoading(false);
      }
    };

    loadProposal();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">{error}</h1>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Proposal not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div ref={contentRef} className="max-w-4xl mx-auto bg-white p-8 shadow-sm mt-6 mb-6">
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
                      __html: decodeHtmlEntities(replaceVariables(section.content, [])),
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
                            __html: decodeHtmlEntities(replaceVariables(content || "", [])),
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
                            __html: decodeHtmlEntities(replaceVariables(content || "", [])),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shapes, Texts, Tables, Images, and Media Container */}
              <div
                style={{
                  position: "relative",
                  minHeight: section.shapes || section.tables || (section as any).texts || (section as any).images ? "200px" : "0px",
                }}
              >
                {/* Shapes */}
                {section.shapes && section.shapes.length > 0 && (
                  <>
                    {section.shapes.map((shape) => (
                      <div
                        key={shape.id}
                        style={{
                          position: "absolute",
                          top: `${shape.top}px`,
                          left: `${shape.left}px`,
                          width: `${shape.width}px`,
                          height: `${shape.height}px`,
                          backgroundColor: shape.backgroundColor,
                          backgroundImage: shape.backgroundImage ? `url(${shape.backgroundImage})` : undefined,
                          backgroundSize: shape.backgroundSize || "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          borderRadius:
                            shape.type === "circle"
                              ? "50%"
                              : shape.type === "triangle"
                                ? "0"
                                : shape.borderRadius
                                  ? `${shape.borderRadius}px`
                                  : "0",
                          border:
                            shape.borderWidth && shape.borderWidth > 0
                              ? `${shape.borderWidth}px solid ${shape.borderColor || "#000"}`
                              : "none",
                          opacity: shape.backgroundOpacity ? parseInt(shape.backgroundOpacity) / 100 : 1,
                        }}
                      >
                        {shape.type === "triangle" && (
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderLeft: `${shape.width / 2}px solid transparent`,
                              borderRight: `${shape.width / 2}px solid transparent`,
                              borderBottom: `${shape.height}px solid ${shape.backgroundColor}`,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Text Elements */}
                {section.texts && section.texts.length > 0 && (
                  <>
                    {section.texts.map((text) => {
                      // Ensure fontSize has px suffix if it's just a number
                      const fontSize = text.fontSize
                        ? /^\d+$/.test(text.fontSize)
                          ? `${text.fontSize}px`
                          : text.fontSize
                        : "16px";

                      return (
                        <div
                          key={text.id}
                          style={{
                            position: "absolute",
                            top: `${text.top}px`,
                            left: `${text.left}px`,
                            width: text.width ? `${text.width}px` : "auto",
                            height: text.height ? `${text.height}px` : "auto",
                            color: text.color || "#000",
                            fontSize: fontSize,
                            fontWeight: text.fontWeight ? "bold" : "normal",
                            backgroundColor: text.backgroundColor || "transparent",
                            padding: `${text.paddingTop || 0}px ${text.paddingRight || 0}px ${text.paddingBottom || 0}px ${text.paddingLeft || 0}px`,
                            border:
                              text.borderWidth && parseInt(text.borderWidth) > 0
                                ? `${text.borderWidth}px solid ${text.borderColor || "#000"}`
                                : "none",
                            borderRadius: text.borderRadius ? `${text.borderRadius}px` : "0",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: decodeHtmlEntities(text.content || ""),
                          }}
                        />
                      );
                    })}
                  </>
                )}

                {/* Tables */}
                {section.tables && section.tables.length > 0 && (
                  <>
                    {section.tables.map((table) => (
                      <div
                        key={table.id}
                        style={{
                          position: "absolute",
                          top: `${table.top}px`,
                          left: `${table.left}px`,
                          width: `${table.width}px`,
                          height: `${table.height}px`,
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            height: "100%",
                            borderCollapse: "collapse",
                            borderWidth: `${table.borderWidth}px`,
                            borderStyle: "solid",
                            borderColor: table.borderColor,
                          }}
                        >
                          <tbody>
                            {table.cells.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    style={{
                                      border: `${table.borderWidth}px solid ${table.borderColor}`,
                                      padding: `${table.padding}px`,
                                      backgroundColor:
                                        rowIndex === 0 && table.headerBackground
                                          ? table.headerBackground
                                          : table.cellBackground || "transparent",
                                      color: table.textColor || "#000",
                                    }}
                                  >
                                    {cell.content}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                )}

                {/* Images */}
                {(section as any).images && (section as any).images.length > 0 && (
                  <>
                    {(section as any).images.map((image: any, idx: number) => (
                      <div
                        key={`image-${idx}`}
                        style={{
                          position: "absolute",
                          top: `${image.top}px`,
                          left: `${image.left}px`,
                          width: `${image.width}px`,
                          height: `${image.height}px`,
                          opacity: image.opacity ? parseInt(image.opacity) / 100 : 1,
                          borderWidth: image.borderWidth ? `${image.borderWidth}px` : "0px",
                          borderColor: image.borderColor || "#000000",
                          borderStyle: "solid",
                          borderRadius: image.borderRadius ? `${image.borderRadius}px` : "0px",
                          backgroundImage: image.url ? `url(${image.url})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    ))}
                  </>
                )}
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
  );
}
