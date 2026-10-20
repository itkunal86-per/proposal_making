export interface OrganizationImageSource {
  provider: "crm" | "crm_logo" | "proposal_snapshot";
  fileId?: number;
  organizationId?: number;
  snapshotId?: number;
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
  if (!source) return null;
  if (source.provider === "crm" && source.fileId) return `crm:${source.fileId}`;
  if (source.provider === "crm_logo") return "crm_logo";
  if (source.provider === "proposal_snapshot" && source.snapshotId) return `snapshot:${source.snapshotId}`;
  return null;
}

export function collectOrganizationMedia(sections: Array<{ images?: OrganizationImage[] }> | undefined) {
  const fileIds: number[] = [];
  let includeLogo = false;
  const snapshots: Array<{ key: string; url: string }> = [];

  for (const section of sections ?? []) {
    for (const image of section.images ?? []) {
      const key = sourceKey(image);
      if (!key || !image.source) continue;
      if (image.source.provider === "crm" && image.source.fileId && !fileIds.includes(image.source.fileId)) {
        fileIds.push(image.source.fileId);
      }
      if (image.source.provider === "crm_logo") includeLogo = true;
      if (image.source.provider === "proposal_snapshot") {
        snapshots.push({ key, url: image.url || "" });
      }
    }
  }

  return { fileIds, includeLogo, snapshots };
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
  resolved: { files?: Array<{ id: number; previewUrl?: string; status?: string }>; logo?: { previewUrl?: string; status?: string } | null },
): { urls: Record<string, string>; missing: boolean } {
  const urls: Record<string, string> = {};
  let missing = false;
  const byId = new Map((resolved.files ?? []).map((file) => [file.id, file]));

  for (const section of sections ?? []) {
    for (const image of section.images ?? []) {
      const key = sourceKey(image);
      if (!key || !image.source) continue;
      if (image.source.provider === "proposal_snapshot") {
        if (!image.url) missing = true;
        else urls[key] = image.url;
        continue;
      }
      if (image.source.provider === "crm" && image.source.fileId) {
        const file = byId.get(image.source.fileId);
        if (!file?.previewUrl || file.status === "missing") missing = true;
        else urls[key] = file.previewUrl;
      }
      if (image.source.provider === "crm_logo") {
        if (!resolved.logo?.previewUrl || resolved.logo.status === "missing") missing = true;
        else urls[key] = resolved.logo.previewUrl;
      }
    }
  }

  return { urls, missing };
}

export function shouldRefreshSignedUrl(expiresAt: string | number | undefined, now: number): boolean {
  if (!expiresAt) return true;
  const expiry = typeof expiresAt === "number" ? expiresAt : Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return true;
  return expiry - now <= 15 * 60 * 1000;
}
