import { Attempt, Exercise, sequelize, User } from '../models';

async function createAttempt(
  exerciseId: number,
  userId: number,
  code: string
): Promise<Attempt | null> {
  return sequelize.transaction(async (transaction) => {
    await sequelize.query('LOCK TABLE "attempts" IN SHARE ROW EXCLUSIVE MODE', {
      transaction,
    });

    const exercise = await Exercise.findByPk(exerciseId, { transaction });
    const user = await User.findByPk(userId, { transaction });

    if (!exercise || !user) {
      return null;
    }

    // get submission count for the user
    const submissionCount = await Attempt.count({
      include: [
        {
          model: Exercise,
          where: { uid: exerciseId },
        },
        {
          model: User,
          where: { uid: userId },
        },
      ],
      transaction,
    });

    const attempt = await Attempt.create(
      {
        code,
        submissionNumber: submissionCount + 1,
      },
      { transaction }
    );

    await attempt.setUser(user, { transaction });
    await attempt.setExercise(exercise, { transaction });

    await attempt.reload({ include: [Exercise, User], transaction });

    return attempt;
  });
}

export { createAttempt };
