import { Request, Response, NextFunction } from "express";

// logs any incoming requests once the request has finished
export function log_request(req: Request, res: Response, next: NextFunction) {
  let start = process.hrtime.bigint();

  // pull the current request id and uuid
  let id = req.id();
  let uuid = req.uuid();

  let ip = req.socket.remoteAddress;
  let port = req.socket.remotePort;
  let version = req.httpVersion;
  let method = req.method;
  let path = req.path;

  // when the "finish" event is triggered we will then log the request and
  // response because we will have the status code by that time
  res.once("finish", () => {
    let now = new Date();
    let finish = process.hrtime.bigint();
    let duration = finish - start;
    let code = res.statusCode;
    let message = res.statusMessage;

    console.log(`${now.toJSON()} ${id}:${uuid} ${ip}:${port} HTTP/${version} ${method} ${path} ${code} ${message} ${format_duration(duration)}`);
  });

  next();
}

const TIME_UNITS = ["ns", "μs", "ms", "s"];

// simple duration formatter that will convert nanoseconds to a larger unit
// for easier readability
function format_duration(duration: bigint): string {
  let index = 0;
  let while_check = BigInt(2000);
  let div_assign = BigInt(1000);

  while (index < TIME_UNITS.length && duration > while_check) {
    duration /= div_assign;
    index += 1;
  }

  return `${duration}${TIME_UNITS[index]}`;
}
