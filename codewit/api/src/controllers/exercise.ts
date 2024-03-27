import { Exercise, Language, Tag } from '../models';

async function getAllExercises(): Promise<Exercise[]> {
  return await Exercise.findAll({ include: [Tag, Language] });
}

async function getExerciseById(uid: number): Promise<Exercise | null> {
  return await Exercise.findByPk(uid, { include: [Tag, Language] });
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
    const updatedTags = await Promise.all(
      tags.map(async (tag) => {
        const [updatedTag] = await Tag.findOrCreate({ where: { name: tag } });
        return updatedTag;
      })
    );

    await exercise.setTags(updatedTags);
  }

  if (language) {
    const [newLanguage] = await Language.findOrCreate({
      where: { name: language },
    });
    await exercise.setLanguage(newLanguage);
  }

  await exercise.reload();

  return exercise;
}

async function updateExercise(
  uid: number,
  prompt?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<Exercise | null> {
  let exercise = await Exercise.findByPk(uid, { include: [Tag, Language] });
  if (exercise) {
    if (prompt) exercise.prompt = prompt;
    if (tags) {
      const updatedTags = await Promise.all(
        tags.map(async (tag) => {
          const [updatedTag] = await Tag.findOrCreate({ where: { name: tag } });
          return updatedTag;
        })
      );

      await exercise.setTags(updatedTags);
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

    exercise = await exercise.save();
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
