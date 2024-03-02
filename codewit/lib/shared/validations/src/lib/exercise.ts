import { z } from 'zod';

const createExerciseSchema = z.object({
  prompt: z.string(),
});

const updateExerciseSchema = z.object({
  prompt: z.string().optional(),
});

export type ZCreateExerciseSchema = z.infer<typeof createExerciseSchema>;
export type ZUpdateExerciseSchema = z.infer<typeof updateExerciseSchema>;

export { createExerciseSchema, updateExerciseSchema };
