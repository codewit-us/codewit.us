import { Exercise } from '../models';

async function getAllExercises(): Promise<Exercise[]> {
  return await Exercise.findAll();
}

async function getExerciseById(uid: number): Promise<Exercise | null> {
  return await Exercise.findByPk(uid);
}

async function createExercise(prompt: string): Promise<Exercise> {
  return await Exercise.create({ prompt });
}

async function updateExercise(
  uid: number,
  prompt?: string
): Promise<Exercise | null> {
  let exercise = await Exercise.findByPk(uid);
  if (exercise) {
    if (prompt) exercise.prompt = prompt;

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
