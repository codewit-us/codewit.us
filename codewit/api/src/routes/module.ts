import { Router } from 'express';
import { createModule, getModule } from '../controllers/module';
import { createModuleSchema } from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';

const moduleRouter = Router();

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

moduleRouter.post('/', async (req, res) => {
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

export { moduleRouter };
