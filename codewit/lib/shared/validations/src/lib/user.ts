import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  googleId: z.string(),
  isAdmin: z.boolean().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  isAdmin: z.boolean().optional(),
});

export type ZCreateUserSchema = z.infer<typeof createUserSchema>;
export type ZUpdateUserSchema = z.infer<typeof updateUserSchema>;

export { createUserSchema, updateUserSchema };
