import { z } from "zod";
import { getStoredToken, getStoredAuth } from "@/lib/auth";

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export interface ShapeElement {
  id: string;
  type: "square" | "circle" | "triangle";
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  top: number;
  left: number;
}

export interface TableCell {
  id: string;
  content: string;
}

export interface TableElement {
  id: string;
  rows: number;
  columns: number;
  cells: TableCell[][];
  borderWidth: number;
  borderColor: string;
  headerBackground?: string;
  cellBackground?: string;
  textColor?: string;
  padding: number;
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface TextElement {
  id: string;
  content: string;
  fontSize?: string;
  color?: string;
  fontWeight?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  width?: number;
  height?: number;
  top: number;
  left: number;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  layout?: "single" | "two-column" | "three-column";
  columnContents?: string[];
  columnStyles?: Record<string, any>[];
  media?: { type: "image" | "video"; url: string }[];
  shapes?: ShapeElement[];
  tables?: TableElement[];
  texts?: TextElement[];
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
  pricing?: {
    currency?: string;
    items?: ProposalPricingItem[];
    taxRate?: number;
  };
  items?: ProposalPricingItem[];
  settings?: {
    dueDate?: string;
    approvalFlow?: string;
    sharing?: { public: boolean; token?: string; allowComments: boolean };
  };
  sections?: any[];
  versions?: any[];
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
const shapeElementSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.union([z.literal("square"), z.literal("circle"), z.literal("triangle")]),
  width: z.number(),
  height: z.number(),
  backgroundColor: z.string(),
  backgroundImage: z.string().optional(),
  backgroundSize: z.string().optional(),
  backgroundOpacity: z.string().optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(),
  borderRadius: z.number().optional(),
  top: z.number(),
  left: z.number(),
}).passthrough();

const tableCellSchema = z.object({
  id: z.union([z.string(), z.number()]),
  content: z.string(),
}).passthrough();

const tableElementSchema = z.object({
  id: z.union([z.string(), z.number()]),
  rows: z.number(),
  columns: z.number(),
  cells: z.array(z.array(tableCellSchema)),
  borderWidth: z.number(),
  borderColor: z.string(),
  headerBackground: z.string().optional(),
  cellBackground: z.string().optional(),
  textColor: z.string().optional(),
  padding: z.number(),
  width: z.number(),
  height: z.number(),
  top: z.number(),
  left: z.number(),
}).passthrough();

const sectionSchema = z.object({
  id: idSchema,
  title: z.string(),
  content: z.string(),
  layout: z.union([z.literal("single"), z.literal("two-column"), z.literal("three-column")]).nullable().optional(),
  columnContents: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  columnStyles: z.union([z.array(z.record(z.any())), z.record(z.any())]).optional(),
  media: z.array(z.object({ type: z.union([z.literal("image"), z.literal("video")]), url: z.string() })).optional(),
  shapes: z.array(shapeElementSchema).optional(),
  tables: z.array(tableElementSchema).optional(),
  comments: z.array(z.object({ id: z.union([z.string(), z.number()]), author: z.string(), text: z.string(), createdAt: z.number() })).optional(),
  titleStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
  contentStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
}).passthrough(); // Allow additional fields from API
const pricingItemSchema = z.object({ id: idSchema, label: z.string(), qty: z.number(), price: z.number() });
const proposalSchema = z.object({
  id: idSchema,
  title: z.string(),
  client: z.string().optional(),
  client_id: z.union([z.string(), z.number()]).optional(),
  status: z.union([z.literal("draft"), z.literal("sent"), z.literal("accepted"), z.literal("declined")]).optional(),
  createdBy: z.union([z.string(), z.number()]).optional(),
  createdAt: z.union([z.number(), z.string()]).optional(),
  updatedAt: z.union([z.number(), z.string()]).optional(),
  sections: z.array(sectionSchema),
  pricing: z.object({ currency: z.string(), items: z.array(pricingItemSchema), taxRate: z.number() }).optional(),
  settings: z.object({
    dueDate: z.string().optional(),
    approvalFlow: z.string().optional(),
    sharing: z.object({ public: z.boolean(), token: z.string().optional(), allowComments: z.boolean() }),
  }).optional(),
  versions: z.array(z.object({ id: idSchema, createdAt: z.number(), note: z.string().optional(), data: z.any() })).optional(),
  titleStyles: z.union([z.record(z.any()), z.array(z.any())]).optional(),
}).passthrough(); // Allow additional fields from API
const proposalListSchema = z.array(proposalSchema);

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeStyles(styles: any): Record<string, any> | undefined {
  if (!styles) return undefined;
  if (Array.isArray(styles)) return undefined; // Arrays like [] become undefined
  if (typeof styles === "object" && Object.keys(styles).length === 0) return undefined; // Empty objects become undefined
  if (typeof styles === "object") return styles;
  return undefined;
}

