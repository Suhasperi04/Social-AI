import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstagramAPI } from "@/lib/instagram/api";
import { generateAnalysis } from "@/lib/ai/engine";
import { buildContentIdeasPrompt } from "@/lib/ai/prompts";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";
import { ContentIdeasData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const instagramId = request.cookies.get("sp_session")?.value;
    if (!instagramId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = await checkRateLimit(instagramId, "content_ideas");
    if (!rateLimit.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const usage = await checkUsage(instagramId, "ideas");
    if (!usage.allowed) return NextResponse.json({ error: "Idea limit reached", usage }, { status: 403 });

    const supabase = createAdminClient();
    const body = await request.json().catch(() => ({}));

    if (!body?.forceRefresh) {
      const { data: cached } = await supabase
        .from("reports").select("*")
        .eq("instagram_id", instagramId).eq("report_type", "content_ideas")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }).limit(1).single();
      if (cached) return NextResponse.json({ data: cached.data, cached: true });
    }

    const { data: account } = await supabase
      .from("instagram_accounts").select("*").eq("instagram_id", instagramId).single();
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const igApi = new InstagramAPI(account.access_token, account.instagram_id);
    const [profile, media] = await Promise.all([
      igApi.getProfile(), igApi.getMedia(20),
    ]);

    const prompt = buildContentIdeasPrompt(profile, media);
    const analysis = await generateAnalysis<ContentIdeasData>(prompt);

    await supabase.from("reports").insert({ instagram_id: instagramId, report_type: "content_ideas", data: analysis });
    await incrementUsage(instagramId, "ideas");

    return NextResponse.json({ data: analysis, cached: false });
  } catch (error) {
    console.error("Content ideas error:", error);
    return NextResponse.json({ error: "Failed to generate content ideas" }, { status: 500 });
  }
}
