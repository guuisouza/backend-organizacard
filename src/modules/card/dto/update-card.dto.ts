import z from 'zod';

export const patchCardSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    brand: z.string().trim().min(1).max(25).optional(),
    credit_limit_in_cents: z.number().int().positive().nullable().optional(),
    invoice_closing_day: z.number().int().min(1).max(31).nullable().optional(),
    invoice_due_day: z.number().int().min(1).max(31).nullable().optional(),
  })
  .strict();

export type PatchCardDto = z.infer<typeof patchCardSchema>;
