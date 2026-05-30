import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function handleDisconnect(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = req.cookies.get("sp_session")?.value;

  if (session) {
    try {
      // Decode the session cookie to find which user is disconnecting
      const decoded = JSON.parse(Buffer.from(session, "base64").toString("utf-8"));
      const igUserId = decoded.ig_user_id;

      if (igUserId) {
        const supabase = createAdminClient();
        
        // Remove the access token so we can no longer access their Meta data, 
        // but KEEP their account row and usage logs to prevent free-tier abuse.
        await supabase
          .from("instagram_accounts")
          .update({ access_token: null })
          .eq("instagram_id", igUserId);
        
        console.log(`[Security] Revoked access token for user: ${igUserId} (Usage logs retained)`);
      }
    } catch (e) {
      console.error("Failed to parse session or delete user data:", e);
    }
  }

  // Clear the cookie and redirect to the landing page
  const response = NextResponse.redirect(appUrl);
  response.cookies.set("sp_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function POST(req: NextRequest) {
  return handleDisconnect(req);
}

export async function GET(req: NextRequest) {
  return handleDisconnect(req);
}
