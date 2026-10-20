import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchOrganizationMedia, OrganizationMediaItem, OrganizationMediaList } from "@/services/organizationMediaService";

interface OrganizationMediaTabProps {
  proposalId: string;
  allowMutations: boolean;
  onInsertImage: (image: { url: string; source: { provider: "crm" | "crm_logo"; fileId?: number; organizationId?: number } }) => void;
}

export const OrganizationMediaTab: React.FC<OrganizationMediaTabProps> = ({
  proposalId,
  allowMutations,
  onInsertImage,
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<OrganizationMediaList | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      const result = await fetchOrganizationMedia(proposalId, { q: query.trim(), page });
      if (!result.success || !result.data) {
        setLibrary(null);
        setError(result.error || "Organization media could not be loaded");
      } else {
        setLibrary(result.data);
      }
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [proposalId, query, page, reloadKey]);

  const insertFile = (item: OrganizationMediaItem) => {
    if (!allowMutations || !item.previewUrl) return;
    onInsertImage({
      url: "",
      source: {
        provider: "crm",
        fileId: item.id,
        organizationId: library?.organizationId,
      },
    });
  };

  const insertLogo = () => {
    if (!allowMutations || !library?.logo?.previewUrl) return;
    onInsertImage({
      url: "",
      source: {
        provider: "crm_logo",
        organizationId: library.logo.organizationId,
      },
    });
  };

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => {
          setPage(1);
          setQuery(event.target.value);
        }}
        placeholder="Search organization media"
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      {loading && (
        <div className="flex items-center justify-center py-8 text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading organization media...
        </div>
      )}
      {!loading && error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          <p>{error}</p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => setReloadKey((value) => value + 1)}>
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && library && (
        <>
          {library.logo?.previewUrl && (
            <div className="rounded border p-3">
              <img src={library.logo.previewUrl} alt={library.logo.name} className="mb-2 h-16 w-16 rounded object-contain" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{library.logo.name}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => window.open(library.logo?.previewUrl || "", "_blank", "noopener,noreferrer")}>Preview</Button>
                  <Button type="button" disabled={!allowMutations} onClick={insertLogo}>Insert</Button>
                </div>
              </div>
            </div>
          )}
          {library.data.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No organization media found</p>}
          <div className="grid grid-cols-2 gap-3">
            {library.data.map((item) => (
              <div key={item.id} className="overflow-hidden rounded border bg-slate-50">
                {item.category === "image" && item.previewUrl ? (
                  <img src={item.thumbnailUrl || item.previewUrl} alt={item.name} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs uppercase text-slate-500">{item.mimeType.split("/").pop()}</div>
                )}
                <p className="truncate px-2 py-1 text-xs text-slate-600">{item.name}</p>
                <div className="flex gap-1 px-2 pb-2">
                  <Button type="button" variant="outline" className="h-7 px-2 text-xs" disabled={!item.previewUrl} onClick={() => item.previewUrl && window.open(item.previewUrl, "_blank", "noopener,noreferrer")}>
                    {item.category === "image" ? "Preview" : "Open"}
                  </Button>
                  {item.category === "image" && (
                    <Button type="button" className="h-7 px-2 text-xs" disabled={!allowMutations || !item.previewUrl} onClick={() => insertFile(item)}>
                      Insert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
            <span>Page {library.page}</span>
            <Button type="button" variant="outline" disabled={library.page * library.perPage >= library.total} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
};
