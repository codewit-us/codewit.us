import { Exercise, ExerciseTags, Language, Tag, sequelize } from '../models';

async function getAllExercises(): Promise<Exercise[]> {
  return await Exercise.findAll({
    include: [Tag, Language],
    order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });
}

async function getExerciseById(uid: number): Promise<Exercise | null> {
  return await Exercise.findByPk(uid, {
    include: [Tag, Language],
    order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });
}

async function createExercise(
  prompt: string,
  topic: string,
  tags?: string[],
  language?: string
): Promise<Exercise> {
  return await sequelize.transaction(async (transaction) => {
    const exercise = await Exercise.create(
      { prompt, topic },
      { include: [Tag, Language], transaction }
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

    if (language) {
      const [newLanguage] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });
      await exercise.setLanguage(newLanguage, { transaction });
    }

    await exercise.reload({
      include: [Tag, Language],
      order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
      transaction,
    });

    return exercise;
  });
}

async function updateExercise(
  uid: number,
  prompt?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<Exercise | null> {
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

      await exercise.save({ transaction });
      await exercise.reload({
        include: [Tag, Language],
        order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
        transaction,
      });
    }

    return exercise;
  });
}

async function deleteExercise(uid: number): Promise<Exercise | null> {
  const exercise = await Exercise.findByPk(uid);
  if (exercise) {
    await exercise.destroy();
  }

  return exercise;
}

export {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
