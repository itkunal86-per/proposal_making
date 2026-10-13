import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchOrganizationMedia, OrganizationMediaItem, OrganizationMediaList } from "@/services/organizationMediaService";

interface OrganizationMediaTabProps {
  proposalId: string;
  allowMutations: boolean;
  onInsertImage: (image: { url: string; source: { provider: "crm"; fileId: number; dealId: number; organizationId?: number } }) => void;
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

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      const result = await fetchOrganizationMedia(proposalId, { q: query.trim(), page, type: "image" });
      if (!result.success || !result.data) {
        setLibrary(null);
        setError(result.error || "Deal media could not be loaded");
      } else {
        setLibrary(result.data);
      }
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [proposalId, query, page]);

  const insertFile = (item: OrganizationMediaItem) => {
    if (!allowMutations || item.category !== "image") return;
    onInsertImage({
      url: "",
      source: {
        provider: "crm",
        fileId: item.id,
        dealId: item.dealId,
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
        placeholder="Search deal media"
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      {loading && (
        <div className="flex items-center justify-center py-8 text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading deal media...
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && library && library.total === 0 && (
        <p className="py-4 text-center text-sm text-slate-500">No deal media found</p>
      )}
      {!loading && !error && library && library.groups.map((group) => (
        <div key={group.dealId} className="rounded border border-slate-200 p-2">
          <p className="text-xs font-medium text-slate-600">Deal {group.dealId}</p>
          {group.total === 0 && <p className="py-2 text-xs text-slate-500">No matching files</p>}
          {group.total > 0 && group.data.length === 0 && <p className="py-2 text-xs text-slate-500">Files are on another page</p>}
          <div className="space-y-2">
            {group.data.map((item) => (
              <button
                key={`${item.dealId}:${item.id}`}
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-slate-50"
                disabled={!allowMutations}
                onClick={() => insertFile(item)}
              >
                {item.thumbnailUrl || item.previewUrl ? (
                  <img src={item.thumbnailUrl || item.previewUrl || ""} alt="" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <span className="h-10 w-10 rounded bg-slate-100" />
                )}
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {library && library.total > library.perPage && (
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span>Page {library.page}</span>
          <Button type="button" variant="outline" disabled={page * library.perPage >= library.total} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};
