import generateRandomId from "@/lib/helpers";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps, user } from "./auth.schema";
import { color } from "./colors.schema";


export const phoneCase = sqliteTable("phone_case", {
  id: text("id").primaryKey(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  croppedImage: text("croppedImage").notNull(),
  totalPrice: integer("totalPrice").notNull(),

  userId: text("user_id").references(() => user.id),
  modelId: text("model_id").references(() => model.id),
  materialId: text("material_id").references(() => material.id),
  colorId: text("color_id").references(() => color.id),

  ...timestamps,
});

export const model = sqliteTable("model", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  ...timestamps,
});

export const material = sqliteTable("material", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateRandomId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  ...timestamps,
});
