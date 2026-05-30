import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}?error=access_denied`);
  }

  if (!code || !state) {
    console.error("Missing code or state! Full URL:", request.url);
    return NextResponse.redirect(`${appUrl}?error=invalid_callback`);
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}?error=invalid_state`);
  }

  try {
    // Step 1: Exchange code for short-lived Instagram User Token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: process.env.META_REDIRECT_URI!,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;
    const instagramId = String(tokenData.user_id);

    // Step 2: Exchange for long-lived Instagram User Token (valid 60 days)
    const longTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.META_APP_SECRET}&access_token=${shortLivedToken}`
    );

    if (!longTokenResponse.ok) {
      console.error("Long token failed:", await longTokenResponse.text());
      return NextResponse.redirect(`${appUrl}?error=long_token_failed`);
    }

    const longTokenData = await longTokenResponse.json();
    const longLivedToken = longTokenData.access_token;
    // Long-lived tokens expire in 60 days
    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    // Step 3: Fetch Instagram profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/v22.0/${instagramId}?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,account_type&access_token=${longLivedToken}`
    );

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", await profileResponse.text());
      return NextResponse.redirect(`${appUrl}?error=profile_fetch_failed`);
    }

    const profile = await profileResponse.json();

    // Step 4: Upsert into database
    const supabase = createAdminClient();

    const { data: existingAccount } = await supabase
      .from("instagram_accounts")
      .select("id")
      .eq("instagram_id", instagramId)
      .single();

    if (existingAccount) {
      await supabase
        .from("instagram_accounts")
        .update({
          username: profile.username,
          full_name: profile.name || profile.username,
          profile_picture_url: profile.profile_picture_url || "",
          biography: profile.biography || "",
          followers_count: profile.followers_count || 0,
          following_count: profile.follows_count || 0,
          media_count: profile.media_count || 0,
          account_type: profile.account_type?.toUpperCase() || "BUSINESS",
          access_token: longLivedToken,
          token_expires_at: tokenExpiresAt,
          last_login: new Date().toISOString(),
        })
        .eq("instagram_id", instagramId);
    } else {
      await supabase.from("instagram_accounts").insert({
        instagram_id: instagramId,
        username: profile.username,
        full_name: profile.name || profile.username,
        profile_picture_url: profile.profile_picture_url || "",
        biography: profile.biography || "",
        followers_count: profile.followers_count || 0,
        following_count: profile.follows_count || 0,
        media_count: profile.media_count || 0,
        account_type: profile.account_type?.toUpperCase() || "BUSINESS",
        access_token: longLivedToken,
        token_expires_at: tokenExpiresAt,
        plan: "free",
        trial_used: false,
      });

      await supabase.from("usage").insert({
        instagram_id: instagramId,
        reports_used: 0,
        competitor_analyses_used: 0,
        ideas_used: 0,
      });
    }

    // Step 5: Set session cookie and redirect to dashboard
    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set("sp_session", instagramId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}?error=server_error`);
  }
}
