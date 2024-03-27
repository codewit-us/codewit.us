import { z } from 'zod';
import { validateTopic } from './topic';

const createModuleSchema = z.object({
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' }),
  language: z.string(),
  resources: z.number().array(),
});

const updateModuleSchema = z.object({
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' })
    .optional(),
  language: z.string().optional(),
  resources: z.number().array().optional(),
});

export { createModuleSchema, updateModuleSchema };
