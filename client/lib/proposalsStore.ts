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

const KEY = "app_proposals";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function loadProposals(): Proposal[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed: Proposal[] = [
        makeProposal("Website Redesign", "Acme Corp", "jamie@example.com"),
        makeProposal("Mobile App MVP", "Globex Ltd", "ava@example.com"),
        makeProposal("SEO & Content", "Initech", "sams@example.com"),
      ];
      saveProposals(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Proposal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProposals(list: Proposal[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getProposal(id: string): Proposal | undefined {
  return loadProposals().find((p) => p.id === id);
}

export function getProposalByToken(token: string): Proposal | undefined {
  return loadProposals().find((p) => p.settings.sharing.token === token);
}

export function createProposal(partial?: Partial<Proposal>): Proposal {
  const now = Date.now();
  const proposal: Proposal = {
    id: uuid(),
    title: partial?.title ?? "Untitled Proposal",
    client: partial?.client ?? "",
    status: partial?.status ?? "draft",
    createdBy: partial?.createdBy ?? "you@example.com",
    createdAt: now,
    updatedAt: now,
    sections: partial?.sections ?? [
      {
        id: uuid(),
        title: "Overview",
        content: "",
        media: [],
        comments: [],
      },
      {
        id: uuid(),
        title: "Scope",
        content: "",
        media: [],
        comments: [],
      },
      {
        id: uuid(),
        title: "Timeline",
        content: "",
        media: [],
        comments: [],
      },
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
  const list = loadProposals();
  list.unshift(proposal);
  saveProposals(list);
  return proposal;
}

export function updateProposal(
  p: Proposal,
  options?: { keepVersion?: boolean; note?: string },
) {
  const list = loadProposals();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx === -1) return;
  const prev = list[idx];
  if (options?.keepVersion) {
    const snap: ProposalVersionSnapshot = {
      id: uuid(),
      createdAt: Date.now(),
      note: options?.note,
      data: prev,
    };
    p.versions = [snap, ...prev.versions];
  } else {
    p.versions = prev.versions;
  }
  p.updatedAt = Date.now();
  list[idx] = p;
  saveProposals(list);
}

export function deleteProposal(id: string) {
  const list = loadProposals().filter((p) => p.id !== id);
  saveProposals(list);
}

export function duplicateProposal(id: string): Proposal | undefined {
  const list = loadProposals();
  const src = list.find((p) => p.id === id);
  if (!src) return;
  const copy: Proposal = {
    ...src,
    id: uuid(),
    title: src.title + " (Copy)",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sections: src.sections.map((s) => ({ ...s, id: uuid() })),
    pricing: {
      ...src.pricing,
      items: src.pricing.items.map((i) => ({ ...i, id: uuid() })),
    },
  };
  list.unshift(copy);
  saveProposals(list);
  return copy;
}

export function toggleShare(p: Proposal, makePublic: boolean): Proposal {
  const token = p.settings.sharing.token ?? uuid();
  const next: Proposal = {
    ...p,
    settings: {
      ...p.settings,
      sharing: { ...p.settings.sharing, public: makePublic, token },
    },
  };
  updateProposal(next);
  return next;
}

export function addComment(
  p: Proposal,
  sectionId: string,
  author: string,
  text: string,
) {
  const sIdx = p.sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return;
  const sec = p.sections[sIdx];
  const comments = [...(sec.comments ?? [])];
  comments.unshift({ id: uuid(), author, text, createdAt: Date.now() });
  p.sections[sIdx] = { ...sec, comments };
  updateProposal(p);
}

export function reorderSection(p: Proposal, from: number, to: number) {
  const arr = [...p.sections];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  p.sections = arr;
  updateProposal(p);
}

export function addSection(p: Proposal, title = "New Section") {
  p.sections = [
    ...p.sections,
    { id: uuid(), title, content: "", media: [], comments: [] },
  ];
  updateProposal(p);
}

export function removeSection(p: Proposal, id: string) {
  p.sections = p.sections.filter((s) => s.id !== id);
  updateProposal(p);
}

export function valueTotal(p: Proposal): number {
  const subtotal = p.pricing.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = subtotal * (p.pricing.taxRate ?? 0);
  return subtotal + tax;
}

function makeProposal(
  title: string,
  client: string,
  createdBy: string,
): Proposal {
  return createProposal({ title, client, createdBy });
}
