import { Router } from 'express';
import passport from 'passport';
import { FRONTEND_URL } from '../secrets';

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
  passport.authenticate('google', {
    failureRedirect: FRONTEND_URL,
    session: true,
  }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

authRouter.get('/google/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }

    res.redirect(FRONTEND_URL);
  });
});

authRouter.get('/google/userInfo', (req, res) => {
  if (req.user) {
    return res.json({
      user: {
        username: req.user.username,
        email: req.user.email,
        googleId: req.user.googleId,
      },
    });
  }

  res.redirect('/oauth2/google');
});

export default authRouter;
