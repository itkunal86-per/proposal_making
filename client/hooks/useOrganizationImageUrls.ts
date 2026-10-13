import { useCallback, useEffect, useRef, useState } from "react";
import { collectOrganizationMedia, exportUrls, organizationMediaResolveEnabled, shouldRefreshSignedUrl, sourceKey } from "@/lib/organizationMedia";
import { resolveOrganizationMedia } from "@/services/organizationMediaService";

interface SignedEntry {
  url: string;
  expiresAt: string;
}

export function useOrganizationImageUrls(proposalId: string | undefined, sections: Array<{ images?: Array<{ url?: string; source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; dealId?: number; organizationId?: number; snapshotId?: number; restore?: "required" } }> }> | undefined) {
  const [entries, setEntries] = useState<Record<string, SignedEntry>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const retried = useRef<Record<string, boolean>>({});
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;
  const request = collectOrganizationMedia(sections);
  const fingerprint = `${proposalId}:${request.references.map((item) => `${item.dealId}:${item.fileId}`).join(",")}`;

  const refresh = useCallback(async () => {
    const current = collectOrganizationMedia(sectionsRef.current);
    if (!organizationMediaResolveEnabled() || !proposalId) return false;
    if (current.references.length === 0) return true;
    const result = await resolveOrganizationMedia(proposalId, current.references);
    if (!result.success || !result.data) return false;
    const next: Record<string, SignedEntry> = {};
    const nextFailed: Record<string, boolean> = {};
    for (const file of result.data.results ?? []) {
      const key = `${file.dealId}:${file.fileId}`;
      if (file.previewUrl && file.status !== "missing") {
        next[key] = { url: file.previewUrl, expiresAt: file.expiresAt || "" };
      } else {
        nextFailed[key] = true;
      }
    }
    setEntries((existing) => ({ ...existing, ...next }));
    setFailed((existing) => ({ ...existing, ...nextFailed }));
    return Object.keys(nextFailed).length === 0;
  }, [proposalId, fingerprint]);

  useEffect(() => {
    if (!organizationMediaResolveEnabled()) return;
    void refresh();
    const timer = window.setInterval(() => {
      setEntries((current) => {
        const due = Object.values(current).some((entry) => shouldRefreshSignedUrl(entry.expiresAt, Date.now()));
        if (due) void refresh();
        return current;
      });
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const displayUrl = useCallback((image: { url?: string; source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; dealId?: number; snapshotId?: number; restore?: "required" } }) => {
    const key = sourceKey(image);
    if (!key || image.source?.provider === "proposal_snapshot" || image.source?.restore === "required") return image.source?.restore === "required" ? "" : (image.url || "");
    if (!organizationMediaResolveEnabled() || failed[key]) return "";
    return entries[key]?.url || "";
  }, [entries, failed]);

  const onImageError = useCallback((image: { source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; dealId?: number; snapshotId?: number; restore?: "required" } }) => {
    const key = sourceKey(image);
    if (!key || image.source?.restore === "required") return;
    if (image.source?.provider !== "proposal_snapshot" && !retried.current[key]) {
      retried.current[key] = true;
      void refresh();
      return;
    }
    setFailed((current) => ({ ...current, [key]: true }));
  }, [refresh]);

  const urlsForPdf = useCallback(async () => {
    const collected = collectOrganizationMedia(sectionsRef.current);
    const usesOrganizationMedia = collected.references.length > 0 || collected.snapshots.length > 0;
    if (!usesOrganizationMedia) return { urls: {}, missing: false, usesOrganizationMedia: false };
    if (collected.references.length > 0) {
      if (!organizationMediaResolveEnabled() || !proposalId) return { urls: {}, missing: true, usesOrganizationMedia: true };
      const result = await resolveOrganizationMedia(proposalId, collected.references);
      if (!result.success || !result.data) return { urls: {}, missing: true, usesOrganizationMedia: true };
      return { ...exportUrls(sectionsRef.current, result.data), usesOrganizationMedia: true };
    }
    return { ...exportUrls(sectionsRef.current, { results: [] }), usesOrganizationMedia: true };
  }, [proposalId]);

  return { displayUrl, onImageError, failed, urlsForPdf };
}
