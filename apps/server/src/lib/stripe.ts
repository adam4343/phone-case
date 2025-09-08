import Stripe from "stripe";
import "dotenv/config";

export const stripe = new Stripe(process.env.STRIPE_SECRET ?? "", {
  apiVersion: "2025-07-30.basil", 
  typescript: true
});
