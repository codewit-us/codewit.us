import { Request, Response, NextFunction } from 'express';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.redirect('/auth/login');
  } else {
    next();
  }
};

export default checkAuth;
