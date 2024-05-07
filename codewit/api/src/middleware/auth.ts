import { Request, Response, NextFunction } from 'express';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.redirect('/oauth2/google');
  } else {
    next();
  }
};

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.isAdmin !== true) {
    return res.status(401).json({ message: 'Unauthorized' });
  } else {
    next();
  }
};

export { checkAuth, checkAdmin };
