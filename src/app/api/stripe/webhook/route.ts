import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed:`, error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // This is the instagram_id we passed during checkout creation
        const instagramId = session.client_reference_id || session.metadata?.instagram_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!instagramId) {
          console.error("No instagramId found in session metadata");
          break;
        }

        console.log(`[Stripe] Checkout completed for user: ${instagramId}`);

        // Upgrade the user to Pro and save their Stripe Customer ID
        await supabase
          .from("instagram_accounts")
          .update({
            plan: "pro",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("instagram_id", instagramId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`[Stripe] Subscription deleted for customer: ${customerId}`);

        // Downgrade the user back to Free
        await supabase
          .from("instagram_accounts")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook Processing Error]:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
