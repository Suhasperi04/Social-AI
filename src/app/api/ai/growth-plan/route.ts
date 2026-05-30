import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstagramAPI } from "@/lib/instagram/api";
import { generateAnalysis } from "@/lib/ai/engine";
import { buildGrowthPlanPrompt } from "@/lib/ai/prompts";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { GrowthPlanData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const instagramId = request.cookies.get("sp_session")?.value;
    if (!instagramId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = await checkRateLimit(instagramId, "growth_plan");
    if (!rateLimit.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const usage = await checkUsage(instagramId, "reports");
    if (!usage.allowed) return NextResponse.json({ error: "Report limit reached", usage }, { status: 403 });

    const supabase = createAdminClient();
    const body = await request.json().catch(() => ({}));

    if (!body?.forceRefresh) {
      const { data: cached } = await supabase
        .from("reports").select("*")
        .eq("instagram_id", instagramId).eq("report_type", "growth_plan")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }).limit(1).single();
      if (cached) return NextResponse.json({ data: cached.data, cached: true });
    }

    const { data: account } = await supabase
      .from("instagram_accounts").select("*").eq("instagram_id", instagramId).single();
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const igApi = new InstagramAPI(account.access_token, account.instagram_id);
    const [profile, mediaWithInsights] = await Promise.all([
      igApi.getProfile(), igApi.getMediaWithInsights(30),
    ]);

    // Optionally include growth blockers context
    const { data: blockersReport } = await supabase
      .from("reports").select("data")
      .eq("instagram_id", instagramId).eq("report_type", "growth_blockers")
      .order("created_at", { ascending: false }).limit(1).single();

    const blockersContext = blockersReport
      ? JSON.stringify(blockersReport.data)
      : undefined;

    const prompt = buildGrowthPlanPrompt(profile, mediaWithInsights, blockersContext);
    const analysis = await generateAnalysis<GrowthPlanData>(prompt);

    await supabase.from("reports").insert({ instagram_id: instagramId, report_type: "growth_plan", data: analysis });
    await incrementUsage(instagramId, "reports");

    return NextResponse.json({ data: analysis, cached: false });
  } catch (error) {
    console.error("Growth plan error:", error);
    return NextResponse.json({ error: "Failed to generate growth plan" }, { status: 500 });
  }
}
