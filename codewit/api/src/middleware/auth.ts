import { Request, Response, NextFunction } from 'express';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.redirect('/oauth2/google');
  } else {
    next();
  }
};

export default checkAuth;
