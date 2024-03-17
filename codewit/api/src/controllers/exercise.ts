import { Exercise, Language, Tag } from '../models';

async function getAllExercises(): Promise<Exercise[]> {
  return await Exercise.findAll({ include: [Tag, Language] });
}

async function getExerciseById(uid: number): Promise<Exercise | null> {
  return await Exercise.findByPk(uid, { include: [Tag, Language] });
}

async function createExercise(prompt: string): Promise<Exercise> {
  return await Exercise.create({ prompt }, { include: [Tag, Language] });
}

async function updateExercise(
  uid: number,
  prompt?: string,
  tags?: string[],
  language?: string
): Promise<Exercise | null> {
  let exercise = await Exercise.findByPk(uid, { include: [Tag, Language] });
  if (exercise) {
    if (prompt) exercise.prompt = prompt;
    if (tags) {
      const newTags = await Tag.bulkCreate(
        tags.map((tag) => ({ name: tag })),
        { ignoreDuplicates: true }
      );

      await exercise.setTags(newTags.map((tag) => tag[0]));
    }

    if (language) {
      const [newLanguage] = await Language.findOrCreate({
        where: { name: language },
      });
      await exercise.setLanguage(newLanguage);
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
