import { z } from "zod";
import { getStoredToken } from "@/lib/auth";

export type ClientStatus = "active" | "inactive";

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: ClientStatus;
  createdAt: number;
  updatedAt: number;
}

export type CreateClientInput = {
  name: string;
  email: string;
  company?: string;
  status?: ClientStatus;
};

const STORAGE_KEY = "app_clients";
const CLIENTS_ENDPOINT = "/data/clients.json";

const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  status: z.union([z.literal("active"), z.literal("inactive")]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});
const clientListSchema = z.array(clientSchema);

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeClient(raw: z.infer<typeof clientSchema>): ClientRecord {
  return {
    id: raw.id!,
    name: raw.name!,
    email: raw.email!,
    company: raw.company ?? "",
    status: raw.status!,
    createdAt: raw.createdAt!,
    updatedAt: raw.updatedAt!,
  };
}

function readStored(): ClientRecord[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return clientListSchema.parse(parsed).map(normalizeClient);
  } catch {
    return null;
  }
}

function persist(list: ClientRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function fetchSeed(): Promise<ClientRecord[]> {
  const res = await fetch(CLIENTS_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load clients");
  const json = await res.json();
  const list = clientListSchema.parse(json).map(normalizeClient);
  persist(list);
  return list;
}

async function getAll(): Promise<ClientRecord[]> {
  return readStored() ?? (await fetchSeed());
}

export async function listClients(): Promise<ClientRecord[]> {
  const list = await getAll();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function createClient(input: CreateClientInput): Promise<ClientRecord> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) throw new Error("Name and email are required");
  const list = await getAll();
  const now = Date.now();
  const rec: ClientRecord = {
    id: uuid(),
    name,
    email,
    company: input.company?.trim() || "",
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  const next = [rec, ...list];
  persist(next);
  return rec;
}

export async function updateClient(rec: ClientRecord): Promise<void> {
  const list = await getAll();
  const idx = list.findIndex((c) => c.id === rec.id);
  if (idx === -1) throw new Error("Client not found");
  rec.updatedAt = Date.now();
  list[idx] = normalizeClient(clientSchema.parse(rec));
  persist(list);
}

export async function deleteClient(id: string): Promise<void> {
  const list = await getAll();
  persist(list.filter((c) => c.id !== id));
}
