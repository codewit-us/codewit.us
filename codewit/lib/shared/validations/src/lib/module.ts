import { z } from 'zod';

const createModuleSchema = z.object({
  topic: z.string(),
  language: z.string(),
  resources: z.number().array().optional(),
});

export { createModuleSchema };
