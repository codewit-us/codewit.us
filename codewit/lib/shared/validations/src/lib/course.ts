import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string(),
  enrolling: z.boolean().default(false),
  auto_enroll: z.boolean().default(false),
  language: z.string().optional(),
  modules: z.number().array().optional(),
  roster: z.number().array().optional(),
  instructors: z.number().array().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().optional(),
  enrolling: z.boolean().optional(),
  auto_enroll: z.boolean().optional(),
  language: z.string().optional(),
  modules: z.number().array().optional(),
  roster: z.number().array().optional(),
  instructors: z.number().array().optional(),
});

export type ZCreateCourseSchema = z.infer<typeof createCourseSchema>;
export type ZUpdateCourseSchema = z.infer<typeof updateCourseSchema>;
