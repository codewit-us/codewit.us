import { Attempt, Exercise, sequelize, User } from '../models';
import { EvaluationPayload, executeCodeEvaluation } from '../utils/codeEvalService';

async function createAttempt(
  exerciseId: number,
  userId: number,
  code: string,
  cookies: string
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


    // Evaluate Code
    const evaluationPayload: EvaluationPayload = {
      language: 'java', // Replace with dynamic logic
      code,
      runTests: true,
      testCode: exercise.referenceTest,
    };

    try {
      const response = await executeCodeEvaluation(evaluationPayload, cookies);

      const { TestsRun, Passed } = response;

      if (TestsRun > 0) {
        const completionPercentage = Math.round((Passed / TestsRun) * 100);
        attempt.completionPercentage = completionPercentage;
        attempt.error = response.Error;
        

        console.log(`Completion Percentage: ${completionPercentage}%`);
      } else {
        attempt.error = response.Error;
        console.warn('Invalid response data for completion percentage calculation:', response);
      }
    } catch (error) {
      console.error('Code evaluation failed:', error.message);
      throw new Error('Code evaluation failed');
    }

    await attempt.save({ transaction });
    return attempt;
  });
}

export { createAttempt };
