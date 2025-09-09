import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps, user } from "./auth.schema";
import { phoneCase } from "./phone-case.schema";
import generateRandomId from "../../lib/helpers";

export const order = sqliteTable("order", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  price: integer("price").notNull(),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
  status: text("status", {enum: ["pending", "processing", "delivered", "cancelled"]}).notNull().default("pending"),
  stripeSessionId: text("stripe-session_id").notNull().unique(),

  phoneCaseId: text("phone-case_id").references(() => phoneCase.id),

  userId: text("user_id").references(() => user.id),

  shippingId: text("shipping_id").references(() => shippingAddress.id),

  billingId: text("billing_id").references(() => billingAddress.id),
  ...timestamps,
});

export const shippingAddress = sqliteTable("shippingAddress", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),

  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postalCode").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone").notNull(),
});

export const billingAddress = sqliteTable("shippingAddress", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),

  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postalCode").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone").notNull(),
});
