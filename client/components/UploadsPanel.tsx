import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Copy } from "lucide-react";
import { uploadMediaToProposal, uploadMediaToLibrary, fetchProposalMedia, fetchLibraryMedia, deleteProposalMedia, deleteLibraryMedia } from "@/services/mediaService";
import { toast } from "@/hooks/use-toast";

interface UploadedMedia {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface UploadsPanelProps {
  proposalId: string;
  documentMedia?: UploadedMedia[];
  libraryMedia?: UploadedMedia[];
  onMediaUploaded?: (media: UploadedMedia, destination: "document" | "library") => void;
  onMediaRemoved?: (mediaId: string, destination: "document" | "library") => void;
}

export const UploadsPanel: React.FC<UploadsPanelProps> = ({
  proposalId,
  documentMedia = [],
  libraryMedia = [],
  onMediaUploaded,
  onMediaRemoved,
}) => {
  const [activeTab, setActiveTab] = useState<"document" | "library">("document");
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());
  const [uploadingLibrary, setUploadingLibrary] = useState<Set<string>>(new Set());
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaLoadError, setMediaLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposalMedia = async () => {
      setLoadingMedia(true);
      setMediaLoadError(null);
      try {
        console.log("Loading media for proposal:", proposalId);
        const result = await fetchProposalMedia(proposalId);

        if (result.success && result.data) {
          console.log("Media loaded successfully:", result.data);
          const flattenedMedia = result.data.media.flatMap((record) =>
            record.media.map((media) => ({
              id: String(media.id),
              url: media.url,
              type: media.type as "image" | "video",
              name: media.path.split("/").pop() || media.path,
            }))
          );

          if (flattenedMedia.length > 0 && onMediaUploaded) {
            console.log("Adding media to document:", flattenedMedia);
            flattenedMedia.forEach((media) => {
              onMediaUploaded(media, "document");
            });
          } else {
            console.log("No media found for proposal");
          }
        } else if (!result.success) {
          console.warn("Failed to load proposal media:", result.error);
          // Only show error if it's not a 500 - servers sometimes have issues
          if (result.error?.includes("500")) {
            console.warn("API server error - media may not be available yet");
            // Don't show error to user for server errors, just log it
          } else {
            setMediaLoadError(result.error || "Failed to load media");
          }
        }
      } catch (err) {
        console.error("Failed to load proposal media:", err);
        setMediaLoadError("Error loading media");
      } finally {
        setLoadingMedia(false);
      }
    };

    loadProposalMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  useEffect(() => {
    const loadLibraryMedia = async () => {
      try {
        console.log("Loading library media");
        const result = await fetchLibraryMedia();

        if (result.success && result.data) {
          console.log("Library media loaded successfully:", result.data);

          const libraryMediaList = (result.data.media || []).flatMap((record) =>
            (record.media || []).map((media) => ({
              id: String(media.id),
              url: media.url,
              type: (media.type as "image" | "video") || "image",
              name: media.path ? media.path.split("/").pop() || media.path : media.url?.split("/").pop() || "Media",
            }))
          );

          if (libraryMediaList.length > 0 && onMediaUploaded) {
            console.log("Adding media to library:", libraryMediaList);
            libraryMediaList.forEach((media) => {
              onMediaUploaded(media, "library");
            });
          } else {
            console.log("No media found in library");
          }
        } else if (!result.success) {
          console.warn("Failed to load library media:", result.error);
          // If it's a 500 error, the API might not be ready yet
          if (result.error?.includes("500")) {
            console.info("Library API returned 500 - may not be available yet");
          }
        }
      } catch (err) {
        console.error("Failed to load library media - exception:", err);
      }
    };

    loadLibraryMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = async (file: File, destination: "document" | "library") => {
    const fileId = `${Date.now()}-${file.name}`;
    const setUploading = destination === "document" ? setUploadingDocuments : setUploadingLibrary;

    setUploading((prev) => new Set([...prev, fileId]));

    try {
      const result = destination === "document"
        ? await uploadMediaToProposal(file, proposalId)
        : await uploadMediaToLibrary(file);

      if (!result.success || !result.data) {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload media",
          variant: "destructive",
        });
        setUploading((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
        return;
      }

      const newMedia: UploadedMedia = {
        id: String(result.data.media_record.id),
        url: result.data.media_record.url,
        type: result.data.media_record.type as "image" | "video",
        name: file.name,
      };

      onMediaUploaded?.(newMedia, destination);

      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded successfully`,
      });

      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const handleDeleteMedia = async (mediaId: string, destination: "document" | "library") => {
    const result = await deleteProposalMedia(mediaId);

    if (!result.success) {
      toast({
        title: "Delete Failed",
        description: result.error || "Failed to delete media",
        variant: "destructive",
      });
      return;
    }

    onMediaRemoved?.(mediaId, destination);
    toast({
      title: "Media Removed",
      description: result.message || "Media has been removed from your uploads",
    });
  };

  const handleCopyUrl = (imageUrl: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(imageUrl).then(() => {
        toast({
          title: "Copied",
          description: "Image URL copied to clipboard",
        });
      }).catch(() => {
        fallbackCopyToClipboard(imageUrl);
      });
    } else {
      fallbackCopyToClipboard(imageUrl);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      toast({
        title: "Copied",
        description: "Image URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const isUploadingDocument = uploadingDocuments.size > 0;
  const isUploadingLibrary = uploadingLibrary.size > 0;

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
            <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
              {isUploadingDocument || loadingMedia ? (
                <>
                  <Loader2 className="w-8 h-8 text-slate-400 mb-2 animate-spin" />
                  <p className="text-sm text-slate-500 text-center">
                    {isUploadingDocument ? "Uploading..." : "Loading media..."}
                  </p>
                </>
              ) : (
                <>
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 text-center">
                    Click to upload or drag and drop
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file, "document");
                  }
                }}
                disabled={isUploadingDocument || loadingMedia}
                className="hidden"
              />
            </label>

            {!loadingMedia && mediaLoadError && !mediaLoadError.includes("500") && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">Error loading media</p>
                <p>{mediaLoadError}</p>
              </div>
            )}

            {!loadingMedia && documentMedia.length === 0 && !mediaLoadError && (
              <p className="text-sm text-slate-500 text-center py-4">
                No media uploaded yet
              </p>
            )}

            {documentMedia.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {documentMedia.map((media) => (
                    <div
                      key={media.id}
                      className="border rounded-lg overflow-hidden bg-slate-100 group relative"
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
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {media.type === "image" && (
                          <button
                            onClick={() => handleCopyUrl(media.url)}
                            className="bg-slate-600 hover:bg-slate-700 text-white rounded p-1"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(media.id, "document")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 px-2 py-1 truncate">
                        {media.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
              {isUploadingLibrary ? (
                <>
                  <Loader2 className="w-8 h-8 text-slate-400 mb-2 animate-spin" />
                  <p className="text-sm text-slate-500 text-center">Uploading...</p>
                </>
              ) : (
                <>
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 text-center">
                    Click to upload or drag and drop
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file, "library");
                  }
                }}
                disabled={isUploadingLibrary}
                className="hidden"
              />
            </label>

            {libraryMedia.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No media in your library yet
              </p>
            )}

            {libraryMedia.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {libraryMedia.map((media) => (
                    <div
                      key={media.id}
                      className="border rounded-lg overflow-hidden bg-slate-100 group relative"
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
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {media.type === "image" && (
                          <button
                            onClick={() => handleCopyUrl(media.url)}
                            className="bg-slate-600 hover:bg-slate-700 text-white rounded p-1"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(media.id, "library")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 px-2 py-1 truncate">
                        {media.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
