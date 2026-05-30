import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const instagramId = request.cookies.get("sp_session")?.value;
    if (!instagramId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    const [accountResult, usageResult] = await Promise.all([
      supabase
        .from("instagram_accounts")
        .select("id,instagram_id,username,full_name,profile_picture_url,biography,followers_count,following_count,media_count,account_type,plan,trial_used,created_at,last_login,updated_at,stripe_customer_id,stripe_subscription_id")
        .eq("instagram_id", instagramId)
        .single(),
      supabase.from("usage").select("*").eq("instagram_id", instagramId).single(),
    ]);

    if (!accountResult.data) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    return NextResponse.json({
      account: accountResult.data,
      usage: usageResult.data,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 });
  }
}
