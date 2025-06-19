import { Exercise, ExerciseTags, Language, Tag, sequelize } from '../models';
import { ExerciseResponse } from '../typings/response.types';
import { formatExerciseResponse } from '../utils/responseFormatter';

async function getAllExercises(): Promise<ExerciseResponse[]> {
  const exercises =  await Exercise.findAll({
    include: [Tag, Language],
    order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });

  return formatExerciseResponse(exercises);
}

async function getExerciseById(uid: number): Promise<ExerciseResponse | null> {
  const exercise =  await Exercise.findByPk(uid, {
    include: [Tag, Language],
    order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });
  return formatExerciseResponse(exercise);
}

async function createExercise(
  prompt: string,
  topic: string,
  referenceTest: string,
  tags?: string[],
  language?: string
): Promise<ExerciseResponse> {
  return await sequelize.transaction(async (transaction) => {
    const [languageInstance] = await Language.findOrCreate({
      where: { name: language },
      transaction,
    });

    const exercise = await Exercise.create(
      { prompt, topic, referenceTest, languageUid: languageInstance.uid },
      { transaction }
    );

    if (tags) {
      await Promise.all(
        tags.map(async (tag, idx) => {
          const [tagInstance] = await Tag.findOrCreate({
            where: { name: tag },
            transaction,
          });
          await exercise.addTag(tagInstance, {
            through: { ordering: idx + 1 },
            transaction,
          });
        })
      );
    }

    await exercise.reload({
      include: [Tag, Language],
      order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
      transaction,
    });

    return formatExerciseResponse(exercise);
  });
}

async function updateExercise(
  uid: number,
  prompt?: string,
  referenceTest?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<ExerciseResponse> {
  return await sequelize.transaction(async (transaction) => {
    const exercise = await Exercise.findByPk(uid, {
      include: [Tag, Language],
      transaction,
    });
    if (exercise) {
      if (prompt) exercise.prompt = prompt;
      if (tags) {
        await exercise.setTags([], { transaction });

        await Promise.all(
          tags.map(async (tag, idx) => {
            const [tagInstance] = await Tag.findOrCreate({
              where: { name: tag },
              transaction,
            });
            await exercise.addTag(tagInstance, {
              through: { ordering: idx + 1 },
              transaction,
            });
          })
        );
      }

      if (language) {
        const [newLanguage] = await Language.findOrCreate({
          where: { name: language },
          transaction,
        });
        await exercise.setLanguage(newLanguage, { transaction });
      }

      if (topic) {
        exercise.topic = topic;
      }

      if (referenceTest) {
        exercise.referenceTest = referenceTest;
      }

      await exercise.save({ transaction });
      await exercise.reload({
        include: [Tag, Language],
        order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
        transaction,
      });
    }

    return formatExerciseResponse(exercise);
  });
}

async function deleteExercise(uid: number): Promise<ExerciseResponse | null> {
  const exercise = await Exercise.findByPk(uid);
  if (exercise) {
    await exercise.destroy();
  }

  return formatExerciseResponse(exercise);
}

export {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
