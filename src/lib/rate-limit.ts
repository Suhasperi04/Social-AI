import { createAdminClient } from "@/lib/supabase/admin";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // per endpoint per minute

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = MAX_REQUESTS
): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  // Get existing rate limit entry
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .single();

  if (!existing || new Date(existing.window_start) < windowStart) {
    // New window — reset counter
    await supabase.from("rate_limits").upsert(
      {
        identifier,
        endpoint,
        request_count: 1,
        window_start: now.toISOString(),
      },
      { onConflict: "identifier,endpoint" }
    );

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now.getTime() + WINDOW_MS),
    };
  }

  if (existing.request_count >= maxRequests) {
    const resetAt = new Date(
      new Date(existing.window_start).getTime() + WINDOW_MS
    );
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Increment counter
  await supabase
    .from("rate_limits")
    .update({ request_count: existing.request_count + 1 })
    .eq("identifier", identifier)
    .eq("endpoint", endpoint);

  return {
    allowed: true,
    remaining: maxRequests - existing.request_count - 1,
    resetAt: new Date(
      new Date(existing.window_start).getTime() + WINDOW_MS
    ),
  };
}
