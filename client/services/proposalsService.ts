import { z } from "zod";
import { getStoredToken, getStoredAuth } from "@/lib/auth";

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  layout?: "single" | "two-column" | "three-column";
  media?: { type: "image" | "video"; url: string }[];
  comments?: { id: string; author: string; text: string; createdAt: number }[];
  titleStyles?: Record<string, any>;
  contentStyles?: Record<string, any>;
}

export interface ProposalPricingItem {
  id: string;
  label: string;
  qty: number;
  price: number;
}

export interface ProposalVersionSnapshot {
  id: string;
  createdAt: number;
  note?: string;
  data: Proposal;
}

export interface Proposal {
  id: string;
  title: string;
  client: string;
  client_id?: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  sections: ProposalSection[];
  pricing: { currency: string; items: ProposalPricingItem[]; taxRate: number };
  settings: {
    dueDate?: string;
    approvalFlow?: string;
    sharing: { public: boolean; token?: string; allowComments: boolean };
  };
  versions: ProposalVersionSnapshot[];
  titleStyles?: Record<string, any>;
}

const STORAGE_KEY = "app_proposals";
const PROPOSALS_ENDPOINT = "https://propai-api.hirenq.com/api/proposals";
const PROPOSALS_DETAILS_ENDPOINT = "https://propai-api.hirenq.com/api/proposals/details";

interface ApiProposalResponse {
  id: string;
  title: string;
  client_id?: string;
  status: ProposalStatus;
  created_at: string;
  created_by?: string;
  due_date?: string;
  approval_flow?: string;
  sharing_public?: number;
  sharing_token?: string;
  sharing_allow_comments?: number;
  currency?: string;
  tax_rate?: number;
  updated_at?: string;
  client?: {
    id: string;
    name: string;
  };
}

export interface CreateProposalInput {
  title: string;
  client_id: string;
  status?: ProposalStatus;
  due_date?: string;
  approval_flow?: string;
  sharing_public?: boolean;
  sharing_token?: string;
  sharing_allow_comments?: boolean;
}

export interface CreateProposalResult {
  success: boolean;
  data?: Proposal;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const idSchema = z.union([z.string(), z.number()]);
const sectionSchema = z.object({
  id: idSchema,
  title: z.string(),
  content: z.string(),
  layout: z.union([z.literal("single"), z.literal("two-column"), z.literal("three-column")]).optional(),
  media: z.array(z.object({ type: z.union([z.literal("image"), z.literal("video")]), url: z.string() })).optional(),
  comments: z.array(z.object({ id: z.union([z.string(), z.number()]), author: z.string(), text: z.string(), createdAt: z.number() })).optional(),
  titleStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
  contentStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
});
const pricingItemSchema = z.object({ id: idSchema, label: z.string(), qty: z.number(), price: z.number() });
const proposalSchema = z.object({
  id: idSchema,
  title: z.string(),
  client: z.string().optional(),
  client_id: z.union([z.string(), z.number()]).optional(),
  status: z.union([z.literal("draft"), z.literal("sent"), z.literal("accepted"), z.literal("declined")]),
  createdBy: z.union([z.string(), z.number()]).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  sections: z.array(sectionSchema),
  pricing: z.object({ currency: z.string(), items: z.array(pricingItemSchema), taxRate: z.number() }),
  settings: z.object({
    dueDate: z.string().optional(),
    approvalFlow: z.string().optional(),
    sharing: z.object({ public: z.boolean(), token: z.string().optional(), allowComments: z.boolean() }),
  }),
  versions: z.array(z.object({ id: idSchema, createdAt: z.number(), note: z.string().optional(), data: z.any() })).optional(),
  titleStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
});
const proposalListSchema = z.array(proposalSchema);

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeStyles(styles: any): Record<string, any> | undefined {
  if (!styles || Array.isArray(styles)) return undefined;
  if (typeof styles === "object") return styles;
  return undefined;
}

function normalizeProposal(raw: z.infer<typeof proposalSchema>): Proposal {
  return {
    id: String(raw.id!),
    title: raw.title!,
    client: raw.client || "",
    client_id: raw.client_id ? String(raw.client_id) : undefined,
    status: raw.status!,
    createdBy: String(raw.createdBy || "system"),
    createdAt: raw.createdAt!,
    updatedAt: raw.updatedAt!,
    sections: (raw.sections ?? []).map((s) => ({
      id: String(s.id!),
      title: s.title!,
      content: s.content!,
      layout: s.layout || "single",
      media: (s.media ?? []).map((m) => ({
        type: m.type!,
        url: m.url!,
      })),
      comments: (s.comments ?? []).map((c) => ({
        id: String(c.id!),
        author: c.author!,
        text: c.text!,
        createdAt: c.createdAt!,
      })),
      titleStyles: normalizeStyles(s.titleStyles),
      contentStyles: normalizeStyles(s.contentStyles),
    })),
    pricing: {
      currency: raw.pricing?.currency ?? "USD",
      items: (raw.pricing?.items ?? []).map((i) => ({
        id: String(i.id!),
        label: i.label!,
        qty: i.qty!,
        price: i.price!,
      })),
      taxRate: raw.pricing?.taxRate ?? 0,
    },
    settings: {
      dueDate: raw.settings?.dueDate,
      approvalFlow: raw.settings?.approvalFlow,
      sharing: {
        public: raw.settings?.sharing?.public ?? false,
        token: raw.settings?.sharing?.token,
        allowComments: raw.settings?.sharing?.allowComments ?? false,
      },
    },
    versions: (raw.versions ?? []).map((v) => ({
      id: String(v.id!),
      createdAt: v.createdAt!,
      note: v.note,
      data: v.data!,
    })),
    titleStyles: normalizeStyles(raw.titleStyles),
  };
}

function readStored(): Proposal[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return proposalListSchema.parse(parsed).map(normalizeProposal);
  } catch {
    return null;
  }
}

