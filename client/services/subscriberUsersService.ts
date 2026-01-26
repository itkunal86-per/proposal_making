import { z } from "zod";
import { getStoredToken } from "@/lib/auth";

export interface UserData {
  id: number;
  name: string;
  email: string;
}

export interface RoleData {
  id: number;
  name: string;
  slug: string;
}

export interface SubscriberUserRecord {
  id: number;
  subscriber_id: string;
  user_id: string;
  role_id: string;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
  user: UserData;
  role: RoleData;
}

export interface RoleOption {
  id: number;
  name: string;
}

export type CreateUserInput = {
  name: string;
  email: string;
  role_id: number;
  status: "Active" | "Inactive";
};

export type UpdateUserInput = {
  name: string;
  role_id: number;
  status: "Active" | "Inactive";
};

export interface CreateUserResult {
  success: boolean;
  data?: SubscriberUserRecord;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface UpdateUserResult {
  success: boolean;
  data?: SubscriberUserRecord;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface DeleteUserResult {
  success: boolean;
  error?: string;
}

const USERS_ENDPOINT = "https://propai-api.hirenq.com/api/subscriber/users";
const ROLES_ENDPOINT = "https://propai-api.hirenq.com/api/subscriber/roles";

const userRecordSchema = z.object({
  id: z.number(),
  subscriber_id: z.string(),
  user_id: z.string(),
  role_id: z.string(),
  status: z.enum(["Active", "Inactive"]),
  created_at: z.string(),
  updated_at: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  role: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
});

const userListSchema = z.array(userRecordSchema);

const roleOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
});
const roleListSchema = z.array(roleOptionSchema);

export async function listSubscriberUsers(): Promise<SubscriberUserRecord[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  try {
    const res = await fetch(USERS_ENDPOINT, {
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

    const json = await res.json();
    const list = userListSchema.parse(json);
    return list;
  } catch (err) {
    throw new Error("Failed to fetch users. Please try again.");
  }
}

export async function fetchRoles(): Promise<RoleOption[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  try {
    const res = await fetch(ROLES_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch roles: ${res.statusText}`);
    }

    const json = await res.json();
    const list = roleListSchema.parse(json);
    return list;
  } catch (err) {
    throw new Error("Failed to fetch roles. Please try again.");
  }
}

export async function createSubscriberUser(input: CreateUserInput): Promise<CreateUserResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email || !input.role_id) {
    return {
      success: false,
      error: "Name, email, and role are required",
    };
  }

  try {
    const res = await fetch(USERS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        role_id: input.role_id,
        status: input.status,
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
        error: errorData.error || "Failed to create user",
      };
    }

    const data: SubscriberUserRecord = await res.json();

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function fetchUserDetails(id: number): Promise<{ success: boolean; data?: SubscriberUserRecord; error?: string }> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const res = await fetch(`${USERS_ENDPOINT}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Failed to fetch user: ${res.statusText}`,
      };
    }

    const data: SubscriberUserRecord = await res.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function updateSubscriberUser(id: number, input: UpdateUserInput): Promise<UpdateUserResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  const name = input.name?.trim();
  if (!name || !input.role_id) {
    return {
      success: false,
      error: "Name and role are required",
    };
  }

  try {
    const res = await fetch(`${USERS_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        role_id: input.role_id,
        status: input.status,
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
        error: errorData.error || "Failed to update user",
      };
    }

    const data: SubscriberUserRecord = await res.json();

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export async function deleteSubscriberUser(id: number): Promise<DeleteUserResult> {
  const token = getStoredToken();
  if (!token) {
    return {
      success: false,
      error: "No authentication token available",
    };
  }

  try {
    const res = await fetch(`${USERS_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to delete user",
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}
