import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull().default([]),
  badge: text("badge"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  isNew: boolean("is_new").notNull().default(false),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  colors: text("colors").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type DbProduct = typeof productsTable.$inferSelect;
