export type UserRole = "admin" | "subscriber" | "user";

export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
}

export const AUTH_USERS: AuthUserRecord[] = [
  {
    id: "admin-1",
    name: "Avery Morgan",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    company: "Proposal AI",
  },
  {
    id: "subscriber-1",
    name: "Quinn Carter",
    email: "subscriber@example.com",
    password: "subscriber123",
    role: "subscriber",
    company: "Carter Creative",
  },
];
