import { z } from 'zod';

// ─── Bill schemas ─────────────────────────────────────────────────────────

export const externalContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
});

const sharedFields = {
  sharedWithUserId: z.string().optional(),
  externalContact: externalContactSchema.optional(),
};

export const createBillSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    amount: z.number().positive().optional(),
    where: z.string().max(200).optional(),
    notes: z.string().max(500).optional(),
    isShared: z.boolean().default(false),
    ...sharedFields,
    splitType: z.enum(['half', 'custom']).optional(),
    customSplitAmount: z.number().positive().optional(),
    payerUserId: z.string().optional(),
    order: z.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.sharedWithUserId && data.externalContact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sharedWithUserId and externalContact are mutually exclusive',
        path: ['externalContact'],
      });
    }
  });

export type CreateBillInput = z.infer<typeof createBillSchema>;

export const updateBillSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    amount: z.number().positive().nullable().optional(),
    where: z.string().max(200).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    isShared: z.boolean().optional(),
    sharedWithUserId: z.string().nullable().optional(),
    externalContact: externalContactSchema.nullable().optional(),
    splitType: z.enum(['half', 'custom']).nullable().optional(),
    customSplitAmount: z.number().positive().nullable().optional(),
    payerUserId: z.string().nullable().optional(),
    active: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sharedWithUserId && data.externalContact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sharedWithUserId and externalContact are mutually exclusive',
        path: ['externalContact'],
      });
    }
  });

export type UpdateBillInput = z.infer<typeof updateBillSchema>;

// ─── MonthlyBill schemas ──────────────────────────────────────────────────

export const updateMonthlyBillSchema = z.object({
  amount: z.number().positive().nullable().optional(),
  paid: z.boolean().optional(),
});

export type UpdateMonthlyBillInput = z.infer<typeof updateMonthlyBillSchema>;

// ─── Connection schemas ───────────────────────────────────────────────────

export const inviteConnectionSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type InviteConnectionInput = z.infer<typeof inviteConnectionSchema>;
