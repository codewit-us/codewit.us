import { z } from 'zod';
import { validateTopic } from './topic';

const uniqueResourceIds = (resources: number[]) =>
  new Set(resources).size === resources.length;

const createModuleSchema = z.object({
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' }),
  language: z.string(),
  resources: z.number().array().refine(uniqueResourceIds, {
    message: 'Resources must not contain duplicate IDs',
  }),
});

const updateModuleSchema = z.object({
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' })
    .optional(),
  language: z.string().optional(),
  resources: z.number().array().refine(uniqueResourceIds, {
    message: 'Resources must not contain duplicate IDs',
  }).optional(),
});

export { createModuleSchema, updateModuleSchema };
