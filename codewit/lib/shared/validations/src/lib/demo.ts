import { z } from 'zod';
import { validateTopic } from './topic';

const createDemoSchema = z.object({
  title: z.string(),
  youtube_id: z.string(),
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' }),
  language: z.string().optional(),
  tags: z.string().array().optional(),
});

const updateDemoSchema = z.object({
  title: z.string().optional(),
  youtube_id: z.string().optional(),
  topic: z
    .string()
    .refine((t) => validateTopic(t), { message: 'Invalid topic' })
    .optional(),
  language: z.string().optional(),
  tags: z.string().array().optional(),
});

const addExercisesToDemoSchema = z.object({
  exercises: z.number().array(),
});

const removeExercisesFromDemoSchema = z.object({
  exercises: z.number().array(),
});

const setExercisesForDemoSchema = z.object({
  exercises: z.number().array(),
});

export type ZCreateDemoSchema = z.infer<typeof createDemoSchema>;
export type ZUpdateDemoSchema = z.infer<typeof updateDemoSchema>;
export type ZAddExercisesToDemoSchema = z.infer<
  typeof addExercisesToDemoSchema
>;
export type ZRemoveExercisesFromDemoSchema = z.infer<
  typeof removeExercisesFromDemoSchema
>;
export type ZSetExercisesForDemoSchema = z.infer<
  typeof setExercisesForDemoSchema
>;

export {
  createDemoSchema,
  updateDemoSchema,
  addExercisesToDemoSchema,
  removeExercisesFromDemoSchema,
  setExercisesForDemoSchema,
};
