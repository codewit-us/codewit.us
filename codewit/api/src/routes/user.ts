import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/user';
import { createUserSchema, updateUserSchema } from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';

const userRouter = Router();

userRouter.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get user by id
userRouter.get('/:uid', async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.uid));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

userRouter.post('/', async (req, res) => {
  try {
    const validatedBody = createUserSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const user = await createUser(
      validatedBody.data.username,
      validatedBody.data.email,
      validatedBody.data.googleId,
      validatedBody.data.isAdmin
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

userRouter.patch('/:uid', async (req, res) => {
  try {
    const validatedBody = updateUserSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const user = await updateUser(
      Number(req.params.uid),
      validatedBody.data.username,
      validatedBody.data.email,
      validatedBody.data.isAdmin
    );

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

userRouter.delete('/:uid', async (req, res) => {
  try {
    const deleted = await deleteUser(Number(req.params.uid));
    if (deleted) {
      res.json(deleted);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default userRouter;
