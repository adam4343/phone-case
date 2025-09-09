import { user } from "./../db/schema/auth.schema";
import { db } from "@/db";
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { Router } from "express";
import z from "zod";
import { eq } from "drizzle-orm";
import { phoneCase } from "@/db/schema/phone-case.schema";
import {
  billingAddress,
  order,
  shippingAddress,
} from "@/db/schema/order.schema";
import authenticateUser from "@/middlewares/auth.middleware";
import { getUser } from "@/lib/helpers/getUser";
import "dotenv/config";
import { stripe } from "@/lib/stripe";
import express from "express";
import Stripe from "stripe"; 

const configIdSchema = z.object({
  configId: z.string().min(1, "Configuration id is required"),
});

export const orderRouter = Router();

orderRouter.post("/checkout", authenticateUser, async (req, res) => {
  try {
    const user = getUser(req); 
    const response = configIdSchema.safeParse(req.body);

    if (!response.success) {
      return res
        .status(400)
        .json({ error: getErrorMessage(response.error.issues) });
    }

    const { configId } = response.data;

    const [phoneCaseRecord] = await db
      .select()
      .from(phoneCase)
      .where(eq(phoneCase.id, configId));

    if (!phoneCaseRecord) {
      return res
        .status(400)
        .json({ error: "Phone case with this ID does not exist." });
    }

    const unitAmount = Math.round(phoneCaseRecord.price * 100);

    const product = await stripe.products.create({
      name: "Custom iPhone Case",
      images: [phoneCaseRecord.image],
      default_price_data: {
        currency: "usd",
        unit_amount: unitAmount,
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.CORS_ORIGIN}/thank-you?session_id={CHECKOUT_SESSION_ID}`, 
      cancel_url: `${process.env.CORS_ORIGIN}/configure/preview?id=${phoneCaseRecord.id}`,
      payment_method_types: ["card"],
      mode: "payment",
      shipping_address_collection: { allowed_countries: ["BG", "US"] },
      metadata: {
        userId: user.id,
        phoneCaseId: phoneCaseRecord.id,
      },
      line_items: [{ price: product.default_price as string, quantity: 1 }],
    });

    return res.json({ url: stripeSession.url });
  } catch (e) {
    console.error("Checkout error:", e);
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

orderRouter.post(
  "/webhook", 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    console.log("🔥 WEBHOOK CALLED!"); 
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

    if (!sig) {
      console.log("❌ No signature header");
      return res.status(400).send("No signature header");
    }

    if (!endpointSecret) {
      console.log("❌ No webhook secret configured");
      return res.status(500).send("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook signature verified");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log(`❌ Webhook signature verification failed:`, errorMessage);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Payment succeeded for session:", session.id);

      try {
        if (!session.metadata) {
          console.error("❌ No metadata found in session");
          return res.status(400).json({ error: "No metadata found" });
        }

        const userId = session.metadata.userId;
        const phoneCaseId = session.metadata.phoneCaseId;

        if (!userId || !phoneCaseId) {
          console.error("❌ Missing userId or phoneCaseId in metadata");
          return res.status(400).json({ error: "Missing required metadata" });
        }

        console.log("Creating order for user:", userId, "phoneCase:", phoneCaseId);

        const [phoneCaseRecord] = await db
          .select()
          .from(phoneCase)
          .where(eq(phoneCase.id, phoneCaseId));

        if (!phoneCaseRecord) {
          console.error("❌ Phone case not found:", phoneCaseId);
          return res.status(400).json({ error: "Phone case not found" });
        }

        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['customer_details']
        });

        await db.transaction(async (tx) => {
          const customerName = fullSession.customer_details?.name || "Unknown";
          const customerAddress = fullSession.customer_details?.address;
          const customerPhone = fullSession.customer_details?.phone || "";

          const [createdShippingAddress] = await tx
            .insert(shippingAddress)
            .values({
              name: customerName,
              street: customerAddress?.line1 || "Unknown",
              city: customerAddress?.city || "Unknown",
              postalCode: customerAddress?.postal_code || "Unknown",
              country: customerAddress?.country || "Unknown",
              phoneNumber: customerPhone,
            })
            .returning();

          const [createdBillingAddress] = await tx
            .insert(billingAddress)
            .values({
              name: customerName,
              street: customerAddress?.line1 || "Unknown",
              city: customerAddress?.city || "Unknown", 
              postalCode: customerAddress?.postal_code || "Unknown",
              country: customerAddress?.country || "Unknown",
              phoneNumber: customerPhone,
            })
            .returning();

          const [createdOrder] = await tx
            .insert(order)
            .values({
              userId: userId,
              phoneCaseId: phoneCaseRecord.id,
              shippingId: createdShippingAddress.id,
              billingId: createdBillingAddress.id,
              price: phoneCaseRecord.price,
              isPaid: true, 
              stripeSessionId: session.id, 
            })
            .returning();

          console.log("✅ Order created successfully:", createdOrder.id);
        });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Error creating order from webhook:", errorMessage);
      }
    } else {
      console.log("Unhandled webhook event type:", event.type);
    }

    res.json({ received: true });
  }
);

orderRouter.get("/by-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.stripeSessionId, sessionId));

    if (!existingOrder) {
      return res
        .status(404)
        .json({ error: "Order not found" });
    }

    console.log(existingOrder)

    return res.json({ data: existingOrder });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error("Order fetch error:", errorMessage);
    res.status(500).json({ error: getErrorMessage(e) });
  }
});