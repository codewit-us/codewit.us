import { z } from 'zod';

const createExerciseSchema = z.object({
  prompt: z.string(),
  topic: z.string().optional(),
  language: z.string().optional(),
  tags: z.string().array().optional(),
});

const updateExerciseSchema = z.object({
  prompt: z.string().optional(),
  topic: z.string().optional(),
  language: z.string().optional(),
  tags: z.string().array().optional(),
});

export type ZCreateExerciseSchema = z.infer<typeof createExerciseSchema>;
export type ZUpdateExerciseSchema = z.infer<typeof updateExerciseSchema>;

export { createExerciseSchema, updateExerciseSchema };
