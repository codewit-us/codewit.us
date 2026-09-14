import { User as UserDocument } from '../models/user';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserDocument {}

    export interface Request {
      // retrieves the current request id
      //
      // represents the total number of requests handled
      id: () => number,

      // retrieves the current request uuid
      //
      // used for tracing requests to other servers (eg codeval)
      uuid: () => string,
    }
  }
}
