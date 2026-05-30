import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("sp_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode the session cookie to get the instagram_id
    const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
    const instagramId = decoded.ig_user_id;

    if (!instagramId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify user exists and check if they are already pro
    const { data: account, error: accountError } = await supabase
      .from("instagram_accounts")
      .select("*")
      .eq("instagram_id", instagramId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (account.plan === "pro") {
      return NextResponse.json({ error: "You are already on the Pro plan!" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=canceled`,
      client_reference_id: instagramId, // Securely ties this checkout back to our user
      metadata: {
        instagram_id: instagramId,
      },
      // If we already have a stripe_customer_id saved for this user, pass it in
      ...(account.stripe_customer_id && { customer: account.stripe_customer_id }),
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Checkout session");
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate checkout" }, { status: 500 });
  }
}
