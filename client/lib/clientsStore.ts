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

const KEY = "app_clients";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function loadClients(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed: ClientRecord[] = [
        makeClient({ name: "Acme Corp", email: "ops@acme.com", company: "Acme", status: "active" }),
        makeClient({ name: "Globex Ltd", email: "hello@globex.com", company: "Globex", status: "inactive" }),
        makeClient({ name: "Initech", email: "contact@initech.com", company: "Initech", status: "active" }),
      ];
      saveClients(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as ClientRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClients(list: ClientRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function createClient(partial: Omit<Partial<ClientRecord>, "id" | "createdAt" | "updatedAt"> & { name: string; email: string }): ClientRecord {
  const now = Date.now();
  const record: ClientRecord = {
    id: uuid(),
    name: partial.name.trim(),
    email: partial.email.trim().toLowerCase(),
    company: partial.company?.trim() || "",
    status: partial.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  const list = loadClients();
  list.unshift(record);
  saveClients(list);
  return record;
}

export function updateClient(rec: ClientRecord) {
  const list = loadClients();
  const idx = list.findIndex((c) => c.id === rec.id);
  if (idx === -1) return;
  rec.updatedAt = Date.now();
  list[idx] = rec;
  saveClients(list);
}

export function deleteClient(id: string) {
  const list = loadClients().filter((c) => c.id !== id);
  saveClients(list);
}

function makeClient(p: { name: string; email: string; company?: string; status?: ClientStatus }): ClientRecord {
  const now = Date.now();
  return {
    id: uuid(),
    name: p.name,
    email: p.email,
    company: p.company ?? "",
    status: p.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
}
