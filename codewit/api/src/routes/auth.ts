import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

authRouter.get('/google/redirect',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3001/',
    session: true
  }),
  (req, res) => {
    res.redirect(`http://localhost:3001/`);
  }
);

authRouter.get('/google/logout', (req, res) => {
  req.logout((err) => {
    if (err) { console.error(err); }
    res.redirect('http://localhost:3001/');
  });
});

authRouter.get('/google/userInfo', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});


export default authRouter;
