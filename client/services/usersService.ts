import { z } from "zod";
import { getStoredToken } from "@/lib/auth";

export type UserRole = "admin" | "subscriber";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
  createdAt: number;
}

export type CreateUserInput = {
  name: string;
  email: string;
  role?: UserRole;
  company?: string;
  password?: string;
};

const STORAGE_KEY = "app_users";
const API_ENDPOINT = "https://propai-api.hirenq.com/api/users";

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.union([z.literal("admin"), z.literal("subscriber")]),
  company: z.string().optional(),
  createdAt: z.number().int().nonnegative(),
});
const userListSchema = z.array(userSchema);

interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  details: {
    user_details_id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    created_at: string;
    updated_at: string;
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeUser(raw: z.infer<typeof userSchema>): UserRecord {
  return {
    id: raw.id!,
    name: raw.name!,
    email: raw.email!,
    password: raw.password!,
    role: raw.role!,
    company: raw.company ?? "",
    createdAt: raw.createdAt!,
  };
}

function convertApiUserToRecord(user: ApiUserResponse): UserRecord {
  const createdAt = new Date(user.created_at).getTime() || Date.now();
  return {
    id: String(user.id),
    name: user.details?.name || user.name,
    email: user.details?.email || user.email,
    password: "changeme",
    role: user.role,
    company: user.details?.company || "",
    createdAt,
  };
}

function readStored(): UserRecord[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return userListSchema.parse(parsed).map(normalizeUser);
  } catch {
    return null;
  }
}

function persist(list: UserRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function fetchFromApi(): Promise<UserRecord[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(API_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.statusText}`);
  }

  const json: ApiUserResponse[] = await res.json();
  const list = json.map(convertApiUserToRecord);
  persist(list);
  return list;
}

export async function listUsers(): Promise<UserRecord[]> {
  try {
    return await fetchFromApi();
  } catch (err) {
    return readStored() ?? [];
  }
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) throw new Error("Name and email are required");
  const list = await listUsers();
  if (list.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("A user with this email already exists");
  }
  const rec: UserRecord = {
    id: uuid(),
    name,
    email,
    role: input.role ?? "subscriber",
    company: input.company?.trim() || "",
    password: input.password ?? "changeme",
    createdAt: Date.now(),
  };
  const next = [rec, ...list];
  persist(next);
  return rec;
}

export async function updateUser(user: UserRecord): Promise<void> {
  const list = await listUsers();
  const idx = list.findIndex((u) => u.id === user.id);
  if (idx === -1) throw new Error("User not found");
  list[idx] = normalizeUser(userSchema.parse(user));
  persist(list);
}

export async function deleteUser(id: string): Promise<void> {
  const list = await listUsers();
  persist(list.filter((u) => u.id !== id));
}
