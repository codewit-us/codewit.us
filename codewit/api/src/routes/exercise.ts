import { Router } from 'express';
import { z } from "zod";

import {
  createExercise,
  deleteExercise,
  getAllExercises,
  getExerciseById,
  getExercisesByIds,
  updateExercise,
} from '../controllers/exercise';
import {
  createExerciseSchema,
  updateExerciseSchema,
} from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';
import { checkAdmin } from '../middleware/auth';
import multer from 'multer';
import { asyncHandle } from '../middleware/catch';
import { importExercisesCsv } from '../controllers/exerciseImport';
import { executeCodeEvaluation } from "../utils/codeEvalService";

const exerciseRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exerciseRouter.get('/:uid', asyncHandle(async (req, res) => {
  let parsed = parseInt(req.params.uid, 10);

  if (isNaN(parsed) || parsed <= 0) {
    res.status(400).json({error:"InvalidUid"});
  }

  const exercise = await getExerciseById(Number(req.params.uid));

  if (exercise) {
    res.json(exercise);
  } else {
    res.status(404).json({ message: 'Exercise not found' });
  }
}));

exerciseRouter.get('/', async (req, res) => {
  try {
    const idsParam = req.query.ids;

    if (typeof idsParam === 'string') {
      const ids = idsParam
        .split(',')
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0);

      if (ids.length === 0) {
        return res.status(400).json({ message: 'Provide at least one positive integer id' });
      }

      const exercises = await getExercisesByIds(ids);
      return res.json(exercises);
    }

    if (Array.isArray(idsParam)) {
      const ids = idsParam
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0);

      if (ids.length === 0) {
        return res.status(400).json({ message: 'Provide at least one positive integer id' });
      }

      const exercises = await getExercisesByIds(ids);
      return res.json(exercises);
    }

    // No ids → return everything
    const exercises = await getAllExercises();
    return res.json(exercises);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

exerciseRouter.post('/', checkAdmin, async (req, res) => {
  try {
    const validatedBody = createExerciseSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const exercise = await createExercise(
      validatedBody.data.prompt,
      validatedBody.data.topic,
      validatedBody.data.referenceTest,
      validatedBody.data.tags,
      validatedBody.data.language,
      validatedBody.data.starterCode,
      validatedBody.data.title,
      validatedBody.data.difficulty,
    );
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

exerciseRouter.post('/import-csv', checkAdmin,
  upload.single('file'),
  asyncHandle(importExercisesCsv)
);

exerciseRouter.patch('/:uid', checkAdmin, async (req, res) => {
  try {
    const validatedBody = updateExerciseSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const exercise = await updateExercise(
      Number(req.params.uid),
      validatedBody.data.prompt,
      validatedBody.data.referenceTest,
      validatedBody.data.tags,
      validatedBody.data.language,
      validatedBody.data.topic,
      validatedBody.data.starterCode,
      validatedBody.data.title,
      validatedBody.data.difficulty,
    );

    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

exerciseRouter.delete('/:uid', checkAdmin, async (req, res) => {
  try {
    const exercise = await deleteExercise(Number(req.params.uid));
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const test_schema = z.object({
  code: z.string(),
  language: z.string(),
  reference_test: z.string(),
});

exerciseRouter.post("/test", checkAdmin, asyncHandle(async (req, res) => {
  const valid = test_schema.safeParse(req.body);

  // ts does not like it if you try to do `!valid.success` as it will consider
  // `valid.error` to not exist
  if (valid.success === false) {
    return res.status(400).json({
      error: "Validation",
      payload: fromZodError(valid.error)
    });
  }

  let result = await executeCodeEvaluation({
    language: valid.data.language,
    code: valid.data.code,
    testCode: valid.data.reference_test,
    runTests: true,
  });

  return res.status(200).json(result);
}));

export default exerciseRouter;
