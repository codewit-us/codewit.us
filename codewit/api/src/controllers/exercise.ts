import { Exercise, ExerciseTags, Language, Tag } from '../models';

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
  const exercise = await Exercise.create(
    { prompt, topic },
    { include: [Tag, Language] }
  );

  if (tags) {
    await Promise.all(
      tags.map(async (tag, idx) => {
        const [tagInstance] = await Tag.findOrCreate({ where: { name: tag } });
        await exercise.addTag(tagInstance, { through: { ordering: idx + 1 } });
      })
    );
  }

  if (language) {
    const [newLanguage] = await Language.findOrCreate({
      where: { name: language },
    });
    await exercise.setLanguage(newLanguage);
  }

  await exercise.reload({
    include: [Tag, Language],
    order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });

  return exercise;
}

async function updateExercise(
  uid: number,
  prompt?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<Exercise | null> {
  const exercise = await Exercise.findByPk(uid, { include: [Tag, Language] });
  if (exercise) {
    if (prompt) exercise.prompt = prompt;
    if (tags) {
      await exercise.setTags([]);

      await Promise.all(
        tags.map(async (tag, idx) => {
          const [tagInstance] = await Tag.findOrCreate({
            where: { name: tag },
          });
          await exercise.addTag(tagInstance, {
            through: { ordering: idx + 1 },
          });
        })
      );
    }

    if (language) {
      const [newLanguage] = await Language.findOrCreate({
        where: { name: language },
      });
      await exercise.setLanguage(newLanguage);
    }

    if (topic) {
      exercise.topic = topic;
    }

    await exercise.save();
    await exercise.reload({
      include: [Tag, Language],
      order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
    });
  }

  return exercise;
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
