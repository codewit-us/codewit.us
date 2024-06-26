import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
} from '../controllers/user';
import { createUserSchema, updateUserSchema } from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';
import { checkAdmin } from '../middleware/auth';

const userRouter = Router();

userRouter.get('/', checkAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get user by email
userRouter.get('/:email', checkAdmin, async (req, res) => {
  try {
    console.log(req.params.email);
    const user = await getUserByEmail(req.params.email);
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

userRouter.post('/', checkAdmin, async (req, res) => {
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

userRouter.patch('/:uid', checkAdmin, async (req, res) => {
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

userRouter.delete('/:uid', checkAdmin, async (req, res) => {
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
