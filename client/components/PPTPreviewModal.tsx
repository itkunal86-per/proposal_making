import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getStoredToken } from "@/lib/auth";
import apiConfig from "@/lib/apiConfig";

interface Slide {
  type: "title" | "content" | "timeline" | "pricing";
  notes: string | null;
  title: string;
  bullets: string[];
}

interface StyleConfig {
  fonts?: {
    body?: {
      size: number;
      family: string;
      weight: string;
    };
    heading?: {
      size: number;
      family: string;
      weight: string;
    };
  };
  colors?: {
    body?: string;
    accent?: string;
    heading?: string;
    background?: string;
  };
}

interface PPTStyleData {
  id: number;
  name: string;
  primary_color: string;
  secondary_color?: string;
  background_color: string;
  title_font: string;
  body_font: string;
  title_font_size?: string | number;
  body_font_size?: string | number;
  title_font_color?: string;
  body_font_color?: string;
  layout_type?: string;
  style_config?: StyleConfig;
  preview_image: string;
  is_active?: boolean;
}

interface PPTData {
  slides: Slide[];
  ppt_style?: PPTStyleData | null;
  ppt_url?: string | null;
}

interface PPTStyle {
  id: number;
  name: string;
  primary_color: string;
  background_color: string;
  title_font: string;
  body_font: string;
  preview_image: string;
}

interface PPTPreviewModalProps {
  pptData: PPTData;
  proposalTitle: string;
  proposalId: string;
  onClose: () => void;
  onStyleApplied?: () => void;
}

