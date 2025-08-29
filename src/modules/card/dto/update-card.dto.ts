import z from 'zod';

export const patchCardSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    brand: z.string().trim().min(1).max(25).optional(),
    credit_limit_in_cents: z.number().int().positive().nullable().optional(),
  })
  .strict();

export type PatchCardDto = z.infer<typeof patchCardSchema>;
