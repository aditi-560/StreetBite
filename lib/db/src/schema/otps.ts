import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const otpsTable = pgTable("otps", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: text("verified").notNull().default("false"), // "true" or "false" as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpSchema = createInsertSchema(otpsTable, {
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  expiresAt: z.date(),
}).omit({ id: true, verified: true, createdAt: true });

export type Otp = typeof otpsTable.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
