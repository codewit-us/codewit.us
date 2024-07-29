import { Attempt, Exercise, User } from '../models';

async function createAttempt(
  exerciseId: number,
  userId: number,
  code: string
): Promise<Attempt | null> {
  // get count of previous submissions for the exercise by the user
  const exercise = await Exercise.findByPk(exerciseId);
  const user = await User.findByPk(userId);

  if (!exercise || !user) {
    return null;
  }

  // get submission count for the user
  const submissionCount = await Attempt.count({
    include: [
      {
        model: Exercise,
        where: { id: exerciseId },
      },
      {
        model: User,
        where: { id: userId },
      },
    ],
  });

  const attempt = await Attempt.create({
    code,
    submissionNumber: submissionCount + 1,
  });

  await attempt.setUser(user);
  await attempt.setExercise(exercise);

  await attempt.reload({ include: [Exercise, User] });

  return attempt;
}

export { createAttempt };
