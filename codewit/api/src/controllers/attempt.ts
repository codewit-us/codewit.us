import { Attempt } from '../models';

async function createAttempt(
  exerciseId: number,
  userId: number,
  code: string
): Promise<Attempt> {
  // get count of previous submissions for the exercise by the user
  const submissionCount = await Attempt.count({
    where: { exerciseId, userId },
  });

  return await Attempt.create({
    exerciseId,
    userId,
    code,
    submissionNumber: submissionCount + 1,
  });
}

export { createAttempt };
