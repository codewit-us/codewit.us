import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/google', passport.authenticate('google'), (req, res) => {
  res.send(200);
});

authRouter.get(
  '/google/redirect',
  passport.authenticate('google'),
  (req, res) => {
    res.send(200);
  }
);

export default authRouter;
