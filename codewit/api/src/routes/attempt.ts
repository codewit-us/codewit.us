import { Router } from 'express';
import { createAttempt } from '../controllers/attempt';
import { checkAuth } from '../middleware/auth';

const attemptRouter = Router();

attemptRouter.post('/', checkAuth, (req, res) => {
  // get current user from req.user
  // get exerciseId, code from req.body
  // create an attempt with createAttempt
  // return the attempt

  const attempt = createAttempt(
    req.body.exerciseId,
    req.user.uid,
    req.body.code
  );

  res.json(attempt);
});

export default attemptRouter;
