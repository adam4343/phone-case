import generateRandomId from "@/lib/helpers";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps, user } from "./auth.schema";

export const phoneCase = sqliteTable("phone_case", {
    id: text("id").primaryKey(),
    price: integer("price").notNull(),
    image: text("image").notNull(),
    width: integer("width").notNull(),
    height: integer("width").notNull(),
    croppedImage: text("croppedImage").notNull(),
    
    userId: text("user_id").references(() => user.id),
    modelId: text("model_id").notNull(),
    materialId: text("material_id").notNull(),
    finishId: text("finish_id").notNull(),
  
    ...timestamps,
  });
  
  export const model = sqliteTable("model", {
    id: text("id").primaryKey().$defaultFn(() => generateRandomId()),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  });
  
  export const material = sqliteTable("material", {
    id: text("id").primaryKey().$defaultFn(() => generateRandomId()),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  });
  
  export const finish = sqliteTable("finish", {
    id: text("id").primaryKey().$defaultFn(() => generateRandomId()),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  });
  