import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string(),
  language: z.string().optional(),
  modules: z.number().array().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().optional(),
  language: z.string().optional(),
  modules: z.number().array().optional(),
});

export type ZCreateCourseSchema = z.infer<typeof createCourseSchema>;
export type ZUpdateCourseSchema = z.infer<typeof updateCourseSchema>;

export { createCourseSchema, updateCourseSchema };
