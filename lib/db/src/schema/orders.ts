import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { vendorsTable } from "./vendors";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  tokenNumber: integer("token_number").notNull(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id, { onDelete: "cascade" }),
  customerId: text("customer_id"), // Optional: for tracking customer orders
  items: jsonb("items").notNull(), // Array of { menuItemId, name, price, quantity }
  status: text("status").notNull().default("pending"), // pending, preparing, ready, delivered
  total: integer("total").notNull(), // in cents/paise
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const orderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  name: z.string(),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const insertOrderSchema = createInsertSchema(ordersTable, {
  tokenNumber: z.number().int().positive(),
  vendorId: z.number().int().positive(),
  customerId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  status: z.enum(["pending", "preparing", "ready", "delivered"]).optional(),
  total: z.number().int().positive("Total must be positive"),
  estimatedTime: z.number().int().positive(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "delivered"]),
});

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
