import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle user denial
  if (error) {
    return NextResponse.redirect(`${appUrl}?error=access_denied`);
  }

  if (!code || !state) {
    console.error("Missing code or state! Full URL:", request.url);
    return NextResponse.redirect(`${appUrl}?error=invalid_callback`);
  }

  // Verify CSRF state
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}?error=invalid_state`);
  }

  try {
    // Step 1: Exchange code for Facebook User Token
    const tokenResponse = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
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

    // Step 2: Exchange for long-lived Facebook User Token
    const longTokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
    );

    if (!longTokenResponse.ok) {
      console.error("Long token failed:", await longTokenResponse.text());
      return NextResponse.redirect(`${appUrl}?error=long_token_failed`);
    }

    const longTokenData = await longTokenResponse.json();
    const longLivedToken = longTokenData.access_token;

    // Step 3: Find linked Instagram Business Account
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account,name,access_token&access_token=${longLivedToken}`
    );

    if (!accountsResponse.ok) {
      console.error("Accounts fetch failed:", await accountsResponse.text());
      return NextResponse.redirect(`${appUrl}?error=accounts_fetch_failed`);
    }

    const accountsData = await accountsResponse.json();
    
    // Find the first page that has an instagram_business_account linked
    const pageWithIg = accountsData.data?.find(
      (page: any) => page.instagram_business_account
    );

    if (!pageWithIg) {
      return NextResponse.redirect(`${appUrl}?error=no_instagram_professional_account_found`);
    }

    const instagramId = pageWithIg.instagram_business_account.id;
    const pageAccessToken = pageWithIg.access_token; // Permanent page token

    // Step 4: Fetch Instagram Profile via Graph API
    const profileResponse = await fetch(
      `https://graph.facebook.com/v19.0/${instagramId}?fields=id,username,profile_picture_url,followers_count,follows_count,media_count,name,biography&access_token=${pageAccessToken}`
    );

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", await profileResponse.text());
      return NextResponse.redirect(`${appUrl}?error=profile_fetch_failed`);
    }

    const profile = await profileResponse.json();

    // Step 5: Check database & upsert
    const supabase = createAdminClient();
    // Facebook Page tokens generated from long-lived user tokens do not expire
    const tokenExpiresAt = new Date(Date.now() + 5184000 * 1000).toISOString(); 

    const { data: existingAccount } = await supabase
      .from("instagram_accounts")
      .select("*")
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
          account_type: "business",
          access_token: pageAccessToken,
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
        account_type: "business",
        access_token: pageAccessToken,
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

    // Step 6: Set session cookie
    const response = NextResponse.redirect(`${appUrl}/dashboard`);

    response.cookies.set("sp_session", instagramId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}?error=server_error`);
  }
}
