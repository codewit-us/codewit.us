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
      validatedBody.data.starterCode
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
      validatedBody.data.topic,
      validatedBody.data.starterCode
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
