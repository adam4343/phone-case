import { db } from "@/db";
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { Router } from "express";
import z from "zod";
import { desc,eq } from "drizzle-orm";
import { material, model, phoneCase } from "@/db/schema/phone-case.schema";
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
import { color } from "@/db/schema/colors.schema";

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
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig) {
        return res.status(400).json({ error: "No signature header" });
      }

      if (!endpointSecret) {
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      let event;

      try {
        event = await stripe.webhooks.constructEventAsync(req.body, sig, endpointSecret);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
          if (!session.metadata) {
            return res.status(200).json({ received: true, error: "No metadata found" });
          }

          const userId = session.metadata.userId;
          const phoneCaseId = session.metadata.phoneCaseId;

          if (!userId || !phoneCaseId) {
            return res.status(200).json({ received: true, error: "Missing required metadata" });
          }

          const [phoneCaseRecord] = await db
            .select()
            .from(phoneCase)
            .where(eq(phoneCase.id, phoneCaseId));

          if (!phoneCaseRecord) {
            return res.status(200).json({ received: true, error: "Phone case not found" });
          }

          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['customer_details']
          });

          const [existingOrder] = await db
            .select()
            .from(order)
            .where(eq(order.stripeSessionId, session.id));

          if (existingOrder) {
            return res.status(200).json({ received: true, message: "Order already processed" });
          }

          await db.transaction(async (tx) => {
            const customerName = fullSession.customer_details?.name || "Unknown Customer";
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
                price: Math.round(phoneCaseRecord.price * 100),
                isPaid: true, 
                stripeSessionId: session.id, 
              })
              .returning();
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return res.status(200).json({ 
            received: true, 
            error: errorMessage,
            session_id: session.id 
          });
        }
      }

      return res.status(200).json({ received: true, event_type: event.type });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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

    return res.json({ url: stripeSession.url });
  } catch (e) {
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

orderRouter.get("/by-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [existingOrder] = await db
      .select({
        id: order.id,
        price: order.price,
        isPaid: order.isPaid,
        status: order.status,
        stripeSessionId: order.stripeSessionId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        phoneCase: {
          id: phoneCase.id,
          image: phoneCase.image,
          croppedImage: phoneCase.croppedImage,
        },
        color: {
          hex: color.hex,
          name: color.name,
        },
        model: {
          name: model.name,
        },
        material: {
          name: material.name,
        },
        shippingAddress: {
          name: shippingAddress.name,
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phoneNumber: shippingAddress.phoneNumber,
        },
        billingAddress: {
          name: billingAddress.name,
          street: billingAddress.street,
          city: billingAddress.city,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
          phoneNumber: billingAddress.phoneNumber,
        },
      })
      .from(order)
      .leftJoin(phoneCase, eq(order.phoneCaseId, phoneCase.id))
      .leftJoin(color, eq(phoneCase.colorId, color.id))
      .leftJoin(model, eq(phoneCase.modelId, model.id))
      .leftJoin(material, eq(phoneCase.materialId, material.id))
      .leftJoin(shippingAddress, eq(order.shippingId, shippingAddress.id))
      .leftJoin(billingAddress, eq(order.billingId, billingAddress.id))
      .where(eq(order.stripeSessionId, sessionId));

    if (!existingOrder) {
      return res
        .status(404)
        .json({ error: "Order not found", session_id: sessionId });
    }


    const responseData = {
      id: existingOrder.id,
      price: existingOrder.price,
      isPaid: existingOrder.isPaid,
      status: existingOrder.status,
      stripeSessionId: existingOrder.stripeSessionId,
      createdAt: existingOrder.createdAt,
      updatedAt: existingOrder.updatedAt,
      phoneCase: {
        ...existingOrder.phoneCase,
        color: existingOrder.color,
        model: existingOrder.model,
        material: existingOrder.material,
      },
      shippingAddress: existingOrder.shippingAddress,
      billingAddress: existingOrder.billingAddress,
    };

    return res.json({ data: responseData });
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ error: getErrorMessage(e) });
  }
});

orderRouter.get("/dashboard", async (req, res) => {
  try {
    const orders = await db
      .select({
        id: order.id,
        price: order.price,
        isPaid: order.isPaid,
        status: order.status,
        stripeSessionId: order.stripeSessionId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        phoneCase: {
          id: phoneCase.id,
          image: phoneCase.image,
          croppedImage: phoneCase.croppedImage,
        },
        color: {
          hex: color.hex,
          name: color.name,
        },
        model: {
          name: model.name,
        },
        material: {
          name: material.name,
        },
        shippingAddress: {
          name: shippingAddress.name,
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phoneNumber: shippingAddress.phoneNumber,
        },
        billingAddress: {
          name: billingAddress.name,
          street: billingAddress.street,
          city: billingAddress.city,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
          phoneNumber: billingAddress.phoneNumber,
        },
      })
      .from(order)
      .leftJoin(phoneCase, eq(order.phoneCaseId, phoneCase.id))
      .leftJoin(color, eq(phoneCase.colorId, color.id))
      .leftJoin(model, eq(phoneCase.modelId, model.id))
      .leftJoin(material, eq(phoneCase.materialId, material.id))
      .leftJoin(shippingAddress, eq(order.shippingId, shippingAddress.id))
      .leftJoin(billingAddress, eq(order.billingId, billingAddress.id))
      .orderBy(desc(order.createdAt));

    const transformedOrders = orders.map(orderData => ({
      id: orderData.id,
      price: orderData.price,
      isPaid: orderData.isPaid,
      status: orderData.status,
      stripeSessionId: orderData.stripeSessionId,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      phoneCase: {
        ...orderData.phoneCase,
        color: orderData.color,
        model: orderData.model,
        material: orderData.material,
      },
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
    }));

    return res.json({ 
      data: transformedOrders,
      total: transformedOrders.length 
    });
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ error: getErrorMessage(e) });
  }
});