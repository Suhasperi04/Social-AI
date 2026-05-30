import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstagramAPI, fetchPublicProfile } from "@/lib/instagram/api";
import { generateAnalysis } from "@/lib/ai/engine";
import { buildCompetitorAnalysisPrompt } from "@/lib/ai/prompts";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { competitorSchema } from "@/lib/validations/schemas";
import { CompetitorAnalysisData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const instagramId = request.cookies.get("sp_session")?.value;
    if (!instagramId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = await checkRateLimit(instagramId, "competitor_analyze");
    if (!rateLimit.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const usage = await checkUsage(instagramId, "competitor_analyses");
    if (!usage.allowed) return NextResponse.json({ error: "Competitor analysis limit reached", usage }, { status: 403 });

    const body = await request.json();
    const parsed = competitorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid username", details: parsed.error.flatten() }, { status: 400 });
    }

    const { username } = parsed.data;
    const supabase = createAdminClient();

    // Get user account
    const { data: account } = await supabase
      .from("instagram_accounts").select("*").eq("instagram_id", instagramId).single();
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Fetch competitor data via business discovery
    const competitorData = await fetchPublicProfile(username, account.access_token, account.instagram_id);
    if (!competitorData) {
      return NextResponse.json(
        { error: "Could not fetch competitor data. Make sure the account is a Business or Creator account." },
        { status: 404 }
      );
    }

    // Get user profile for comparison
    const igApi = new InstagramAPI(account.access_token, account.instagram_id);
    const userProfile = await igApi.getProfile();

    // Generate AI comparison
    const prompt = buildCompetitorAnalysisPrompt(userProfile, competitorData);
    const analysis = await generateAnalysis<CompetitorAnalysisData>(prompt);

    // Save competitor record
    await supabase.from("competitors").upsert({
      instagram_id: instagramId,
      competitor_username: username,
      competitor_data: competitorData,
      analyzed_at: new Date().toISOString(),
    }, { onConflict: "instagram_id,competitor_username" });

    await incrementUsage(instagramId, "competitor_analyses");

    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze competitor" }, { status: 500 });
  }
}
