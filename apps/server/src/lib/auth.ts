
import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth.schema";


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:3000",
  ],
  
  emailAndPassword: {
    enabled: true,
  },
  
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, 
    updateAge: 60 * 60 * 24, 
  },
  
  advanced: {
    cookiePrefix: "phone-case",
    crossSubDomainCookies: {
      enabled: false, 
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true, 
    },
   
    generateId: () => crypto.randomUUID(),
  },

  rateLimit: {
    window: 60,
    max: 100,
  },
});