function persist(list: Proposal[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function convertApiProposalToProposal(apiProposal: ApiProposalResponse, userEmail?: string): Proposal {
  const createdAtMs = new Date(apiProposal.created_at).getTime() || Date.now();
  const updatedAtMs = apiProposal.updated_at ? new Date(apiProposal.updated_at).getTime() : createdAtMs;
  return {
    id: apiProposal.id,
    title: apiProposal.title,
    client: apiProposal.client?.name || "",
    client_id: apiProposal.client_id,
    status: apiProposal.status,
    createdBy: apiProposal.created_by || userEmail || "you@example.com",
    createdAt: createdAtMs,
    updatedAt: updatedAtMs,
    sections: [
      { id: uuid(), title: "Overview", content: "", layout: "single", media: [], comments: [] },
      { id: uuid(), title: "Scope", content: "", layout: "single", media: [], comments: [] },
      { id: uuid(), title: "Timeline", content: "", layout: "single", media: [], comments: [] },
    ],
    pricing: {
      currency: apiProposal.currency || "USD",
      taxRate: apiProposal.tax_rate ?? 0.1,
      items: [
        { id: uuid(), label: "Design", qty: 1, price: 3000 },
        { id: uuid(), label: "Development", qty: 1, price: 9000 },
      ],
    },
    settings: {
      dueDate: apiProposal.due_date || undefined,
      approvalFlow: apiProposal.approval_flow || "Single approver",
      sharing: {
        public: (apiProposal.sharing_public ?? 0) === 1,
        token: apiProposal.sharing_token || undefined,
        allowComments: (apiProposal.sharing_allow_comments ?? 0) === 1,
      },
    },
    versions: [],
  };
}

async function fetchFromApi(): Promise<Proposal[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(PROPOSALS_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch proposals: ${res.statusText}`);
  }

  const json: ApiProposalResponse[] = await res.json();
  const auth = getStoredAuth();
  const userEmail = auth?.user?.email;

  const list = json.map((p) => convertApiProposalToProposal(p, userEmail));
  persist(list);
  return list;
}

async function fetchSeed(): Promise<Proposal[]> {
  try {
    return await fetchFromApi();
  } catch {
    const res = await fetch("/data/proposals.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load proposals");
    const json = await res.json();
    const list = proposalListSchema.parse(json).map(normalizeProposal);
    persist(list);
    return list;
  }
}

async function getAll(): Promise<Proposal[]> {
  try {
    return await fetchFromApi();
  } catch {
    return readStored() ?? (await fetchSeed());
  }
}

export async function listProposals(): Promise<Proposal[]> {
  const list = await getAll();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProposal(id: string): Promise<Proposal | undefined> {
  const list = await getAll();
  const found = list.find((p) => p.id === id);
  return found;
}

export async function getProposalDetails(id: string): Promise<Proposal | undefined> {
  const token = getStoredToken();
  if (!token) {
    console.warn("No authentication token available, falling back to local storage");
    return getProposal(id);
  }

  try {
    const res = await fetch(`${PROPOSALS_DETAILS_ENDPOINT}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch proposal details: ${res.statusText}, falling back to local storage`);
      return getProposal(id);
    }

    const json = await res.json();
    const validated = proposalSchema.safeParse(json);

    if (!validated.success) {
      console.warn("Invalid proposal details format:", validated.error);
      console.warn("Falling back to local storage");
      return getProposal(id);
    }

    const normalized = normalizeProposal(validated.data);
    const list = await getAll();
    const idx = list.findIndex((x) => x.id === normalized.id);
    if (idx === -1) {
      persist([normalized, ...list]);
    } else {
      list[idx] = normalized;
      persist(list);
    }
    return normalized;
  } catch (err) {
    console.warn("Error fetching proposal details, falling back to local storage:", err);
    return getProposal(id);
  }
}

export async function getProposalByToken(token: string): Promise<Proposal | undefined> {
  const list = await getAll();
  return list.find((p) => p.settings.sharing.token === token);
}

export async function createProposalApi(input: CreateProposalInput): Promise<CreateProposalResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  const title = input.title?.trim();
  const client_id = input.client_id?.trim();
  if (!title || !client_id) {
    return {
      success: false,
      error: "Title and client ID are required",
    };
  }

  try {
    const payload: Record<string, unknown> = {
      title,
      client_id,
      status: input.status ?? "draft",
      due_date: input.due_date ?? "",
      approval_flow: input.approval_flow ?? "",
      sharing_public: input.sharing_public ? 1 : 0,
      sharing_token: input.sharing_token ?? "",
      sharing_allow_comments: input.sharing_allow_comments ? 1 : 0,
    };

    const res = await fetch(PROPOSALS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (errorData.issues) {
        return {
          success: false,
          error: errorData.error || "Validation failed",
          fieldErrors: errorData.issues,
        };
      }

      return {
        success: false,
        error: errorData.error || "Failed to create proposal",
      };
    }

    const data: ApiProposalResponse = await res.json();
    const proposal = convertApiProposalToProposal(data);
    const list = await getAll();
    persist([proposal, ...list]);

    return {
      success: true,
      data: proposal,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function createProposal(partial?: Partial<Proposal>): Promise<Proposal> {
  const now = Date.now();
  const p: Proposal = {
    id: uuid(),
    title: partial?.title ?? "Untitled Proposal",
    client: partial?.client ?? "",
    client_id: partial?.client_id,
    status: partial?.status ?? "draft",
    createdBy: partial?.createdBy ?? "you@example.com",
    createdAt: now,
    updatedAt: now,
    sections: partial?.sections ?? [
      { id: uuid(), title: "Overview", content: "", media: [], comments: [] },
      { id: uuid(), title: "Scope", content: "", media: [], comments: [] },
      { id: uuid(), title: "Timeline", content: "", media: [], comments: [] },
    ],
    pricing: partial?.pricing ?? {
      currency: "USD",
      taxRate: 0.1,
      items: [
        { id: uuid(), label: "Design", qty: 1, price: 3000 },
        { id: uuid(), label: "Development", qty: 1, price: 9000 },
      ],
    },
    settings: partial?.settings ?? {
      dueDate: undefined,
      approvalFlow: "Single approver",
      sharing: { public: false, token: undefined, allowComments: true },
    },
    versions: [],
  };
  const list = await getAll();
  persist([p, ...list]);
  return p;
}

export async function updateProposal(p: Proposal, options?: { keepVersion?: boolean; note?: string }) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  try {
    const payload = {
      ...p,
      options: {
        keepVersion: options?.keepVersion ?? false,
        note: options?.note,
      },
    };

    console.log("Updating proposal:", { proposalId: p.id, sectionCount: p.sections.length, sections: p.sections.map(s => s.title) });

    const res = await fetch(`${PROPOSALS_ENDPOINT}/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Update response status:", res.status, res.ok);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update proposal: ${res.statusText}`);
    }

    const data: ApiProposalResponse = await res.json();
    console.log("API response data:", data);

    let updatedProposal = convertApiProposalToProposal(data);
    console.log("Converted proposal sections:", updatedProposal.sections.map(s => s.title));

    console.log("Using local sections from the update request");
    updatedProposal = { ...updatedProposal, sections: p.sections };

    const list = await getAll();
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx === -1) {
      console.log("Proposal not in list, adding it");
      persist([updatedProposal, ...list]);
    } else {
      console.log("Updating proposal in list at index", idx);
      list[idx] = updatedProposal;
      persist(list);
    }
    console.log("Update completed successfully");
  } catch (err) {
    console.error("Failed to update proposal:", err);
    throw err;
  }
}

