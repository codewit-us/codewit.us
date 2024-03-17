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
import {
  addExercisesToDemoSchema,
  createDemoSchema,
  removeExercisesFromDemoSchema,
  setExercisesForDemoSchema,
  updateDemoSchema,
} from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';

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
    const validatedBody = createDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await createDemo(
      validatedBody.data.title,
      validatedBody.data.youtube_id,
      validatedBody.data.tags,
      validatedBody.data.language
    );

    res.json(demo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.patch('/:uid', async (req, res) => {
  try {
    const validatedBody = updateDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await updateDemo(
      Number(req.params.uid),
      validatedBody.data.title,
      validatedBody.data.youtube_id
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
    const validatedBody = addExercisesToDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await addExercisesToDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
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
    const validatedBody = removeExercisesFromDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await removeExercisesFromDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
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
    const validatedBody = setExercisesForDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await setExercisesForDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
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
