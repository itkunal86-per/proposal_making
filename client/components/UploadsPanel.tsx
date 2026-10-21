import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Copy } from "lucide-react";
import { uploadMediaToProposal, uploadMediaToLibrary, fetchProposalMedia, fetchLibraryMedia, deleteProposalMedia, deleteLibraryMedia } from "@/services/mediaService";
import { fetchDealMedia, DealMediaItem } from "@/services/dealMediaService";
import { toast } from "@/hooks/use-toast";
import { OrganizationMediaTab } from "@/components/OrganizationMediaTab";
import { organizationMediaInsertEnabled } from "@/lib/organizationMedia";

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
  allowMutations?: boolean;
  onInsertOrganizationImage?: (image: { url: string; source: { provider: "crm" | "crm_logo"; fileId?: number; organizationId?: number } }) => void;
  onMediaUploaded?: (media: UploadedMedia, destination: "document" | "library") => void;
  onMediaRemoved?: (mediaId: string, destination: "document" | "library") => void;
}

export const UploadsPanel: React.FC<UploadsPanelProps> = ({
  proposalId,
  documentMedia = [],
  libraryMedia = [],
  allowMutations = true,
  onInsertOrganizationImage,
  onMediaUploaded,
  onMediaRemoved,
}) => {
  const [activeTab, setActiveTab] = useState<"document" | "library" | "organization">("document");
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());
  const [uploadingLibrary, setUploadingLibrary] = useState<Set<string>>(new Set());
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaLoadError, setMediaLoadError] = useState<string | null>(null);
  const [dealMedia, setDealMedia] = useState<DealMediaItem[]>([]);
  const [dealOrganizationId, setDealOrganizationId] = useState<number | null>(null);
  const [dealMediaLoading, setDealMediaLoading] = useState(false);
  const [dealMediaError, setDealMediaError] = useState<string | null>(null);
  const [brokenDealIds, setBrokenDealIds] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    if (activeTab !== "library") {
      return;
    }

    let cancelled = false;
    setDealMedia([]);
    setDealOrganizationId(null);
    setDealMediaError(null);
    setBrokenDealIds(new Set());
    setDealMediaLoading(true);

    const loadDealMedia = async () => {
      try {
        const result = await fetchDealMedia(proposalId);
        if (cancelled) return;
        if (!result.success || !result.data) {
          console.warn("Failed to load deal attachments:", result.error);
          setDealMedia([]);
          setDealOrganizationId(null);
          setDealMediaError("Deal attachments could not be loaded.");
          return;
        }
        setDealMedia(result.data.data);
        setDealOrganizationId(result.data.organizationId);
      } catch (err) {
        console.error("Failed to load deal attachments:", err);
        if (!cancelled) {
          setDealMedia([]);
          setDealOrganizationId(null);
          setDealMediaError("Deal attachments could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setDealMediaLoading(false);
        }
      }
    };

    loadDealMedia();
    return () => {
      cancelled = true;
    };
  }, [activeTab, proposalId]);

  const handleFileSelect = async (file: File, destination: "document" | "library") => {
    if (!allowMutations) return;
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
    if (!allowMutations) return;
    const result = destination === "document"
      ? await deleteProposalMedia(mediaId)
      : await deleteLibraryMedia(mediaId);

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

      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("document")}
          className={`editor-tab ${activeTab === "document" ? "editor-tab-active" : ""}`}
        >
          This document
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`editor-tab ${activeTab === "library" ? "editor-tab-active" : ""}`}
        >
          Your library
        </button>
        {organizationMediaInsertEnabled() && (
          <button
            onClick={() => setActiveTab("organization")}
            className={`editor-tab ${activeTab === "organization" ? "editor-tab-active" : ""}`}
          >
            Organization
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activeTab === "document" ? (
          <>
            <label className={`border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors bg-slate-50 ${allowMutations ? "cursor-pointer hover:border-slate-400" : "pointer-events-none opacity-60"}`}>
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
                disabled={isUploadingDocument || loadingMedia || !allowMutations}
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
                            disabled={!allowMutations}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(media.id, "document")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
                          title="Delete media"
                          disabled={!allowMutations}
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
        ) : activeTab === "library" ? (
          <>
            <label className={`border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors bg-slate-50 ${allowMutations ? "cursor-pointer hover:border-slate-400" : "pointer-events-none opacity-60"}`}>
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
                disabled={isUploadingLibrary || !allowMutations}
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
                            disabled={!allowMutations}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(media.id, "library")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
                          title="Delete media"
                          disabled={!allowMutations}
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

            {(dealMediaLoading || dealMediaError || dealMedia.length > 0) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">Deal attachments</h3>
                {dealMediaLoading && (
                  <div className="flex items-center justify-center py-4 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading deal attachments...
                  </div>
                )}
                {!dealMediaLoading && dealMediaError && (
                  <p className="text-sm text-slate-500 text-center py-2">{dealMediaError}</p>
                )}
                {!dealMediaLoading && dealMedia.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {dealMedia.map((item) => {
                      const previewUrl = item.thumbnailUrl || item.url;
                      const showImage = item.type === "image" && previewUrl && !brokenDealIds.has(item.id);
                      return (
                        <div
                          key={`deal-${item.id}`}
                          className="border rounded-lg overflow-hidden bg-slate-100 group relative"
                        >
                          {showImage ? (
                            <img
                              src={previewUrl}
                              alt={item.name}
                              className="w-full h-24 object-cover"
                              onError={() => {
                                setBrokenDealIds((prev) => new Set(prev).add(item.id));
                              }}
                            />
                          ) : item.type === "video" && item.url ? (
                            <video
                              src={item.url}
                              className="w-full h-24 object-cover bg-black"
                            />
                          ) : item.type === "audio" && item.url ? (
                            <div className="flex h-24 items-center bg-slate-200 px-2">
                              <audio src={item.url} controls className="w-full" />
                            </div>
                          ) : (
                            <div className="flex h-24 items-center justify-center bg-slate-200 px-2 text-xs uppercase text-slate-500">
                              {item.mimeType?.split("/").pop() || item.type}
                            </div>
                          )}
                          {item.type === "image" && item.url && (
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => item.url && handleCopyUrl(item.url)}
                                className="bg-slate-600 hover:bg-slate-700 text-white rounded p-1"
                                title="Copy URL"
                                disabled={!allowMutations}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-slate-600 px-2 py-1 truncate">{item.name}</p>
                          {item.type === "image" && organizationMediaInsertEnabled() && (
                            <div className="px-2 pb-2">
                              <Button
                                type="button"
                                className="h-7 px-2 text-xs"
                                disabled={!allowMutations || dealOrganizationId == null || !item.url}
                                onClick={() => onInsertOrganizationImage?.({
                                  url: "",
                                  source: {
                                    provider: "crm",
                                    fileId: item.id,
                                    organizationId: dealOrganizationId ?? undefined,
                                  },
                                })}
                              >
                                Insert
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <OrganizationMediaTab
            proposalId={proposalId}
            allowMutations={allowMutations}
            onInsertImage={(image) => onInsertOrganizationImage?.(image)}
          />
        )}
      </div>
    </Card>
  );
};
