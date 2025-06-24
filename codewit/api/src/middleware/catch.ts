import { Request, Response, NextFunction } from "express";
import { inspect } from "node:util";

export function catchError(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("request error:", inspect(err));

  if (res.headersSent) {
    return;
  } else {
    res.status(500).json({error: "ServerError"});
  }
}

export function asyncHandle<T>(
  cb: (req: Request, res: Response) => Promise<T>
): (req: Request, res: Response, next: NextFunction) => Promise<void | T> {
  return (req, res, next) => cb(req, res).catch(next);
}

export function asyncMiddleware<T>(
  cb: (req: Request, res: Response, next: NextFunction) => Promise<T>
): (req: Request, res: Response, next: NextFunction) => Promise<void | T> {
  return (req, res, next) => cb(req, res, next).catch(next);
}

export function asyncErrorMiddleware<T, E = Error>(
  cb: (err: E, req: Request, res: Response, next: NextFunction) => Promise<T>
): (err: E, req: Request, res: Response, next: NextFunction) => Promise<void | T> {
  return (err, req, res, next) => cb(err, req, res, next).catch(next);
}
