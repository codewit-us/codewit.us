import { Router } from 'express';
import {
  createResource,
  deleteResource,
  getAllResources,
  getResource,
  likeResource,
  removeLikeResource,
  updateResource,
} from '../controllers/resource';
import {
  createResourceSchema,
  updateResourceSchema,
} from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';

const resourceRouter = Router();

resourceRouter.get('/', async (req, res) => {
  try {
    const resources = await getAllResources();
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.get('/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const resource = await getResource(uid);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.post('/', async (req, res) => {
  try {
    const validatedBody = createResourceSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const resource = await createResource(
      validatedBody.data.url,
      validatedBody.data.title,
      validatedBody.data.source
    );
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.patch('/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const validatedBody = updateResourceSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const resource = await updateResource(
      uid,
      validatedBody.data.url,
      validatedBody.data.title,
      validatedBody.data.source
    );

    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.delete('/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const resource = await deleteResource(uid);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.post('/:uid/like', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const user_uid = req.user?.uid;

    const resource = await likeResource(uid, user_uid);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

resourceRouter.delete('/:uid/like', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const user_uid = req.user?.uid;

    const resource = await removeLikeResource(uid, user_uid);
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default resourceRouter;
