import { z } from 'zod';

const createResourceSchema = z.object({
  url: z.string(),
  title: z.string(),
  source: z.string(),
});

const updateResourceSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  source: z.string().optional(),
});

export type ZCreateResourceSchema = z.infer<typeof createResourceSchema>;
export type ZUpdateResourceSchema = z.infer<typeof updateResourceSchema>;

export { createResourceSchema, updateResourceSchema };