function normalizeProposal(raw: z.infer<typeof proposalSchema>): Proposal {
  const createdAtMs = typeof raw.createdAt === "number" ? raw.createdAt : (typeof raw.createdAt === "string" ? new Date(raw.createdAt).getTime() : Date.now());
  const updatedAtMs = typeof raw.updatedAt === "number" ? raw.updatedAt : (typeof raw.updatedAt === "string" ? new Date(raw.updatedAt).getTime() : createdAtMs);

  return {
    id: String(raw.id!),
    title: raw.title!,
    client: raw.client || "",
    client_id: raw.client_id ? String(raw.client_id) : undefined,
    status: raw.status || "draft",
    createdBy: String(raw.createdBy || "system"),
    createdAt: createdAtMs,
    updatedAt: updatedAtMs,
    sections: (raw.sections ?? []).map((s) => {
      // Handle columnContents - could be array or object
      let normalizedColumnContents: string[] | undefined;
      if (Array.isArray(s.columnContents)) {
        normalizedColumnContents = s.columnContents;
      } else if (typeof s.columnContents === "object" && s.columnContents !== null && Object.keys(s.columnContents).length > 0) {
        normalizedColumnContents = undefined; // Empty or invalid objects become undefined
      }

      // Handle columnStyles - could be array or object
      let normalizedColumnStyles: Record<string, any>[] | undefined;
      if (Array.isArray(s.columnStyles)) {
        normalizedColumnStyles = s.columnStyles.map(normalizeStyles).filter((s) => s !== undefined) as Record<string, any>[];
      } else if (typeof s.columnStyles === "object" && s.columnStyles !== null && Object.keys(s.columnStyles).length === 0) {
        normalizedColumnStyles = undefined; // Empty objects become undefined
      }

      return {
        id: String(s.id!),
        title: s.title!,
        content: s.content!,
        layout: (s.layout && s.layout !== null) ? s.layout : "single",
        columnContents: normalizedColumnContents,
        columnStyles: normalizedColumnStyles,
        media: (s.media ?? []).map((m) => ({
          type: m.type!,
          url: m.url!,
        })),
        shapes: (s.shapes ?? []).map((shape) => ({
          id: String(shape.id!),
          type: shape.type! as "square" | "circle" | "triangle",
          width: shape.width!,
          height: shape.height!,
          backgroundColor: shape.backgroundColor!,
          backgroundImage: shape.backgroundImage,
          backgroundSize: shape.backgroundSize,
          backgroundOpacity: shape.backgroundOpacity,
          borderWidth: shape.borderWidth,
          borderColor: shape.borderColor,
          borderRadius: shape.borderRadius,
          top: typeof shape.top === "number" ? shape.top : 0,
          left: typeof shape.left === "number" ? shape.left : 0,
        })),
        tables: (s.tables ?? []).map((table) => ({
          id: String(table.id!),
          rows: table.rows!,
          columns: table.columns!,
          cells: (table.cells ?? []).map((row) =>
            (row ?? []).map((cell) => ({
              id: String(cell.id!),
              content: cell.content!,
            }))
          ),
          borderWidth: table.borderWidth!,
          borderColor: table.borderColor!,
          headerBackground: table.headerBackground,
          cellBackground: table.cellBackground,
          textColor: table.textColor,
          padding: table.padding!,
          width: table.width!,
          height: table.height!,
          top: typeof table.top === "number" ? table.top : 0,
          left: typeof table.left === "number" ? table.left : 0,
        })),
        comments: (s.comments ?? []).map((c) => ({
          id: String(c.id!),
          author: c.author!,
          text: c.text!,
          createdAt: c.createdAt!,
        })),
        titleStyles: normalizeStyles(s.titleStyles),
        contentStyles: normalizeStyles(s.contentStyles),
      };
    }),
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

export async function persistProposal(p: Proposal) {
  if (!isBrowser()) return;
  const list = readStored() ?? [];
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx === -1) {
    persist([p, ...list]);
  } else {
    list[idx] = p;
    persist(list);
  }
}

function convertApiProposalToProposal(apiProposal: ApiProposalResponse, userEmail?: string): Proposal {
  const createdAtMs = apiProposal.created_at ? new Date(apiProposal.created_at).getTime() : Date.now();
  const updatedAtMs = apiProposal.updated_at ? new Date(apiProposal.updated_at).getTime() : createdAtMs;

  // Ensure we have a valid ID - handle both numeric and string IDs from API
  const proposalId = apiProposal.id ? String(apiProposal.id) : uuid();
  console.log("convertApiProposalToProposal - original id:", apiProposal.id, "converted to:", proposalId);

  // Handle both old API structure (with created_at) and new API structure (with timestamps)
  const sections = Array.isArray((apiProposal as any).sections) && (apiProposal as any).sections.length > 0
    ? ((apiProposal as any).sections as any[]).map((s) => {
        // Handle columnContents - could be array or object
      let normalizedColumnContents: string[] | undefined;
      if (Array.isArray(s.columnContents) && s.columnContents.length > 0) {
        normalizedColumnContents = s.columnContents;
      } else if (typeof s.columnContents === "object" && s.columnContents !== null) {
        const keys = Object.keys(s.columnContents);
        if (keys.length > 0) {
          // Convert object to array (e.g., {"0": "content1", "1": "content2"} -> ["content1", "content2"])
          normalizedColumnContents = keys.sort((a, b) => parseInt(a) - parseInt(b)).map(k => s.columnContents[k]);
        }
      }

        // Handle columnStyles - could be array or object
        let normalizedColumnStyles: Record<string, any>[] | undefined;
        if (Array.isArray(s.columnStyles) && s.columnStyles.length > 0) {
          normalizedColumnStyles = s.columnStyles.map(normalizeStyles).filter((s) => s !== undefined) as Record<string, any>[];
        } else if (typeof s.columnStyles === "object" && s.columnStyles !== null) {
          const keys = Object.keys(s.columnStyles);
          if (keys.length > 0) {
            // Convert object to array if keys are numeric
            const isNumericKeys = keys.every(k => !isNaN(parseInt(k)));
            if (isNumericKeys) {
              normalizedColumnStyles = keys.sort((a, b) => parseInt(a) - parseInt(b))
                .map(k => normalizeStyles(s.columnStyles[k]))
                .filter((s) => s !== undefined) as Record<string, any>[];
            }
          }
        }

        // Infer layout from normalizedColumnContents if layout is null
        let inferredLayout: "single" | "two-column" | "three-column" = "single";
        if (!s.layout || s.layout === null) {
          // When layout is null from API, infer from columnContents
          if (normalizedColumnContents && Array.isArray(normalizedColumnContents)) {
            if (normalizedColumnContents.length === 3) {
              inferredLayout = "three-column";
            } else if (normalizedColumnContents.length === 2) {
              inferredLayout = "two-column";
            } else {
              inferredLayout = "single";
            }
          }
        } else if (typeof s.layout === "string" && ["single", "two-column", "three-column"].includes(s.layout)) {
          inferredLayout = s.layout as "single" | "two-column" | "three-column";
        }

        return {
          id: String(s.id),
          title: s.title || "",
          content: s.content || "",
          layout: inferredLayout,
          columnContents: normalizedColumnContents,
          columnStyles: normalizedColumnStyles,
          media: Array.isArray(s.media) ? s.media : [],
          shapes: Array.isArray(s.shapes) ? s.shapes.map((shape) => ({
            id: String(shape.id),
            type: shape.type as "square" | "circle" | "triangle",
            width: shape.width,
            height: shape.height,
            backgroundColor: shape.backgroundColor,
            backgroundImage: shape.backgroundImage,
            backgroundSize: shape.backgroundSize,
            backgroundOpacity: shape.backgroundOpacity,
            borderWidth: shape.borderWidth,
            borderColor: shape.borderColor,
            borderRadius: shape.borderRadius,
            top: typeof shape.top === "number" ? shape.top : 0,
            left: typeof shape.left === "number" ? shape.left : 0,
          })) : [],
          tables: Array.isArray(s.tables) ? s.tables.map((table) => ({
            id: String(table.id),
            rows: table.rows,
            columns: table.columns,
            cells: (table.cells ?? []).map((row) =>
              (row ?? []).map((cell) => ({
                id: String(cell.id),
                content: cell.content,
              }))
            ),
            borderWidth: table.borderWidth,
            borderColor: table.borderColor,
            headerBackground: table.headerBackground,
            cellBackground: table.cellBackground,
            textColor: table.textColor,
            padding: table.padding,
            width: table.width,
            height: table.height,
            top: typeof table.top === "number" ? table.top : 0,
            left: typeof table.left === "number" ? table.left : 0,
          })) : [],
          comments: Array.isArray(s.comments) ? s.comments : [],
          titleStyles: normalizeStyles(s.titleStyles),
          contentStyles: normalizeStyles(s.contentStyles),
        };
      })
    : [
      { id: uuid(), title: "Overview", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
      { id: uuid(), title: "Scope", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
      { id: uuid(), title: "Timeline", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
    ] as ProposalSection[];

  const clientName = typeof apiProposal.client === "string" ? apiProposal.client : (apiProposal.client?.name || "");
  const clientId = typeof apiProposal.client_id === "string" ? apiProposal.client_id : (apiProposal.client_id ? String(apiProposal.client_id) : undefined);

  return {
    id: proposalId,
    title: apiProposal.title,
    client: clientName,
    client_id: clientId,
    status: apiProposal.status,
    createdBy: apiProposal.created_by || userEmail || "you@example.com",
    createdAt: createdAtMs,
    updatedAt: updatedAtMs,
    sections,
    pricing: {
      currency: (apiProposal.pricing as any)?.currency || apiProposal.currency || "USD",
      taxRate: (apiProposal.pricing as any)?.taxRate ?? apiProposal.tax_rate ?? 0.1,
      items: Array.isArray((apiProposal.pricing as any)?.items) ? (apiProposal.pricing as any).items : (
        Array.isArray(apiProposal.items) ? apiProposal.items : [
          { id: uuid(), label: "Design", qty: 1, price: 3000 },
          { id: uuid(), label: "Development", qty: 1, price: 9000 },
        ]
      ),
    },
    settings: {
      dueDate: (apiProposal.settings as any)?.dueDate || apiProposal.due_date || undefined,
      approvalFlow: (apiProposal.settings as any)?.approvalFlow || apiProposal.approval_flow || "Single approver",
      sharing: {
        public: ((apiProposal.settings as any)?.sharing?.public ?? apiProposal.sharing_public ?? 0) === 1,
        token: (apiProposal.settings as any)?.sharing?.token || apiProposal.sharing_token || undefined,
        allowComments: ((apiProposal.settings as any)?.sharing?.allowComments ?? apiProposal.sharing_allow_comments ?? 0) === 1,
      },
    },
    versions: Array.isArray((apiProposal as any).versions) ? (apiProposal as any).versions : [],
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
  console.log("getProposal called with id:", id);
  // Check local storage first (for recently created proposals that may not be on the API yet)
  const stored = readStored();
  console.log("Stored proposals:", stored?.map(p => ({ id: p.id, title: p.title })));
  const found = stored?.find((p) => p.id === id);
  console.log("Found in storage:", found?.id);
  if (found) return found;

  // Fall back to API list
  console.log("Proposal not in storage, fetching from API...");
  const list = await getAll();
  console.log("API proposals:", list.map(p => ({ id: p.id, title: p.title })));
  return list.find((p) => p.id === id);
}

export async function getProposalDetails(id: string): Promise<Proposal | undefined> {
  console.log("getProposalDetails called with id:", id, "type:", typeof id);
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

    // Convert API response directly (handles all structure variations)
    let normalized = convertApiProposalToProposal(json);
    const list = readStored() ?? [];
    const idx = list.findIndex((x) => x.id === normalized.id);
    const localProposal = idx !== -1 ? list[idx] : null;

    // Merge with local storage to preserve layout and column data
    // The API may return null/empty for these fields even if they were set
    if (localProposal) {
      console.log("Local proposal found, merging sections...", {
        apiSections: normalized.sections.map(s => ({ id: s.id, title: s.title, layout: s.layout })),
        localSections: localProposal.sections.map(s => ({ id: s.id, title: s.title, layout: s.layout, columnContents: s.columnContents })),
      });

      normalized = {
        ...normalized,
        sections: normalized.sections.map((apiSection) => {
          const localSection = localProposal.sections.find((s) => String(s.id) === String(apiSection.id));

          if (localSection) {
            const hasApiLayout = apiSection.layout && apiSection.layout !== null && apiSection.layout !== "single";
            const hasApiColumnContents = Array.isArray(apiSection.columnContents) && apiSection.columnContents.length > 0;
            const hasLocalLayout = localSection.layout && localSection.layout !== null;
            const hasLocalColumnContents = Array.isArray(localSection.columnContents) && localSection.columnContents.length > 0;

            const mergedSection = {
              ...apiSection,
              // Use local layout if API returned null or "single" and local has multi-column
              layout: (hasApiLayout ? apiSection.layout : (hasLocalLayout ? localSection.layout : "single")),
              // Use local columnContents if API returned empty/null
              columnContents: (hasApiColumnContents ? apiSection.columnContents : localSection.columnContents),
              // Use local columnStyles if API returned empty/null
              columnStyles: (apiSection.columnStyles && apiSection.columnStyles.length > 0)
                ? apiSection.columnStyles
                : localSection.columnStyles,
              // Use local styles if API didn't return them
              titleStyles: apiSection.titleStyles || localSection.titleStyles,
              contentStyles: apiSection.contentStyles || localSection.contentStyles,
            };

            if (mergedSection.layout !== "single") {
              console.log("Merged section with multi-column layout:", {
                id: mergedSection.id,
                title: mergedSection.title,
                layout: mergedSection.layout,
                apiLayout: apiSection.layout,
                localLayout: localSection.layout,
                columnContents: mergedSection.columnContents,
                apiColumnContents: apiSection.columnContents,
                localColumnContents: localSection.columnContents,
                columnStyles: mergedSection.columnStyles,
              });
            }

            return mergedSection;
          }
          return apiSection;
        }),
      };
    }

    persist([normalized, ...list.filter(x => x.id !== normalized.id)]);
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

    const response = await res.json();
    console.log("API response from createProposalApi:", response);

    // Extract the proposal data from the API response wrapper
    const data: ApiProposalResponse = response.data || response;
    console.log("Extracted proposal data with id:", data.id);

    const proposal = convertApiProposalToProposal(data);
    console.log("Converted proposal with id:", proposal.id);
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
      { id: uuid(), title: "Overview", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
      { id: uuid(), title: "Scope", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
      { id: uuid(), title: "Timeline", content: "", layout: "single" as const, titleStyles: {}, contentStyles: { gapAfter: 24 }, media: [], shapes: [], tables: [], comments: [] },
    ] as ProposalSection[],
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
  try {
    const token = await getStoredToken();
    const response = await fetch(`${PROPOSALS_ENDPOINT}/${id}/duplicate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to duplicate proposal:", response.statusText);
      return undefined;
    }

    const data = await response.json();

    // Transform API response to Proposal interface
    const newProposal: Proposal = {
      id: String(data.id),
      title: data.title,
      client: data.client || "",
      client_id: String(data.client_id),
      status: data.status as ProposalStatus,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      createdBy: data.created_by || "",
      sections: [],
      pricing: {
        currency: data.currency || "USD",
        items: [],
        taxRate: parseFloat(data.tax_rate) || 0,
      },
      settings: {
        dueDate: data.due_date || undefined,
        sharing: {
          token: data.sharing_token || uuid(),
          public: false,
          allowComments: false,
        },
      },
      versions: [],
    };

    // Persist the new proposal locally
    persist([newProposal, ...(await getAll())]);

    return newProposal;
  } catch (error) {
    console.error("Error duplicating proposal:", error);
    return undefined;
  }
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
  const columnCount = layout === "two-column" ? 2 : layout === "three-column" ? 3 : 0;
  const columnContents = columnCount > 0 ? Array(columnCount).fill("") : undefined;
  const columnStyles = columnCount > 0 ? Array(columnCount).fill({
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  }) : undefined;
  const titleStyles = columnCount > 0 ? { columnGap: 0 } : {};
  const contentStyles = { gapAfter: 10 };

  const newSection = { id: uuid(), title, content: "", layout, columnContents, columnStyles, titleStyles, contentStyles, media: [], shapes: [], tables: [], comments: [] };
  const updated = {
    ...p,
    sections: [...p.sections, newSection],
    updatedAt: Date.now(),
  };
  console.log("Adding section:", { title, newSectionId: newSection.id, layout, columnCount, totalSections: updated.sections.length, newSection });
  await updateProposal(updated);
  console.log("Add section completed", { sections: updated.sections.map(s => ({ id: s.id, title: s.title, layout: s.layout })) });
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

export async function enableProposalSharing(proposalId: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const authToken = getStoredToken();
  if (!authToken) {
    return { success: false, error: "No authentication token available" };
  }

  try {
    // Get the proposal details first to retrieve existing sharing_token
    const proposal = await getProposalDetails(proposalId);
    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    // Use existing token from proposal, or generate new one if not present
    const sharingToken = proposal.settings?.sharing?.token || uuid();

    // If sharing is already enabled and we have a token, return it
    if (proposal.settings?.sharing?.public && sharingToken) {
      console.log("Sharing already enabled with existing token:", sharingToken);
      return { success: true, token: sharingToken };
    }

    // Update the proposal with sharing enabled
    const updatedProposal = {
      ...proposal,
      settings: {
        ...proposal.settings,
        sharing: {
          public: true,
          token: sharingToken,
          allowComments: proposal.settings?.sharing?.allowComments ?? true,
        },
      },
    };

    // Save the updated proposal
    const res = await fetch(`${PROPOSALS_ENDPOINT}/${proposalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedProposal),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Failed to update proposal sharing:", errorData);
      return { success: false, error: "Failed to enable sharing" };
    }

    const data: ApiProposalResponse = await res.json();
    console.log("Sharing enabled, response data:", {
      id: data.id,
      sharing_token: data.sharing_token,
      settings_sharing: (data.settings as any)?.sharing,
    });

    // Try to extract the token from the API response - prefer existing token we sent
    let returnToken = sharingToken;

    // Check top-level sharing_token field
    if (data.sharing_token) {
      returnToken = data.sharing_token;
      console.log("Token from API sharing_token:", returnToken);
    }
    // Check settings.sharing.token
    else if ((data.settings as any)?.sharing?.token) {
      returnToken = (data.settings as any).sharing.token;
      console.log("Token from API settings.sharing.token:", returnToken);
    }

    return { success: true, token: returnToken };
  } catch (err) {
    console.error("Failed to enable sharing:", err);
    return { success: false, error: "Failed to enable sharing" };
  }
}

export async function getPublicProposal(sharingToken: string): Promise<Proposal | null> {
  try {
    const res = await fetch(`https://propai-api.hirenq.com/api/public/proposal/${sharingToken}`);

    if (!res.ok) {
      console.error("Failed to fetch public proposal:", res.statusText);
      return null;
    }

    const data: ApiProposalResponse = await res.json();
    return convertApiProposalToProposal(data);
  } catch (err) {
    console.error("Failed to fetch public proposal:", err);
    return null;
  }
}
