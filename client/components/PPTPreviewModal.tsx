import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  type: "title" | "content" | "timeline" | "pricing";
  notes: string | null;
  title: string;
  bullets: string[];
}

interface PPTData {
  slides: Slide[];
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = pptData.slides || [];
  const currentSlide = slides[currentSlideIndex];

  React.useEffect(() => {
    console.log("PPTPreviewModal opened with slides:", slides);
    console.log("Total slides count:", slides.length);
    console.log("pptData structure:", JSON.stringify(pptData, null, 2));
  }, [slides, pptData]);

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

  const getTitleColor = (type: string) => {
    return type === "content" ? "text-slate-900" : "text-white";
  };

  const getBulletColor = (type: string) => {
    return type === "content" ? "text-slate-700" : "text-slate-100";
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
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-900">
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

        {/* Main Content - Slide Display */}
        <div className="flex-1 flex items-center justify-center bg-black p-8">
          <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl">
            <div
              className={`h-full w-full ${getSlideBackgroundColor(currentSlide.type)} flex flex-col justify-center p-12`}
            >
              {/* Slide Title */}
              <h2 className={`text-5xl font-bold mb-8 ${getTitleColor(currentSlide.type)}`}>
                {currentSlide.title}
              </h2>

              {/* Slide Bullets */}
              {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                <ul className="space-y-4">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className={`text-2xl flex items-start ${getBulletColor(currentSlide.type)}`}
                    >
                      <span className="mr-4">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Slide Notes (if available) */}
              {currentSlide.notes && (
                <div className={`mt-8 pt-8 border-t ${currentSlide.type === "content" ? "border-slate-300" : "border-slate-400"}`}>
                  <p className={`text-sm italic ${getBulletColor(currentSlide.type)}`}>
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
    </div>
  );
};
