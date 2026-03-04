import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  onClose: () => void;
}

export const PPTPreviewModal: React.FC<PPTPreviewModalProps> = ({
  pptData,
  proposalTitle,
  onClose,
}) => {
  console.log("PPTPreviewModal component rendered with props:", { pptData, proposalTitle });
  const { status } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pptStyles, setPPTStyles] = useState<PPTStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [isLoadingStyles, setIsLoadingStyles] = useState(false);

  // Extract ppt_style from pptData if available
  const appliedStyle = pptData?.ppt_style;
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
            setSelectedStyleId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching PPT styles:", error);
      } finally {
        setIsLoadingStyles(false);
      }
    };

    fetchPPTStyles();
  }, [status]);

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
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-800"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
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
              <div className="space-y-3">
                {pptStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedStyleId === style.id
                        ? "border-blue-500 bg-slate-800"
                        : "border-slate-600 bg-slate-800 hover:border-slate-500"
                    }`}
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
