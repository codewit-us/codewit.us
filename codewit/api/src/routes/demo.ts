import { Router } from 'express';
import {
  createDemo,
  deleteDemo,
  getAllDemos,
  getDemoById,
  updateDemo,
} from '../controllers/demo';
import { createExercise } from '../controllers/exercise';

const demoRouter = Router();

demoRouter.get('/', async (req, res) => {
  try {
    const demos = await getAllDemos();
    res.json(demos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.get('/:uid', async (req, res) => {
  try {
    const demo = await getDemoById(Number(req.params.uid));
    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.post('/', async (req, res) => {
  try {
    let demo = await createDemo(req.body.title, req.body.youtube_id);
    if (req.body.exercise_prompt) {
      await createExercise(req.body.exercise_prompt, demo.uid);
      demo = await getDemoById(demo.uid);
    }
    res.json(demo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.patch('/:uid', async (req, res) => {
  try {
    const demo = await updateDemo(
      Number(req.params.uid),
      req.body.title,
      req.body.youtube_id
    );

    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.delete('/:uid', async (req, res) => {
  try {
    const demo = await deleteDemo(Number(req.params.uid));
    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default demoRouter;
