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
const CLIENTS_ENDPOINT = "https://propai-api.hirenq.com/api/clients";

interface ApiClientResponse {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiCreateClientResponse {
  userId: string;
  name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientResult {
  success: boolean;
  data?: ClientRecord;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

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

function convertApiClientToRecord(client: ApiClientResponse): ClientRecord {
  const createdAtMs = new Date(client.created_at).getTime() || Date.now();
  const updatedAtMs = new Date(client.updated_at).getTime() || Date.now();
  const status = (client.status.toLowerCase() === "active" ? "active" : "inactive") as ClientStatus;

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    company: client.company || "",
    status,
    createdAt: createdAtMs,
    updatedAt: updatedAtMs,
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

async function fetchFromApi(): Promise<ClientRecord[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(CLIENTS_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.statusText}`);
  }

  const json: ApiClientResponse[] = await res.json();
  const list = json.map(convertApiClientToRecord);
  persist(list);
  return list;
}

async function fetchSeed(): Promise<ClientRecord[]> {
  try {
    return await fetchFromApi();
  } catch {
    const res = await fetch("/data/clients.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load clients");
    const json = await res.json();
    const list = clientListSchema.parse(json).map(normalizeClient);
    persist(list);
    return list;
  }
}

async function getAll(): Promise<ClientRecord[]> {
  try {
    return await fetchFromApi();
  } catch {
    return readStored() ?? (await fetchSeed());
  }
}

export async function listClients(): Promise<ClientRecord[]> {
  const list = await getAll();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function createClient(input: CreateClientInput): Promise<CreateClientResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) {
    return {
      success: false,
      error: "Name and email are required",
    };
  }

  try {
    const status = input.status ?? "active";
    const statusLabel = status === "active" ? "Active" : "Inactive";

    const res = await fetch(CLIENTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        company: input.company?.trim() || "",
        status: statusLabel,
      }),
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
        error: errorData.error || "Failed to create client",
      };
    }

    const data: ApiCreateClientResponse = await res.json();
    const createdAtMs = new Date(data.created_at).getTime() || Date.now();
    const updatedAtMs = new Date(data.updated_at).getTime() || Date.now();
    const clientStatus = (data.status.toLowerCase() === "active" ? "active" : "inactive") as ClientStatus;

    const rec: ClientRecord = {
      id: data.userId,
      name: data.name,
      email: data.email,
      company: data.company || "",
      status: clientStatus,
      createdAt: createdAtMs,
      updatedAt: updatedAtMs,
    };

    return {
      success: true,
      data: rec,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
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
