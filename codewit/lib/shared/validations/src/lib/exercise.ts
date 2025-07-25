import { z } from 'zod';
import { validateTopic } from './topic';

const createExerciseSchema = z.object({
  prompt: z.string(),
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' }),
  language: z.string().optional(),
  tags: z.string().array().optional(),
  referenceTest: z.string(),
  starterCode: z.string().optional(),
});

const updateExerciseSchema = z.object({
  prompt: z.string().optional(),
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' })
    .optional(),
  language: z.string().optional(),
  tags: z.string().array().optional(),
  referenceTest: z.string().optional(),
  starterCode: z.string().optional(),
});

export type ZCreateExerciseSchema = z.infer<typeof createExerciseSchema>;
export type ZUpdateExerciseSchema = z.infer<typeof updateExerciseSchema>;

export { createExerciseSchema, updateExerciseSchema };
