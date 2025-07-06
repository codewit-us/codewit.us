import { Attempt, DemoExercises, Exercise, ModuleDemos, sequelize, User } from '../models';
import { UserDemoCompletion } from '../models/userDemoCompletion';
import { UserExerciseCompletion } from '../models/userExerciseCompletion';
import { UserModuleCompletion } from '../models/userModuleCompletion';
import { AttemptWithEval } from '../typings/response.types';
import { EvaluationPayload, EvaluationResponse, executeCodeEvaluation } from '../utils/codeEvalService';
import { Language as LanguageEnum } from '@codewit/language';


async function createAttempt(
  exerciseId: number,
  userId: number,
  code: string,
  cookies: string
): Promise<AttemptWithEval | null> {
  return sequelize.transaction(async (transaction) => {

    let updatedModules: { moduleUid: number; completion: number }[] = [];

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
    const lang = await exercise.getLanguage();
    if (!lang) throw new Error('Exercise doesnot have a language associated with it.');
    const languageValue = lang.name as LanguageEnum;
    const evaluationPayload: EvaluationPayload = {
      language: languageValue,
      code,
      runTests: typeof exercise.referenceTest === 'string' && exercise.referenceTest.length > 0,
      testCode: exercise.referenceTest,
    };

    let evalResponse: EvaluationResponse | null = null;
    try {
      const response = await executeCodeEvaluation(evaluationPayload, cookies);
      evalResponse = response;
      console.log('Code evaluation response:', response);
      const { tests_run, passed, error: eval_error } = response;

      if (tests_run > 0) {
        const completionPercentage = Math.round((passed / tests_run) * 100);
        attempt.completionPercentage = completionPercentage;
        attempt.error = eval_error;
        console.log(`Completion Percentage: ${completionPercentage}%`);

        // Update UserExerciseCompletion
        const completion = passed / tests_run;

        await UserExerciseCompletion.upsert({
          userUid: user.uid,
          exerciseUid: exercise.uid,
          completion,
        }, { transaction });


        // Update all demo completions that include this exercise
        const demoExerciseLinks = await DemoExercises.findAll({
          where: { exerciseUid: exercise.uid },
          transaction,
        });

        for (const link of demoExerciseLinks) {
          const demoUid = link.demoUid;

          const exerciseLinks = await DemoExercises.findAll({
            where: { demoUid },
            transaction,
          });

          const completions = await Promise.all(
            exerciseLinks.map(async (ex) => {
              const record = await UserExerciseCompletion.findOne({
                where: {
                  userUid: user.uid,
                  exerciseUid: ex.exerciseUid,
                },
                transaction,
              });
              return record?.completion ?? 0;
            })
          );

          const demoCompletion = completions.length
            ? completions.reduce((a, b) => a + b, 0) / completions.length
            : 0;

          await UserDemoCompletion.upsert({
            userUid: user.uid,
            demoUid,
            completion: demoCompletion,
          }, { transaction });


          // Update module completion (max of demo completions)
          const moduleDemoLinks = await ModuleDemos.findAll({
            where: { demoUid },
            transaction,
          });

          for (const mdl of moduleDemoLinks) {
            const moduleUid = mdl.moduleUid;

            const allDemoLinks = await ModuleDemos.findAll({
              where: { moduleUid },
              transaction,
            });

            const demoCompletions = await Promise.all(
              allDemoLinks.map(async (d) => {
                const rec = await UserDemoCompletion.findOne({
                  where: { userUid: user.uid, demoUid: d.demoUid },
                  transaction,
                });
                return rec?.completion ?? 0;
              })
            );

            const maxCompletion = demoCompletions.length ? Math.max(...demoCompletions) : 0;

            await UserModuleCompletion.upsert({
              userUid: user.uid,
              moduleUid,
              completion: maxCompletion,
            }, { transaction });

            updatedModules.push({ moduleUid, completion: maxCompletion });
          }
        }

      } else {
        attempt.error = eval_error;
        console.warn('Invalid response data for completion percentage calculation:', tests_run, passed, eval_error);
      }
    } catch (err) {
      console.error('Code evaluation failed:', err.message);
      throw new Error('Code evaluation failed');
    }

    await attempt.save({ transaction });
    
    return {
      attempt: {
        uid: attempt.uid,
        submissionNumber: attempt.submissionNumber,
        completionPercentage: attempt.completionPercentage,
      },
      updatedModules,
      evaluation: evalResponse
    };
  });
}

export { createAttempt };
