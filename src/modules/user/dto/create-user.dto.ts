import z from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(4).max(150),
  email: z.string().email().trim().max(175),
  password: z.string().trim().min(8).max(32),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
