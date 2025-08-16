import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define PostgreSQL enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'approved', 'rejected']);
export const paymentMethodEnum = pgEnum('payment_method', [
  'bca', 'mandiri', 'bri', 'bni', 'cimb', 'danamon', // Indonesian banks
  'ovo', 'gopay', 'dana', 'linkaja', 'shopeepay' // Indonesian e-wallets
]);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  phone_number: text('phone_number').notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull().default('0.00'), // User's current balance
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  account_number: text('account_number').notNull(), // Bank account or e-wallet number
  account_name: text('account_name').notNull(), // Account holder name
  status: transactionStatusEnum('status').notNull().default('pending'),
  admin_notes: text('admin_notes'), // Admin comments on approval/rejection
  processed_by: integer('processed_by'), // Admin user ID who processed
  processed_at: timestamp('processed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  transactions: many(transactionsTable, { relationName: 'user_transactions' }),
  processedTransactions: many(transactionsTable, { relationName: 'admin_processed_transactions' }),
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [transactionsTable.user_id],
    references: [usersTable.id],
    relationName: 'user_transactions',
  }),
  processedByAdmin: one(usersTable, {
    fields: [transactionsTable.processed_by],
    references: [usersTable.id],
    relationName: 'admin_processed_transactions',
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect; // For SELECT operations
export type NewUser = typeof usersTable.$inferInsert; // For INSERT operations
export type Transaction = typeof transactionsTable.$inferSelect; // For SELECT operations
export type NewTransaction = typeof transactionsTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { 
  users: usersTable, 
  transactions: transactionsTable 
};