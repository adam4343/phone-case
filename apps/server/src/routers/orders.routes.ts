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
import express from "express"; // ← Add this import

const configIdSchema = z.object({
  configId: z.string().min(1, "Configuration id is required"),
});

export const orderRouter = Router();

// Your existing checkout route stays the same
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
      success_url: `${process.env.CORS_ORIGIN}/thank-you?session_id={CHECKOUT_SESSION_ID}`, // ← Changed this
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

// 🎯 NEW: Webhook route - ADD THIS
// orderRouter.post(
//   "/webhook", 
//   express.raw({ type: 'application/json' }), // ← Important: raw body needed for Stripe signature verification
//   async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // ← You'll need to add this to your .env

//     let event;

//     try {
//       // Verify this request actually came from Stripe
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       console.log("✅ Webhook signature verified");
//     } catch (err) {
//       console.log(`❌ Webhook signature verification failed:`, err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the checkout.session.completed event
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       console.log("💳 Payment succeeded for session:", session.id);

//       try {
//         // Get the metadata we stored when creating the checkout session
//         const { userId, phoneCaseId } = session.metadata;

//         console.log("Creating order for user:", userId, "phoneCase:", phoneCaseId);

//         // Get phone case details
//         const [phoneCaseRecord] = await db
//           .select()
//           .from(phoneCase)
//           .where(eq(phoneCase.id, phoneCaseId));

//         if (!phoneCaseRecord) {
//           console.error("❌ Phone case not found:", phoneCaseId);
//           return res.status(400).json({ error: "Phone case not found" });
//         }

//         // Create the order and addresses in a transaction
//         await db.transaction(async (tx) => {
//           // Create shipping address from Stripe checkout data
//           const [createdShippingAddress] = await tx
//             .insert(shippingAddress)
//             .values({
//               name: session.shipping_details?.name || session.customer_details?.name || "Unknown",
//               street: session.shipping_details?.address?.line1 || session.customer_details?.address?.line1 || "Unknown",
//               city: session.shipping_details?.address?.city || session.customer_details?.address?.city || "Unknown",
//               postalCode: session.shipping_details?.address?.postal_code || session.customer_details?.address?.postal_code || "Unknown",
//               country: session.shipping_details?.address?.country || session.customer_details?.address?.country || "Unknown",
//               phoneNumber: session.customer_details?.phone || "",
//             })
//             .returning();

//           // Create billing address from Stripe checkout data  
//           const [createdBillingAddress] = await tx
//             .insert(billingAddress)
//             .values({
//               name: session.customer_details?.name || "Unknown",
//               street: session.customer_details?.address?.line1 || "Unknown",
//               city: session.customer_details?.address?.city || "Unknown", 
//               postalCode: session.customer_details?.address?.postal_code || "Unknown",
//               country: session.customer_details?.address?.country || "Unknown",
//               phoneNumber: session.customer_details?.phone || "",
//             })
//             .returning();

//           // Create the order - this is the most important part!
//           const [createdOrder] = await tx
//             .insert(order)
//             .values({
//               userId: userId,
//               phoneCaseId: phoneCaseRecord.id,
//               shippingId: createdShippingAddress.id,
//               billingId: createdBillingAddress.id,
//               price: phoneCaseRecord.price,
//               isPaid: true, // ← We know it's paid because webhook fired!
//               stripeSessionId: session.id, // ← Store this so we can find the order later
//             })
//             .returning();

//           console.log("✅ Order created successfully:", createdOrder.id);
//         });

//       } catch (error) {
//         console.error("❌ Error creating order from webhook:", error);
//         // Don't return error response - Stripe will retry the webhook
//         // Just log it and return success so Stripe doesn't keep retrying
//       }
//     } else {
//       console.log("Unhandled webhook event type:", event.type);
//     }

//     // Always return success to Stripe
//     res.json({ received: true });
//   }
// );

// Update your existing get route to use session ID instead of configId
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

    return res.json({ data: existingOrder });
  } catch (e) {
    console.error("Order fetch error:", e);
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

// Remove your old POST "/" route since we don't need it anymore