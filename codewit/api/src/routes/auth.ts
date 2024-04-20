import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }),
  (req, res) => {
    res.send(200);
  }
);

authRouter.get(
  '/google/redirect',
  passport.authenticate('google'),
  (req, res) => {
    res.redirect('/web/profile');
  }
);

authRouter.get('/google/logout', (req, res) => {
  req.logout({}, (err) => {
    console.log(err);
  });
  res.redirect('/web');
});

export default authRouter;
