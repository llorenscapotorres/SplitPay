import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tables = pgTable("tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: integer("number").notNull(),
  restaurantName: text("restaurant_name").notNull(),
  qrCode: text("qr_code").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paid: decimal("paid", { precision: 10, scale: 2 }).default("0"),
  remaining: decimal("remaining", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("unpaid"), // 'unpaid', 'partial', 'paid'
  guestCount: integer("guest_count").default(1),
  startTime: timestamp("start_time").default(sql`now()`),
  isActive: boolean("is_active").default(true),
});

export const billItems = pgTable("bill_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: varchar("bill_id").notNull().references(() => bills.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  paidQuantity: decimal("paid_quantity", { precision: 10, scale: 2 }).default("0"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: varchar("bill_id").notNull().references(() => bills.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  items: jsonb("items").notNull(), // Array of {itemId, quantity, amount}
  paymentMethod: text("payment_method").default("card"),
  status: text("status").default("completed"),
  processedAt: timestamp("processed_at").default(sql`now()`),
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  startTime: true,
});

export const insertBillItemSchema = createInsertSchema(billItems).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  processedAt: true,
});

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
export type BillItem = typeof billItems.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type BillWithItems = Bill & {
  items: BillItem[];
  table: Table;
};

export type DashboardTable = {
  id: string;
  number: number;
  restaurantName: string;
  bill: Bill | null;
  items: BillItem[];
  guestCount: number;
  startTime: Date | null;
};
