import { NextRequest } from "next/server";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
}

export async function getAuthUser(
  _request: NextRequest
): Promise<AuthUser | null> {
  // Stub: returns a mock user for development
  return {
    id: "dev-user-001",
    email: "developer@adwork.dev",
    name: "Dev User",
    plan: "free",
  };
}

// ─── Plan Limits ────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    maxGenerationsPerDay: 5,
    maxDuration: 4,
    maxResolution: "1024x576",
  },
  pro: {
    maxGenerationsPerDay: 50,
    maxDuration: 5,
    maxResolution: "1920x1080",
  },
  enterprise: {
    maxGenerationsPerDay: -1, // unlimited
    maxDuration: 5,
    maxResolution: "1920x1080",
  },
} as const;
