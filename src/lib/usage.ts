import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/types";

export type UsageType = "reports" | "competitor_analyses" | "ideas";

interface UsageCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export async function checkUsage(
  instagramId: string,
  type: UsageType
): Promise<UsageCheck> {
  const supabase = createAdminClient();

  // Get account plan
  const { data: account } = await supabase
    .from("instagram_accounts")
    .select("plan")
    .eq("instagram_id", instagramId)
    .single();

  const plan = (account?.plan as "free" | "pro") || "free";
  const limits = PLAN_LIMITS[plan];

  // Get usage
  const { data: usage } = await supabase
    .from("usage")
    .select("*")
    .eq("instagram_id", instagramId)
    .single();

  const columnMap: Record<UsageType, string> = {
    reports: "reports_used",
    competitor_analyses: "competitor_analyses_used",
    ideas: "ideas_used",
  };

  const limitMap: Record<UsageType, number> = {
    reports: limits.reports,
    competitor_analyses: limits.competitorAnalyses,
    ideas: limits.ideas,
  };

  const used = usage?.[columnMap[type] as keyof typeof usage] as number || 0;
  const limit = limitMap[type];

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function incrementUsage(
  instagramId: string,
  type: UsageType
): Promise<void> {
  const supabase = createAdminClient();

  const columnMap: Record<UsageType, string> = {
    reports: "reports_used",
    competitor_analyses: "competitor_analyses_used",
    ideas: "ideas_used",
  };

  const column = columnMap[type];

  // Get current value
  const { data: usage } = await supabase
    .from("usage")
    .select(column)
    .eq("instagram_id", instagramId)
    .single();

  const currentValue = (usage?.[column as keyof typeof usage] as number) || 0;

  await supabase
    .from("usage")
    .update({ [column]: currentValue + 1 })
    .eq("instagram_id", instagramId);
}
