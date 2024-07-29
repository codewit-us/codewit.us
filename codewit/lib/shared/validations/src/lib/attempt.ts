import { z } from 'zod';

const createAttemptSchema = z.object({
  exerciseId: z.number(),
  code: z.string(),
});

export type ZCreateAttemptSchema = z.infer<typeof createAttemptSchema>;

export { createAttemptSchema };
