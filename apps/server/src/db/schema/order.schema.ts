import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps, user } from "./auth.schema";
import { phoneCase } from "./phone-case.schema";
import generateRandomId from "../../lib/helpers";

export const shippingAddress = sqliteTable("shipping_address", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone_number").notNull(),
});

export const billingAddress = sqliteTable("billing_address", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone_number").notNull(),
});

export const order = sqliteTable("order", {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  price: integer("price").notNull(),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
  status: text("status", {
    enum: ["pending", "processing", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  phoneCaseId: text("phone_case_id").references(() => phoneCase.id),
  userId: text("user_id").references(() => user.id),
  shippingId: text("shipping_id").references(() => shippingAddress.id),
  billingId: text("billing_id").references(() => billingAddress.id),
  ...timestamps,
});
