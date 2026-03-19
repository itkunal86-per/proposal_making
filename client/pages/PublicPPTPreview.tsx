import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiConfig } from "@/lib/apiConfig";

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

interface PublicPPTResponse {
  proposal_title: string;
  ppt_data: PPTData;
}

export default function PublicPPTPreview() {
  const { token } = useParams<{ token: string }>();
  const [pptData, setPPTData] = useState<PPTData | null>(null);
  const [proposalTitle, setProposalTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [appliedStyle, setAppliedStyle] = useState<PPTStyleData | null>(null);

  useEffect(() => {
    fetchPPTData();
  }, [token]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pptData) return;
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, pptData]);

  const fetchPPTData = async () => {
    if (!token) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try the public proposal endpoint which should include PPT data
      const url = `${apiConfig.endpoints.publicProposal}/${token}`;
      console.log("Fetching proposal data from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        setError(errorData.error || "Failed to load PPT presentation");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Proposal data loaded:", data);

      // Extract PPT data from the proposal response
      if (data.ppt_json) {
        setPPTData(data.ppt_json);
        setProposalTitle(data.title || "Presentation");
        if (data.ppt_style) {
          setAppliedStyle(data.ppt_style);
        }
      } else {
        setError("This proposal does not have a PPT presentation available");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching PPT data:", err);
      setError("Failed to load PPT presentation. Please check the share link and try again.");
      setLoading(false);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (pptData && currentSlideIndex < pptData.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const getBackgroundStyle = () => {
    if (!appliedStyle) return {};
    return {
      backgroundColor: appliedStyle.background_color || "#ffffff",
    };
  };

  const getTitleStyle = () => {
    if (!appliedStyle) return {};
    return {
      color: appliedStyle.title_font_color || "#000000",
      fontSize: appliedStyle.title_font_size || "48px",
      fontFamily: appliedStyle.title_font || "Arial",
    };
  };

  const getBulletStyle = () => {
    if (!appliedStyle) return {};
    return {
      color: appliedStyle.body_font_color || "#333333",
      fontSize: appliedStyle.body_font_size || "24px",
      fontFamily: appliedStyle.body_font || "Arial",
    };
  };

  const getTitleColor = (slideType: string) => {
    if (!appliedStyle) {
      return slideType === "title" ? "text-white" : "text-slate-900";
    }
    return "";
  };

  const getBulletColor = (slideType: string) => {
    if (!appliedStyle) {
      return slideType === "title" ? "text-white" : "text-slate-700";
    }
    return "";
  };

  const getSlideBackgroundColor = (slideType: string) => {
    if (appliedStyle) {
      return "";
    }
    switch (slideType) {
      case "title":
        return "bg-blue-600";
      case "content":
        return "bg-white";
      case "timeline":
        return "bg-purple-600";
      case "pricing":
        return "bg-emerald-600";
      default:
        return "bg-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !pptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error || "Presentation not found"}
          </h1>
          <p className="text-slate-600">
            The presentation you're looking for is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const slides = pptData.slides || [];
  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No slides</h1>
          <p className="text-slate-600">This presentation has no slides.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4 bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-white">{proposalTitle} - PPT Preview</h1>
        </div>
        <p className="text-xs text-slate-400">Tip: Use Arrow keys (← →) to navigate between slides</p>
      </div>

      {/* Main Content - Slide Display */}
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
              <div
                className={`mt-8 pt-8 border-t ${
                  currentSlide.type === "content" ? "border-slate-300" : "border-slate-400"
                }`}
                style={appliedStyle ? { borderColor: appliedStyle.body_font_color || "#999" } : {}}
              >
                <p
                  className={`text-sm italic ${getBulletColor(currentSlide.type)}`}
                  style={
                    appliedStyle
                      ? {
                          color: appliedStyle.body_font_color || "#CCCCCC",
                          fontSize: "14px",
                        }
                      : {}
                  }
                >
                  Notes: {currentSlide.notes}
                </p>
              </div>
            )}
          </div>
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
  );
}