export async function deleteProposal(id: string) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(`${PROPOSALS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete proposal: ${res.statusText}`);
  }

  const list = await getAll();
  persist(list.filter((p) => p.id !== id));
}

export async function duplicateProposal(id: string): Promise<Proposal | undefined> {
  const list = await getAll();
  const src = list.find((p) => p.id === id);
  if (!src) return;
  const copy: Proposal = {
    ...src,
    id: uuid(),
    title: `${src.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    client_id: src.client_id,
    sections: src.sections.map((s) => ({ ...s, id: uuid() })),
    pricing: { ...src.pricing, items: src.pricing.items.map((i) => ({ ...i, id: uuid() })) },
  };
  persist([copy, ...list]);
  return copy;
}

export async function toggleShare(p: Proposal, makePublic: boolean): Promise<Proposal> {
  const token = p.settings.sharing.token ?? uuid();
  const next: Proposal = { ...p, settings: { ...p.settings, sharing: { ...p.settings.sharing, public: makePublic, token } } };
  await updateProposal(next);
  return next;
}

export async function addComment(p: Proposal, sectionId: string, author: string, text: string) {
  const sIdx = p.sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return;
  const sec = p.sections[sIdx];
  const comments = [...(sec.comments ?? [])];
  comments.unshift({ id: uuid(), author, text, createdAt: Date.now() });
  p.sections[sIdx] = { ...sec, comments };
  await updateProposal(p);
}

export async function reorderSection(p: Proposal, from: number, to: number): Promise<Proposal> {
  const arr = [...p.sections];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  const updated = { ...p, sections: arr, updatedAt: Date.now() };
  console.log("Reordering sections:", { from, to, sectionCount: updated.sections.length });
  await updateProposal(updated);
  console.log("Reorder completed");
  return updated;
}

export async function addSection(p: Proposal, title = "New Section", layout: "single" | "two-column" | "three-column" = "single"): Promise<Proposal> {
  const newSection = { id: uuid(), title, content: "", layout, media: [], comments: [] };
  const updated = {
    ...p,
    sections: [...p.sections, newSection],
    updatedAt: Date.now(),
  };
  console.log("Adding section:", { title, newSectionId: newSection.id, layout, totalSections: updated.sections.length });
  await updateProposal(updated);
  console.log("Add section completed");
  return updated;
}

export async function removeSection(p: Proposal, id: string): Promise<Proposal> {
  const updated = {
    ...p,
    sections: p.sections.filter((s) => s.id !== id),
    updatedAt: Date.now(),
  };
  console.log("Removing section:", { sectionId: id, remainingSections: updated.sections.length });
  await updateProposal(updated);
  console.log("Remove section completed");
  return updated;
}

export function valueTotal(p: Proposal): number {
  const subtotal = p.pricing.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = subtotal * (p.pricing.taxRate ?? 0);
  return subtotal + tax;
}
