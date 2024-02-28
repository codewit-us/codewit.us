import { Router } from 'express';

import {
  createExercise,
  deleteExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
} from '../controllers/exercise';

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

exerciseRouter.post('/', async (req, res) => {
  try {
    const exercise = await createExercise(req.body.prompt);
    res.json(exercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

exerciseRouter.patch('/:uid', async (req, res) => {
  try {
    const exercise = await updateExercise(
      Number(req.params.uid),
      req.body.prompt
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

exerciseRouter.delete('/:uid', async (req, res) => {
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
