import { Router } from 'express';

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

const exerciseRouter = Router();

exerciseRouter.get('/', async (req, res) => {
  try {
    const exercises = await getAllExercises();
    res.json(exercises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

exerciseRouter.get('/:uid', async (req, res) => {
  try {
    const exercise = await getExerciseById(Number(req.params.uid));
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

exerciseRouter.get('/', async (req, res) => {
  try {
    const idsParam = req.query.ids as string | undefined;

    // no ?ids=   ➜ old behaviour (all exercises)
    if (!idsParam) {
      const exercises = await getAllExercises();
      return res.json(exercises);
    }

    // ?ids=34,37 ➜ batch fetch
    const ids = idsParam.split(',').map(Number).filter(Boolean);
    const exercises = await getExercisesByIds(ids);
    res.json(exercises);
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
      validatedBody.data.language
    );
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      validatedBody.data.topic
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

export default exerciseRouter;
