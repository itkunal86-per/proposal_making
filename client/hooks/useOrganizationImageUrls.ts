import { useCallback, useEffect, useRef, useState } from "react";
import { collectOrganizationMedia, exportUrls, organizationMediaResolveEnabled, shouldRefreshSignedUrl, sourceKey } from "@/lib/organizationMedia";
import { resolveOrganizationMedia } from "@/services/organizationMediaService";

interface SignedEntry {
  url: string;
  expiresAt: string;
}

export function useOrganizationImageUrls(proposalId: string | undefined, sections: Array<{ images?: Array<{ url?: string; source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; organizationId?: number; snapshotId?: number } }> }> | undefined) {
  const [entries, setEntries] = useState<Record<string, SignedEntry>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const retried = useRef<Record<string, boolean>>({});
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;
  const request = collectOrganizationMedia(sections);
  const fingerprint = `${proposalId}:${request.fileIds.join(",")}:${request.includeLogo}`;

  const refresh = useCallback(async () => {
    const current = collectOrganizationMedia(sectionsRef.current);
    if (!organizationMediaResolveEnabled() || !proposalId) return false;
    if (current.fileIds.length === 0 && !current.includeLogo) return true;
    const result = await resolveOrganizationMedia(proposalId, current.fileIds, current.includeLogo);
    if (!result.success || !result.data) return false;
    const next: Record<string, SignedEntry> = {};
    const nextFailed: Record<string, boolean> = {};
    for (const file of result.data.files ?? []) {
      if (file.previewUrl && file.status !== "missing") {
        next[`crm:${file.id}`] = { url: file.previewUrl, expiresAt: file.expiresAt || "" };
      } else {
        nextFailed[`crm:${file.id}`] = true;
      }
    }
    if (current.includeLogo) {
      if (result.data.logo?.previewUrl && result.data.logo.status !== "missing") {
        next.crm_logo = { url: result.data.logo.previewUrl, expiresAt: result.data.logo.expiresAt || "" };
      } else {
        nextFailed.crm_logo = true;
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

  const displayUrl = useCallback((image: { url?: string; source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; snapshotId?: number } }) => {
    const key = sourceKey(image);
    if (!key || image.source?.provider === "proposal_snapshot") return image.url || "";
    if (!organizationMediaResolveEnabled() || failed[key]) return "";
    return entries[key]?.url || "";
  }, [entries, failed]);

  const onImageError = useCallback((image: { source?: { provider: "crm" | "crm_logo" | "proposal_snapshot"; fileId?: number; snapshotId?: number } }) => {
    const key = sourceKey(image);
    if (!key) return;
    if (image.source?.provider !== "proposal_snapshot" && !retried.current[key]) {
      retried.current[key] = true;
      void refresh();
      return;
    }
    setFailed((current) => ({ ...current, [key]: true }));
  }, [refresh]);

  const urlsForPdf = useCallback(async () => {
    const collected = collectOrganizationMedia(sectionsRef.current);
    const usesOrganizationMedia = collected.fileIds.length > 0 || collected.includeLogo || collected.snapshots.length > 0;
    if (!usesOrganizationMedia) return { urls: {}, missing: false, usesOrganizationMedia: false };
    let resolved = { files: [] as Array<{ id: number; previewUrl?: string; status?: string }>, logo: null as { previewUrl?: string; status?: string } | null };
    if (collected.fileIds.length > 0 || collected.includeLogo) {
      if (!organizationMediaResolveEnabled() || !proposalId) return { urls: {}, missing: true, usesOrganizationMedia: true };
      const result = await resolveOrganizationMedia(proposalId, collected.fileIds, collected.includeLogo);
      if (!result.success || !result.data) return { urls: {}, missing: true, usesOrganizationMedia: true };
      resolved = {
        files: result.data.files ?? [],
        logo: result.data.logo ?? null,
      };
    }
    return { ...exportUrls(sectionsRef.current, resolved), usesOrganizationMedia: true };
  }, [proposalId]);

  return { displayUrl, onImageError, failed, urlsForPdf };
}
