import z from 'zod';

export const loginLocalSchema = z.object({
  email: z.string().email().trim().max(175),
  password: z.string().trim().min(8).max(32),
});

export type LoginLocalDto = z.infer<typeof loginLocalSchema>;
