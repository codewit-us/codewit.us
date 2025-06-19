import { Router } from 'express';
import { createAttempt } from '../controllers/attempt';
import { checkAuth } from '../middleware/auth';
import { createAttemptSchema } from '@codewit/validations';
import { fromZodError } from 'zod-validation-error';

const attemptRouter = Router();

attemptRouter.post('/', checkAuth, async (req, res) => {
  // get current user from req.user
  // get exerciseId, code from req.body
  // create an attempt with createAttempt
  // return the attempt

  try {
    const validatedBody = createAttemptSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const result = await createAttempt(
      validatedBody.data.exerciseId,
      req.user.uid,
      validatedBody.data.code,
      req.headers.cookie
    );
    if (!result)
      return res.status(404).json({ message: 'Exercise/User not found' });

    res.json({ attempt: result.attempt, evaluation: result.evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default attemptRouter;
