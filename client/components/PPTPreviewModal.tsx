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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = pptData.slides || [];
  const currentSlide = slides[currentSlideIndex];

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

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

  if (!currentSlide) {
    return null;
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
