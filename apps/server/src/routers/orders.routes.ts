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


orderRouter.post("/webhook", 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');
    
    try {
      console.log("🔥 WEBHOOK CALLED!");
      console.log("📊 Request method:", req.method);
      console.log("📋 Headers received:", JSON.stringify(req.headers, null, 2));
      console.log("📦 Body type:", typeof req.body);
      console.log("📏 Body length:", req.body ? req.body.length : 0);
      
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig) {
        console.log("❌ No signature header");
        return res.status(400).json({ error: "No signature header" });
      }

      if (!endpointSecret) {
        console.log("❌ No webhook secret configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      let event;

      try {
        event = await stripe.webhooks.constructEventAsync(req.body, sig, endpointSecret);
        console.log("✅ Webhook signature verified");
        console.log("📦 Event type received:", event.type);
        console.log("🆔 Event ID:", event.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`❌ Webhook signature verification failed:`, errorMessage);
        return res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log("💳 Processing payment success for session:", session.id);
        console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));

        try {
          if (!session.metadata) {
            console.error("❌ No metadata found in session");
            return res.status(200).json({ received: true, error: "No metadata found" });
          }

          const userId = session.metadata.userId;
          const phoneCaseId = session.metadata.phoneCaseId;

          if (!userId || !phoneCaseId) {
            console.error("❌ Missing userId or phoneCaseId in metadata");
            console.error("📋 Available metadata:", session.metadata);
            return res.status(200).json({ received: true, error: "Missing required metadata" });
          }

          console.log("👤 Creating order for user:", userId, "phoneCase:", phoneCaseId);

          const [phoneCaseRecord] = await db
            .select()
            .from(phoneCase)
            .where(eq(phoneCase.id, phoneCaseId));

          if (!phoneCaseRecord) {
            console.error("❌ Phone case not found:", phoneCaseId);
            return res.status(200).json({ received: true, error: "Phone case not found" });
          }

          console.log("📱 Phone case found:", phoneCaseRecord.id, "Price:", phoneCaseRecord.price);

          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['customer_details']
          });

          console.log("👤 Customer details:", JSON.stringify(fullSession.customer_details, null, 2));

          const [existingOrder] = await db
            .select()
            .from(order)
            .where(eq(order.stripeSessionId, session.id));

          if (existingOrder) {
            console.log("⚠️ Order already exists for session:", session.id);
            return res.status(200).json({ received: true, message: "Order already processed" });
          }

          console.log("🔄 Starting database transaction");
          
          await db.transaction(async (tx) => {
            const customerName = fullSession.customer_details?.name || "Unknown Customer";
            const customerAddress = fullSession.customer_details?.address;
            const customerPhone = fullSession.customer_details?.phone || "";

            console.log("🏠 Creating shipping address for:", customerName);
            
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

            console.log("✅ Shipping address created:", createdShippingAddress.id);

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

            console.log("✅ Billing address created:", createdBillingAddress.id);

            const [createdOrder] = await tx
              .insert(order)
              .values({
                userId: userId,
                phoneCaseId: phoneCaseRecord.id,
                shippingId: createdShippingAddress.id,
                billingId: createdBillingAddress.id,
                price: Math.round(phoneCaseRecord.price * 100), 
                isPaid: true, 
                stripeSessionId: session.id, 
              })
              .returning();

            console.log("✅ Order created successfully:", createdOrder.id);
            console.log("💰 Order details:", JSON.stringify(createdOrder, null, 2));
          });

          console.log("🎉 Transaction completed successfully");

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("❌ Error creating order from webhook:", errorMessage);
          console.error("🔍 Full error stack:", error instanceof Error ? error.stack : error);
          
          return res.status(200).json({ 
            received: true, 
            error: errorMessage,
            session_id: session.id 
          });
        }
      } else {
        console.log("❓ Unhandled webhook event type:", event.type);
      }

      return res.status(200).json({ received: true, event_type: event.type });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("💥 Fatal webhook error:", errorMessage);
      console.error("🔍 Full error stack:", error instanceof Error ? error.stack : error);
      
      return res.status(200).json({ 
        received: true, 
        error: errorMessage 
      });
    }
  }
);

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

    const priceId = product.default_price;
    if (!priceId) {
      throw new Error("Failed to create product price");
    }

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
      line_items: [{ price: priceId as string, quantity: 1 }],
    });

    console.log("🛒 Checkout session created:", stripeSession.id);
    console.log("📋 Session metadata:", JSON.stringify(stripeSession.metadata, null, 2));

    return res.json({ url: stripeSession.url });
  } catch (e) {
    console.error("💥 Checkout error:", e);
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

orderRouter.get("/by-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log("🔍 Looking for order with session ID:", sessionId);

    const [existingOrder] = await db
      .select()
      .from(order)
      .where(eq(order.stripeSessionId, sessionId));

    if (!existingOrder) {
      console.log("❌ Order not found for session:", sessionId);
      
      const allOrders = await db.select().from(order).limit(5);
      console.log("📊 Recent orders in database:", allOrders.length);
      if (allOrders.length > 0) {
        console.log("📋 Sample order session IDs:", allOrders.map(o => o.stripeSessionId));
      }
      
      return res
        .status(404)
        .json({ error: "Order not found", session_id: sessionId });
    }

    console.log("✅ Order found:", existingOrder.id);
    return res.json({ data: existingOrder });
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error("💥 Order fetch error:", errorMessage);
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

orderRouter.get("/webhook-test", (req, res) => {
  res.json({ 
    message: "Webhook endpoint is reachable",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});
