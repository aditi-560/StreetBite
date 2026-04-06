import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { vendorsTable } from "./vendors";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents/paise
  category: text("category").notNull(), // main, side, drink, dessert
  emoji: text("emoji").notNull(),
  available: boolean("available").notNull().default(true),
  rating: real("rating").notNull().default(4.5),
  prepTime: integer("prep_time").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable, {
  vendorId: z.number().int().positive(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().int().positive("Price must be positive"),
  category: z.enum(["main", "side", "drink", "dessert"]),
  emoji: z.string().min(1),
  available: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  prepTime: z.number().int().positive("Prep time must be positive"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateMenuItemSchema = insertMenuItemSchema.partial().omit({ vendorId: true });

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;
