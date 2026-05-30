import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstagramAPI } from "@/lib/instagram/api";
import { generateAnalysis } from "@/lib/ai/engine";
import { buildProfileAnalysisPrompt } from "@/lib/ai/prompts";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { ProfileAnalysisData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const instagramId = request.cookies.get("sp_session")?.value;
    if (!instagramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(instagramId, "profile_analysis");
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const usage = await checkUsage(instagramId, "reports");
    if (!usage.allowed) {
      return NextResponse.json({ error: "Report limit reached", usage }, { status: 403 });
    }

    const supabase = createAdminClient();
    const body = await request.json().catch(() => ({}));

    if (!body?.forceRefresh) {
      const { data: cached } = await supabase
        .from("reports")
        .select("*")
        .eq("instagram_id", instagramId)
        .eq("report_type", "profile_analysis")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (cached) return NextResponse.json({ data: cached.data, cached: true });
    }

    const { data: account } = await supabase
      .from("instagram_accounts")
      .select("*")
      .eq("instagram_id", instagramId)
      .single();

    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const igApi = new InstagramAPI(account.access_token, account.instagram_id);
    const profile = await igApi.getProfile();

    const prompt = buildProfileAnalysisPrompt(profile);
    const analysis = await generateAnalysis<ProfileAnalysisData>(prompt);

    await supabase.from("reports").insert({
      instagram_id: instagramId,
      report_type: "profile_analysis",
      data: analysis,
    });
    await incrementUsage(instagramId, "reports");

    return NextResponse.json({ data: analysis, cached: false });
  } catch (error) {
    console.error("Profile analysis error:", error);
    return NextResponse.json({ error: "Failed to generate profile analysis" }, { status: 500 });
  }
}
