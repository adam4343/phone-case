import generateRandomId from "@/lib/helpers";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./auth.schema";

export const color = sqliteTable("color", {
    id: text('id').primaryKey().$defaultFn(() => generateRandomId()),
    name: text('name').notNull(),
    hex: text('hex').notNull(),
    ...timestamps
})