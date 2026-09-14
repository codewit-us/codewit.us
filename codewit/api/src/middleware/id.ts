import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// a request counter to keep track of the total number of requests
let request_counter = 0;

// assigns an id and uuid to the provided request, used for tracing a request
// through the server and to other services
export function set_request_id(req: Request, res: Response, next: NextFunction) {
  // the current request id count to assign
  let id = request_counter += 1;
  // the uuid to assign to the request
  let uuid = uuidv4();

  // going to make them functions as to prevent overwriting the values, will
  // not stop from overwriting the functions but still
  req.id = () => id;
  req.uuid = () => uuid;

  next();
}
