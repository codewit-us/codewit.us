import { Router } from 'express';
import passport from 'passport';
import { FRONTEND_URL } from '../secrets';

const authRouter = Router();

function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  return value;
}

function resolveFrontendRedirect(returnTo?: string | null): string {
  const frontendUrl = FRONTEND_URL ?? '/';

  if (!returnTo) {
    return frontendUrl;
  }

  try {
    return new URL(returnTo, frontendUrl).toString();
  } catch {
    return frontendUrl;
  }
}

authRouter.get(
  '/google',
  (req, res, next) => {
    const returnTo = sanitizeReturnTo(req.query.returnTo);

    passport.authenticate('google', {
      scope: ['email', 'profile'],
      state: returnTo ?? undefined,
    })(req, res, next);
  }
);

authRouter.get(
  '/google/redirect',
  passport.authenticate('google', {
    failureRedirect: FRONTEND_URL ?? '/',
    session: true,
  }),
  (req, res) => {
    const returnTo = sanitizeReturnTo(req.query.state);
    res.redirect(resolveFrontendRedirect(returnTo));
  }
);

authRouter.get('/google/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }

    res.redirect(FRONTEND_URL ?? '/');
  });
});

authRouter.get('/google/userInfo', (req, res) => {
  if (req.user) {
    return res.json({
      user: {
        uid: req.user.uid,
        username: req.user.username,
        email: req.user.email,
        googleId: req.user.googleId,
        isAdmin: req.user.isAdmin,
      },
    });
  }

  res.status(401).json({ user: null });
});

export default authRouter;
