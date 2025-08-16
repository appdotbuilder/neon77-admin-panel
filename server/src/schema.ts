import { z } from 'zod';

// Enums for consistent type checking
export const userRoleEnum = z.enum(['admin', 'member']);
export const transactionTypeEnum = z.enum(['deposit', 'withdrawal']);
export const transactionStatusEnum = z.enum(['pending', 'approved', 'rejected']);
export const paymentMethodEnum = z.enum([
  'bca', 'mandiri', 'bri', 'bni', 'cimb', 'danamon', // Indonesian banks
  'ovo', 'gopay', 'dana', 'linkaja', 'shopeepay' // Indonesian e-wallets
]);

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string(),
  phone_number: z.string(),
  role: userRoleEnum,
  balance: z.number(), // User's current balance
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: transactionTypeEnum,
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  account_number: z.string(), // Bank account or e-wallet number
  account_name: z.string(), // Account holder name
  status: transactionStatusEnum,
  admin_notes: z.string().nullable(), // Admin comments on approval/rejection
  processed_by: z.number().nullable(), // Admin user ID who processed
  processed_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Input schemas for user operations
export const registerUserInputSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2).max(100),
  phone_number: z.string().min(10).max(15)
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

export const loginUserInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginUserInput = z.infer<typeof loginUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  full_name: z.string().min(2).max(100).optional(),
  phone_number: z.string().min(10).max(15).optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Input schemas for transaction operations
export const createTransactionInputSchema = z.object({
  user_id: z.number(),
  type: transactionTypeEnum,
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  account_number: z.string().min(1),
  account_name: z.string().min(1)
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

export const processTransactionInputSchema = z.object({
  id: z.number(),
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().nullable().optional(),
  processed_by: z.number()
});

export type ProcessTransactionInput = z.infer<typeof processTransactionInputSchema>;

// Query schemas
export const getUsersQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  role: userRoleEnum.optional(),
  is_active: z.boolean().optional()
});

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

export const getTransactionsQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  user_id: z.number().optional(),
  type: transactionTypeEnum.optional(),
  status: transactionStatusEnum.optional(),
  payment_method: paymentMethodEnum.optional()
});

export type GetTransactionsQuery = z.infer<typeof getTransactionsQuerySchema>;

// Response schemas
export const paginatedUsersSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number()
});

export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;

export const paginatedTransactionsSchema = z.object({
  transactions: z.array(transactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number()
});

export type PaginatedTransactions = z.infer<typeof paginatedTransactionsSchema>;

export const loginResponseSchema = z.object({
  user: userSchema.omit({ password_hash: true }),
  token: z.string() // JWT or session token
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const userStatsSchema = z.object({
  total_members: z.number(),
  active_members: z.number(),
  pending_transactions: z.number(),
  total_deposits: z.number(),
  total_withdrawals: z.number()
});

export type UserStats = z.infer<typeof userStatsSchema>;