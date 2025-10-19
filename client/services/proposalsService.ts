import { z } from "zod";

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  media?: { type: "image" | "video"; url: string }[];
  comments?: { id: string; author: string; text: string; createdAt: number }[];
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
}

const STORAGE_KEY = "app_proposals";
const PROPOSALS_ENDPOINT = "/data/proposals.json";

const idSchema = z.string();
const sectionSchema = z.object({
  id: idSchema,
  title: z.string(),
  content: z.string(),
  media: z.array(z.object({ type: z.union([z.literal("image"), z.literal("video")]), url: z.string().url() })).optional(),
  comments: z.array(z.object({ id: z.string(), author: z.string(), text: z.string(), createdAt: z.number() })).optional(),
});
const pricingItemSchema = z.object({ id: idSchema, label: z.string(), qty: z.number(), price: z.number() });
const proposalSchema = z.object({
  id: idSchema,
  title: z.string(),
  client: z.string(),
  status: z.union([z.literal("draft"), z.literal("sent"), z.literal("accepted"), z.literal("declined")]),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  sections: z.array(sectionSchema),
  pricing: z.object({ currency: z.string(), items: z.array(pricingItemSchema), taxRate: z.number() }),
  settings: z.object({
    dueDate: z.string().optional(),
    approvalFlow: z.string().optional(),
    sharing: z.object({ public: z.boolean(), token: z.string().optional(), allowComments: z.boolean() }),
  }),
  versions: z.array(z.object({ id: idSchema, createdAt: z.number(), note: z.string().optional(), data: z.any() })),
});
const proposalListSchema = z.array(proposalSchema);

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeProposal(raw: z.infer<typeof proposalSchema>): Proposal {
  return {
    ...raw,
    sections: raw.sections,
    pricing: raw.pricing,
    settings: raw.settings,
    versions: raw.versions,
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

async function fetchSeed(): Promise<Proposal[]> {
  const res = await fetch(PROPOSALS_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load proposals");
  const json = await res.json();
  const list = proposalListSchema.parse(json).map(normalizeProposal);
  persist(list);
  return list;
}

async function getAll(): Promise<Proposal[]> {
  return readStored() ?? (await fetchSeed());
}

export async function listProposals(): Promise<Proposal[]> {
  const list = await getAll();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProposal(id: string): Promise<Proposal | undefined> {
  const list = await getAll();
  return list.find((p) => p.id === id);
}

export async function getProposalByToken(token: string): Promise<Proposal | undefined> {
  const list = await getAll();
  return list.find((p) => p.settings.sharing.token === token);
}

export async function createProposal(partial?: Partial<Proposal>): Promise<Proposal> {
  const now = Date.now();
  const p: Proposal = {
    id: uuid(),
    title: partial?.title ?? "Untitled Proposal",
    client: partial?.client ?? "",
    status: partial?.status ?? "draft",
    createdBy: partial?.createdBy ?? "you@example.com",
    createdAt: now,
    updatedAt: now,
    sections: partial?.sections ?? [
      { id: uuid(), title: "Overview", content: "Project overview...", media: [], comments: [] },
      { id: uuid(), title: "Scope", content: "Scope of work...", media: [], comments: [] },
      { id: uuid(), title: "Timeline", content: "Timeline...", media: [], comments: [] },
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
  const list = await getAll();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx === -1) return;
  const prev = list[idx];
  if (options?.keepVersion) {
    const snap: ProposalVersionSnapshot = { id: uuid(), createdAt: Date.now(), note: options?.note, data: prev };
    p.versions = [snap, ...prev.versions];
  } else {
    p.versions = prev.versions;
  }
  p.updatedAt = Date.now();
  list[idx] = proposalSchema.parse(p);
  persist(list);
}

export async function deleteProposal(id: string) {
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

export async function reorderSection(p: Proposal, from: number, to: number) {
  const arr = [...p.sections];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  p.sections = arr;
  await updateProposal(p);
}

export async function addSection(p: Proposal, title = "New Section") {
  p.sections = [...p.sections, { id: uuid(), title, content: "", media: [], comments: [] }];
  await updateProposal(p);
}

export async function removeSection(p: Proposal, id: string) {
  p.sections = p.sections.filter((s) => s.id !== id);
  await updateProposal(p);
}

export function valueTotal(p: Proposal): number {
  const subtotal = p.pricing.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = subtotal * (p.pricing.taxRate ?? 0);
  return subtotal + tax;
}
