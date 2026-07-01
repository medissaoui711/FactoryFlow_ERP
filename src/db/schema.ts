import { pgTable, text, serial, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Users (Linked to Firebase Auth) ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").default("user").notNull(), // 'admin', 'accountant', 'warehouse', 'production', 'sales'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Partners (Clients, Suppliers) ---
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'client' | 'supplier'
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Inventory & Items ---
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'strip_roll' | 'pipe' | 'raw_material'
  thickness: decimal("thickness"), // e.g. 1.2
  size: text("size"), // e.g. 25mm
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantityChange: decimal("quantity_change").notNull(), // positive for in, negative for out
  unit: text("unit").notNull(), // 'tons' | 'pipes'
  referenceId: text("reference_id"), // e.g. order_id or purchase_id
  referenceType: text("reference_type"), // 'production_order' | 'purchase' | 'sale'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Production Orders ---
export const productionOrders = pgTable("production_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull(), // 'draft' | 'in_progress' | 'completed' | 'cancelled'
  type: text("type").notNull(), // 'cutting' | 'manufacturing'
  totalInputWeight: decimal("total_input_weight"),
  totalOutputWeight: decimal("total_output_weight"),
  totalOutputCount: integer("total_output_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// --- Financial Ledger ---
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'treasury' | 'bank' | 'expense' | 'revenue' | 'payable' | 'receivable'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id"),
  referenceType: text("reference_type"), // 'expense' | 'receipt' | 'payment' | 'invoice'
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalLines = pgTable("journal_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  debit: decimal("debit").default("0").notNull(),
  credit: decimal("credit").default("0").notNull(),
});

// --- Checks ---
export const checks = pgTable("checks", {
  id: serial("id").primaryKey(),
  checkNumber: text("check_number").notNull(),
  bankName: text("bank_name").notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(), // 'in_drawer' | 'under_collection' | 'collected' | 'returned'
  partnerId: integer("partner_id").references(() => partners.id),
  type: text("type").notNull(), // 'payable' | 'receivable'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Expenses ---
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(), // Links to specific expense account
  amount: decimal("amount").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Invoices ---
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  status: text("status").default("pending_approval").notNull(), // 'draft' | 'pending_approval' | 'approved' | 'received' | 'canceled'
  totalAmount: decimal("total_amount").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantity: decimal("quantity").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalPrice: decimal("total_price").notNull(),
  receivedQuantity: decimal("received_quantity").default("0").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  type: text("type").notNull(), // 'purchase' | 'sale'
  totalAmount: decimal("total_amount").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceLines = pgTable("invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantity: decimal("quantity").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalPrice: decimal("total_price").notNull(),
});

