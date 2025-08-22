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

export const updateEnrollmentFlagsSchema = z.object({
  enrolling: z.boolean(),
  auto_enroll: z.boolean(),
}).superRefine((data, ctx) => {
  if (!data.enrolling && data.auto_enroll) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['auto_enroll'],
      message: 'auto_enroll cannot be true when enrolling is false',
    });
  }
});

export const bulkRegistrationSchema = z.object({
  action : z.enum(['enroll', 'deny']),
  uids   : z.array(z.number().int()).min(1),
});

export type ZCreateCourseSchema = z.infer<typeof createCourseSchema>;
export type ZUpdateCourseSchema = z.infer<typeof updateCourseSchema>;
export type ZUpdateEnrollmentFlags = z.infer<typeof updateEnrollmentFlagsSchema>;
export type ZBulkRegistrationSchema = z.infer<typeof bulkRegistrationSchema>;