export const PPTPreviewModal: React.FC<PPTPreviewModalProps> = ({
  pptData,
  proposalTitle,
  proposalId,
  onClose,
  onStyleApplied,
}) => {
  console.log("PPTPreviewModal component rendered with props:", { pptData, proposalTitle, proposalId });
  const { status } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pptStyles, setPPTStyles] = useState<PPTStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [isLoadingStyles, setIsLoadingStyles] = useState(false);
  const [isApplyingStyle, setIsApplyingStyle] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [appliedStyle, setAppliedStyle] = useState<PPTStyleData | null | undefined>(pptData?.ppt_style);

  // Extract slides from pptData if available
  const slides = pptData?.slides || [];
  const currentSlide = slides[currentSlideIndex];

  React.useEffect(() => {
    console.log("PPTPreviewModal opened with slides:", slides);
    console.log("Total slides count:", slides.length);
    console.log("pptData structure:", JSON.stringify(pptData, null, 2));
  }, [slides, pptData]);

  // Fetch PPT Styles
  useEffect(() => {
    const fetchPPTStyles = async () => {
      if (status !== "ready") return;

      setIsLoadingStyles(true);
      try {
        const token = getStoredToken();
        const response = await fetch(apiConfig.endpoints.pptStyles, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch PPT styles");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setPPTStyles(data.data);
          if (data.data.length > 0) {
            // Select the current proposal's style if it exists, otherwise select the first style
            if (appliedStyle?.id) {
              setSelectedStyleId(appliedStyle.id);
            } else {
              setSelectedStyleId(data.data[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching PPT styles:", error);
      } finally {
        setIsLoadingStyles(false);
      }
    };

    fetchPPTStyles();
  }, [status, appliedStyle?.id]);

  const handleNextSlide = React.useCallback(() => {
    setCurrentSlideIndex((prevIndex) => {
      const nextIndex = Math.min(prevIndex + 1, slides.length - 1);
      console.log("Next clicked. Moving from", prevIndex, "to", nextIndex, "Total:", slides.length);
      return nextIndex;
    });
  }, [slides.length]);

  const handlePrevSlide = React.useCallback(() => {
    setCurrentSlideIndex((prevIndex) => {
      const nextIndex = Math.max(prevIndex - 1, 0);
      console.log("Prev clicked. Moving from", prevIndex, "to", nextIndex, "Total:", slides.length);
      return nextIndex;
    });
  }, [slides.length]);

  const getSlideBackgroundColor = (type: string) => {
    // If ppt_style exists, use its background color for all slides
    if (appliedStyle) {
      return "";
    }

    // Default fallback colors
    switch (type) {
      case "title":
        return "bg-gradient-to-br from-blue-600 to-blue-800";
      case "timeline":
        return "bg-gradient-to-br from-purple-600 to-purple-800";
      case "pricing":
        return "bg-gradient-to-br from-green-600 to-green-800";
      default:
        return "bg-gradient-to-br from-slate-100 to-slate-200";
    }
  };

  const getBackgroundStyle = () => {
    if (appliedStyle?.background_color) {
      return {
        backgroundColor: appliedStyle.background_color,
      };
    }
    return {};
  };

  const getTitleColor = (type: string) => {
    if (appliedStyle?.title_font_color) {
      return "";
    }
    return type === "content" ? "text-slate-900" : "text-white";
  };

  const getTitleStyle = () => {
    if (appliedStyle) {
      return {
        color: appliedStyle.title_font_color || "#FFFFFF",
        fontSize: `${appliedStyle.title_font_size || 42}px`,
        fontFamily: appliedStyle.title_font || "inherit",
      };
    }
    return {};
  };

  const getBulletColor = (type: string) => {
    if (appliedStyle?.body_font_color) {
      return "";
    }
    return type === "content" ? "text-slate-700" : "text-slate-100";
  };

  const getBulletStyle = () => {
    if (appliedStyle) {
      return {
        color: appliedStyle.body_font_color || "#CCCCCC",
        fontSize: `${appliedStyle.body_font_size || 22}px`,
        fontFamily: appliedStyle.body_font || "inherit",
      };
    }
    return {};
  };

  React.useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  React.useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  const handleApplyStyle = async (styleId: number) => {
    // Don't call API if clicking the already selected style
    if (styleId === appliedStyle?.id) {
      return;
    }

    setIsApplyingStyle(true);
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`${apiConfig.endpoints.applyPPTStyle}/${proposalId}/apply-style`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ style_id: styleId }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply style");
      }

      const data = await response.json();
      console.log("Style applied successfully:", data);

      // Find the applied style object
      const newStyle = pptStyles.find(s => s.id === styleId);

      // Update the selected style and applied style
      setSelectedStyleId(styleId);

      // Since we don't have the full PPTStyleData from the styles list, we need to fetch it again
      // For now, update with basic info and refresh the view
      if (newStyle) {
        // Create a PPTStyleData object from the PPTStyle
        const updatedStyle: PPTStyleData = {
          ...newStyle,
          title_font_color: "#FFFFFF",
          body_font_color: "#CCCCCC",
        };
        setAppliedStyle(updatedStyle);
      }

      // Call the optional callback to refresh the parent
      if (onStyleApplied) {
        onStyleApplied();
      }
    } catch (error) {
      console.error("Error applying style:", error);
    } finally {
      setIsApplyingStyle(false);
    }
  };

  const handleDownloadPPT = async () => {
    if (!pptData?.ppt_url) {
      console.error("No PPT URL available");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(pptData.ppt_url);
      if (!response.ok) {
        throw new Error("Failed to download PPT");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${proposalTitle}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PPT:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!currentSlide) {
    console.warn("No current slide found. currentSlideIndex:", currentSlideIndex, "slides.length:", slides.length, "slides:", slides);
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 9998 }}>
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-red-600 font-bold">Error: No slides found</p>
            <p className="text-slate-600 mt-2">Slides count: {slides.length}</p>
            <p className="text-slate-600 mt-2">Current index: {currentSlideIndex}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 9998 }}>
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", zIndex: 9999 }}>
        {/* Header */}
        <div className="border-b border-slate-700 px-6 py-4 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">{proposalTitle} - PPT Preview</h1>
            <div className="flex items-center gap-2">
              {pptData?.ppt_url && (
                <Button
                  onClick={handleDownloadPPT}
                  disabled={isDownloading}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 hover:bg-slate-800 flex items-center gap-2"
                  title="Download PPT"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-xs text-white">
                    {isDownloading ? "Downloading..." : "Download"}
                  </span>
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Tip: Use Arrow keys (← →) to navigate between slides</p>
        </div>

        {/* Main Content - Slide Display and Styles */}
        <div className="flex-1 flex bg-black overflow-hidden">
          {/* Left Side - Slide Display */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl">
              <div
                className={`h-full w-full ${getSlideBackgroundColor(currentSlide.type)} flex flex-col justify-center p-12`}
                style={getBackgroundStyle()}
              >
                {/* Slide Title */}
                <h2
                  className={`font-bold mb-8 ${getTitleColor(currentSlide.type)}`}
                  style={getTitleStyle()}
                >
                  {currentSlide.title}
                </h2>

                {/* Slide Bullets */}
                {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                  <ul className="space-y-4">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start ${getBulletColor(currentSlide.type)}`}
                        style={getBulletStyle()}
                      >
                        <span className="mr-4">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Slide Notes (if available) */}
                {currentSlide.notes && (
                  <div className={`mt-8 pt-8 border-t ${currentSlide.type === "content" ? "border-slate-300" : "border-slate-400"}`}
                    style={appliedStyle ? { borderColor: appliedStyle.body_font_color || "#999" } : {}}>
                    <p
                      className={`text-sm italic ${getBulletColor(currentSlide.type)}`}
                      style={appliedStyle ? {
                        color: appliedStyle.body_font_color || "#CCCCCC",
                        fontSize: "14px",
                      } : {}}
                    >
                      Notes: {currentSlide.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - PPT Styles */}
          <div className="w-64 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-4">PPT Styles</h3>

            {isLoadingStyles ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : pptStyles.length > 0 ? (
              <div className="space-y-3 relative">
                {/* Loading Overlay */}
                {isApplyingStyle && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      <p className="text-xs text-white">Applying style...</p>
                    </div>
                  </div>
                )}
                {pptStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleApplyStyle(style.id)}
                    disabled={isApplyingStyle}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedStyleId === style.id
                        ? "border-blue-500 bg-slate-800"
                        : "border-slate-600 bg-slate-800 hover:border-slate-500"
                    } ${isApplyingStyle ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color Preview */}
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-500"
                          style={{ backgroundColor: style.primary_color }}
                          title="Primary Color"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-slate-500"
                          style={{ backgroundColor: style.background_color }}
                          title="Background Color"
                        />
                      </div>
                      {/* Style Name */}
                      <div className="text-left flex-1">
                        <p className="text-xs font-medium text-white truncate">{style.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {style.title_font} / {style.body_font}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No styles available</p>
            )}
          </div>
        </div>

        {/* Footer with Controls */}
        <div className="border-t border-slate-700 px-6 py-4 bg-slate-900 flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Slide {currentSlideIndex + 1} of {slides.length}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Slide Indicator */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? "bg-blue-500 w-8"
                      : "bg-slate-600 w-2 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-slate-400 text-sm">
            {currentSlide.type.charAt(0).toUpperCase() + currentSlide.type.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};
