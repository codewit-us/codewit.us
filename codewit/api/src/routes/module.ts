import { Router } from 'express';
import {
  createModule,
  deleteModule,
  getModule,
  getModules,
  updateModule,
} from '../controllers/module';
import { createModuleSchema, updateModuleSchema } from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';
import { checkAdmin } from '../middleware/auth';

const moduleRouter = Router();

moduleRouter.get('/', async (req, res) => {
  try {
    const modules = await getModules();
    res.json(modules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

moduleRouter.get('/:uid', async (req, res) => {
  try {
    const module = await getModule(Number(req.params.uid));
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

moduleRouter.post('/', checkAdmin, async (req, res) => {
  try {
    const validatedBody = createModuleSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const module = await createModule(
      validatedBody.data.topic,
      validatedBody.data.language,
      validatedBody.data.resources
    );

    res.json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

moduleRouter.patch('/:uid', checkAdmin, async (req, res) => {
  try {
    const validatedBody = updateModuleSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const module = await updateModule(
      Number(req.params.uid),
      validatedBody.data.topic,
      validatedBody.data.language,
      validatedBody.data.resources
    );

    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

moduleRouter.delete('/:uid', checkAdmin, async (req, res) => {
  try {
    const module = await deleteModule(Number(req.params.uid));
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ message: 'Module not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default moduleRouter;
