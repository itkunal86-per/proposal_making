export interface OrganizationImageSource {
  provider: "crm" | "crm_logo" | "proposal_snapshot";
  fileId?: number;
  dealId?: number;
  organizationId?: number;
  snapshotId?: number;
  restore?: "required";
}

export interface OrganizationImage {
  url?: string;
  source?: OrganizationImageSource;
}

export function organizationMediaInsertEnabled(): boolean {
  return import.meta.env.VITE_ORGANIZATION_MEDIA_INSERT_ENABLED === "true";
}

export function organizationMediaResolveEnabled(): boolean {
  return import.meta.env.VITE_ORGANIZATION_MEDIA_RESOLVE_ENABLED === "true";
}

export function readOrganizationSource(source: unknown): OrganizationImageSource | undefined {
  if (!source || typeof source !== "object") return undefined;
  const provider = (source as { provider?: unknown }).provider;
  if (provider !== "crm" && provider !== "crm_logo" && provider !== "proposal_snapshot") return undefined;
  return source as OrganizationImageSource;
}

export function sourceKey(image: OrganizationImage | null | undefined): string | null {
  const source = image?.source;
  if (!source || source.restore === "required") return null;
  if (source.provider === "crm" && source.fileId && source.dealId) return `${source.dealId}:${source.fileId}`;
  if (source.provider === "proposal_snapshot" && source.snapshotId) return `snapshot:${source.snapshotId}`;
  return null;
}

export function collectOrganizationMedia(sections: Array<{ images?: OrganizationImage[] }> | undefined) {
  const references: Array<{ fileId: number; dealId: number }> = [];
  const snapshots: Array<{ key: string; url: string }> = [];

  for (const section of sections ?? []) {
    for (const image of section.images ?? []) {
      const source = image.source;
      if (!source || source.restore === "required") continue;
      const key = sourceKey(image);
      if (source.provider === "crm" && source.fileId && source.dealId && key && !references.some((item) => `${item.dealId}:${item.fileId}` === key)) {
        references.push({ fileId: source.fileId, dealId: source.dealId });
      }
      if (source.provider === "proposal_snapshot" && key) {
        snapshots.push({ key, url: image.url || "" });
      }
    }
  }

  return { references, snapshots };
}

export function sectionsForSave<T extends { images?: OrganizationImage[] }>(sections: T[]): T[] {
  return sections.map((section) => ({
    ...section,
    images: (section.images ?? []).map((image) => {
      if (image.source?.provider === "crm" || image.source?.provider === "crm_logo") {
        return { ...image, url: "" };
      }
      return image;
    }),
  }));
}

export function exportUrls(
  sections: Array<{ images?: OrganizationImage[] }> | undefined,
  resolved: { results?: Array<{ fileId: number; dealId: number; previewUrl?: string; status?: string }> },
): { urls: Record<string, string>; missing: boolean } {
  const urls: Record<string, string> = {};
  let missing = false;
  const byPair = new Map((resolved.results ?? []).map((file) => [`${file.dealId}:${file.fileId}`, file]));

  for (const section of sections ?? []) {
    for (const image of section.images ?? []) {
      const key = sourceKey(image);
      if (!key || !image.source || image.source.restore === "required") continue;
      if (image.source.provider === "proposal_snapshot") {
        if (!image.url) missing = true;
        else urls[key] = image.url;
        continue;
      }
      if (image.source.provider === "crm" && image.source.fileId && image.source.dealId) {
        const file = byPair.get(key);
        if (!file?.previewUrl || file.status === "missing") missing = true;
        else urls[key] = file.previewUrl;
      }
    }
  }

  return { urls, missing };
}

export function shouldAbortPdfExport(prepared: { usesOrganizationMedia: boolean; missing: boolean }): boolean {
  return prepared.usesOrganizationMedia && prepared.missing;
}

export function shouldRefreshSignedUrl(expiresAt: string | number | undefined, now: number): boolean {
  if (!expiresAt) return true;
  const expiry = typeof expiresAt === "number" ? expiresAt : Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return true;
  return expiry - now <= 15 * 60 * 1000;
}
