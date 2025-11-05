import { Exercise, ExerciseTags, Language, Tag, sequelize } from '../models';
import { ExerciseResponse } from '../typings/response.types';
import { formatExerciseResponse } from '../utils/responseFormatter';

type DbDifficulty = 'easy' | 'hard' | 'worked example';

function toDbDifficulty(v: unknown): DbDifficulty | null | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();

  if (!s) return null;
  const norm = s.toLowerCase().replace(/_/g, ' ');

  if (norm === 'easy' || norm === 'hard' || norm === 'worked example') {
    return norm as DbDifficulty;
  }
  return undefined; 
}

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

async function getExercisesByIds(ids: number[]): Promise<ExerciseResponse[]> {
  if (!ids.length) return [];

  const exercises = await Exercise.findAll({
    where   : { uid: ids },
    include : [Tag, Language],
    order   : [[Tag, ExerciseTags, 'ordering', 'ASC']],
  });

  return formatExerciseResponse(exercises);
}

async function createExercise(
  prompt: string,
  topic: string,
  referenceTest: string,
  tags?: string[],
  language?: string,
  starterCode?: string,
  title?: string,
  difficulty?: string,
): Promise<ExerciseResponse> {
  return await sequelize.transaction(async (transaction) => {
    const [languageInstance] = await Language.findOrCreate({
      where: { name: language },
      transaction,
    });

    const exercise = await Exercise.create(
      { prompt,
        topic,
        referenceTest,
        languageUid: languageInstance.uid,
        starterCode,
        title,
        difficulty: toDbDifficulty(difficulty) ?? null,
      },
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
  topic?: string,
  starterCode?: string | null,
  title?: string,
  difficulty?: 'easy' | 'hard' | 'worked example'
) {
  return await sequelize.transaction(async (transaction) => {
    const exercise = await Exercise.findByPk(uid, { transaction });
    if (!exercise) return null;

    const updates: Record<string, unknown> = {};

    if (typeof prompt === 'string') updates.prompt = prompt;
    if (typeof topic === 'string') updates.topic = topic;
    if (typeof referenceTest === 'string') updates.referenceTest = referenceTest;
    if (typeof title == 'string') updates.title = title;
    if (typeof difficulty !== 'undefined') {
      const d = toDbDifficulty(difficulty);
      if (d === undefined) throw new Error(`Invalid difficulty: ${difficulty}`);
      updates.difficulty = d;
    }
    if (starterCode === null) {
      updates.starterCode = null;
    } else if (typeof starterCode === 'string') {
      updates.starterCode = starterCode;
    }

    if (typeof language === 'string' && language.trim() !== '') {
      const maybeNum = Number(language);
      if (Number.isFinite(maybeNum) && maybeNum >= 1) {
        updates.languageUid = maybeNum;
      } else {
        const langRow = await Language.findOne({
          where: { name: language.trim().toLowerCase() },
          attributes: ['uid'],
          transaction,
        });
        if (!langRow) throw new Error(`Unknown language: ${language}`);
        updates.languageUid = (langRow as any).uid;
      }
    }

    if (Object.keys(updates).length) {
      await exercise.update(updates, { transaction });
    }

    if (Array.isArray(tags)) {
      await exercise.setTags([], { transaction });
      for (let i = 0; i < tags.length; i++) {
        const [tagInstance] = await Tag.findOrCreate({
          where: { name: tags[i] },
          transaction,
        });
        await exercise.addTag(tagInstance, {
          through: { ordering: i + 1 },
          transaction,
        });
      }
    }

    const reloaded = await Exercise.findByPk(uid, {
      include: [Tag, Language],
      order: [[Tag, ExerciseTags, 'ordering', 'ASC']],
      transaction,
    });

    return formatExerciseResponse(reloaded);
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
  getExercisesByIds,
  createExercise,
  updateExercise,
  deleteExercise,
};
