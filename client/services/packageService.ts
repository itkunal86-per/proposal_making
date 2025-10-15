import { z } from "zod";

export const PACKAGE_QUERY_KEY = ["package-plans"] as const;

const STORAGE_KEY = "proposal-ai.packages";
const PACKAGES_ENDPOINT = "/data/packages.json";

const billingCycleSchema = z.enum(["monthly", "yearly"]);

const packagePlanBaseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  currency: z.string().min(1),
  billingCycle: billingCycleSchema,
  features: z.array(z.string().min(1)),
  isPopular: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  createdAt: z.string().optional(),
});

const packagePlanListSchema = z.array(packagePlanBaseSchema);

const createPackageSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  currency: z.string().min(1),
  billingCycle: billingCycleSchema,
  features: z.array(z.string().min(1)).min(1),
  isPopular: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type BillingCycle = z.infer<typeof billingCycleSchema>;

export interface PackagePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  isPopular: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePlan(raw: z.infer<typeof packagePlanBaseSchema>): PackagePlan {
  return {
    ...raw,
    isPopular: raw.isPopular ?? false,
    status: raw.status ?? "active",
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function sortPlans(plans: PackagePlan[]) {
  return [...plans].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.name.localeCompare(b.name);
  });
}

function readStoredPlans(): PackagePlan[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = packagePlanListSchema.parse(parsed).map(normalizePlan);
    return sortPlans(validated);
  } catch {
    return null;
  }
}

function persistPlans(plans: PackagePlan[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortPlans(plans)));
}

async function fetchPlansFromEndpoint(): Promise<PackagePlan[]> {
  const response = await fetch(PACKAGES_ENDPOINT, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load package catalog");
  }
  const data = await response.json();
  const normalized = packagePlanListSchema.parse(data).map(normalizePlan);
  const sorted = sortPlans(normalized);
  persistPlans(sorted);
  return sorted;
}

async function getPlans(): Promise<PackagePlan[]> {
  const stored = readStoredPlans();
  if (stored && stored.length > 0) {
    return stored;
  }
  return fetchPlansFromEndpoint();
}

export async function listPackages(): Promise<PackagePlan[]> {
  try {
    return await getPlans();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
}

export async function createPackage(input: CreatePackageInput): Promise<PackagePlan> {
  const payload = createPackageSchema.parse({
    ...input,
    features: input.features.map((feature) => feature.trim()).filter(Boolean),
    currency: input.currency.trim(),
    code: input.code?.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
  });

  const plans = await getPlans();

  const code = payload.code && payload.code.length > 0 ? payload.code : slugify(payload.name);
  if (!code) {
    throw new Error("Package code cannot be empty");
  }

  if (plans.some((plan) => plan.code === code)) {
    throw new Error("A package with this code already exists");
  }

  const plan: PackagePlan = {
    id: `pkg-${createId()}`,
    code,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    currency: payload.currency.toUpperCase(),
    billingCycle: payload.billingCycle,
    features: payload.features,
    isPopular: payload.isPopular ?? false,
    status: payload.status ?? "active",
    createdAt: new Date().toISOString(),
  };

  const next = sortPlans([...plans, plan]);
  persistPlans(next);
  return plan;
}
