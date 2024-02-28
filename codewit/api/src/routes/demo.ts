import { Router } from 'express';
import {
  addExercisesToDemo,
  createDemo,
  deleteDemo,
  getAllDemos,
  getDemoById,
  likeDemo,
  removeExercisesFromDemo,
  setExercisesForDemo,
  updateDemo,
} from '../controllers/demo';

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
    const demo = await createDemo(req.body.title, req.body.youtube_id);

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

demoRouter.post('/:uid/like', async (req, res) => {
  try {
    const demo = await likeDemo(Number(req.params.uid));
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

demoRouter.patch('/:uid/exercises', async (req, res) => {
  try {
    const demo = await addExercisesToDemo(
      Number(req.params.uid),
      req.body.exercises
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

demoRouter.delete('/:uid/exercises', async (req, res) => {
  try {
    const demo = await removeExercisesFromDemo(
      Number(req.params.uid),
      req.body.exercises
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

demoRouter.put('/:uid/exercises', async (req, res) => {
  try {
    const demo = await setExercisesForDemo(
      Number(req.params.uid),
      req.body.exercises
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
