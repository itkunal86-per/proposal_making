import { z } from "zod";

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
const USERS_ENDPOINT = "/data/users.json";

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

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeUser(raw: z.infer<typeof userSchema>): UserRecord {
  return {
    ...raw,
    company: raw.company ?? "",
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

async function fetchSeed(): Promise<UserRecord[]> {
  const res = await fetch(USERS_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load users");
  const json = await res.json();
  const list = userListSchema.parse(json).map(normalizeUser);
  persist(list);
  return list;
}

async function getAll(): Promise<UserRecord[]> {
  return readStored() ?? (await fetchSeed());
}

export async function listUsers(): Promise<UserRecord[]> {
  return getAll();
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) throw new Error("Name and email are required");
  const list = await getAll();
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
  const list = await getAll();
  const idx = list.findIndex((u) => u.id === user.id);
  if (idx === -1) throw new Error("User not found");
  list[idx] = userSchema.parse(user);
  persist(list);
}

export async function deleteUser(id: string): Promise<void> {
  const list = await getAll();
  persist(list.filter((u) => u.id !== id));
}
