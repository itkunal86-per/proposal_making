import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UploadedMedia {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface UploadsPanelProps {
  documentMedia?: UploadedMedia[];
  libraryMedia?: UploadedMedia[];
  onUpload?: (file: File, destination: "document" | "library") => void;
}

export const UploadsPanel: React.FC<UploadsPanelProps> = ({
  documentMedia = [],
  libraryMedia = [],
  onUpload,
}) => {
  const [activeTab, setActiveTab] = useState<"document" | "library">("document");

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Uploads</h2>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("document")}
          className={`pb-2 px-2 text-sm font-medium transition-colors ${
            activeTab === "document"
              ? "text-slate-900 border-b-2 border-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          This document
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-2 px-2 text-sm font-medium transition-colors ${
            activeTab === "library"
              ? "text-slate-900 border-b-2 border-slate-900"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Your library
        </button>
      </div>

      <div className="space-y-3">
        {activeTab === "document" ? (
          <>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
              <Plus className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 text-center">
                Click to upload or drag and drop
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUpload?.(file, "document");
                  }
                }}
                className="hidden"
              />
            </div>

            {documentMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {documentMedia.map((media) => (
                  <div
                    key={media.id}
                    className="border rounded-lg overflow-hidden bg-slate-100"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover bg-black"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
              <Plus className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 text-center">
                Click to upload or drag and drop
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUpload?.(file, "library");
                  }
                }}
                className="hidden"
              />
            </div>

            {libraryMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {libraryMedia.map((media) => (
                  <div
                    key={media.id}
                    className="border rounded-lg overflow-hidden bg-slate-100"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover bg-black"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
