import { Demo, Exercise } from '../models';

async function getAllExercises(): Promise<Exercise[]> {
  return await Exercise.findAll({ include: Demo });
}

async function getExerciseById(uid: number): Promise<Exercise | null> {
  return await Exercise.findByPk(uid, { include: Demo });
}

async function createExercise(
  prompt: string,
  demo_uid: number
): Promise<Exercise> {
  return await Exercise.create({ prompt, demo_uid });
}

async function bulkCreateExercises(
  exercises: { prompt: string; demo_uid: number }[]
): Promise<Exercise[]> {
  return await Exercise.bulkCreate(exercises);
}

async function updateExercise(
  uid: number,
  prompt?: string,
  demo_uid?: number
): Promise<Exercise | null> {
  let exercise = await Exercise.findByPk(uid);
  if (exercise) {
    if (prompt) exercise.prompt = prompt;
    if (demo_uid) exercise.demo_uid = demo_uid;

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
  bulkCreateExercises,
  updateExercise,
  deleteExercise,
};
