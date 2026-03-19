import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan");
  const billing = req.nextUrl.searchParams.get("billing") ?? "monthly";

  // Replace with actual session creation (Stripe/PhonePe)
  return NextResponse.json({ plan, billing });
}
