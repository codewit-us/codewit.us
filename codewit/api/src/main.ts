import express, { Router } from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';
import moduleRouter from './routes/module';
import resourceRouter from './routes/resource';
import courseRouter from './routes/course';
import authrouter from './routes/auth';
import userRouter from './routes/user';
import attemptRouter from './routes/attempt';
import passport from 'passport';
import session from 'express-session';
import { ENABLE_ASSET_SERVING, COOKIE_KEY, HOST, PORT } from './secrets';
import './auth/passport';
import { checkAuth } from './middleware/auth';
import { catchError, asyncHandle } from "./middleware/catch";
import { log_request } from "./middleware/logging";
import { set_request_id } from "./middleware/id";
import { init } from "./utils/id_generator";
import handler from "serve-handler";
import { join } from "node:path";

const cwd = process.cwd();

// we need to serve data from "dist/apps/client"
const assets_dir = join(cwd, "dist/apps/client");

const app = express();

// ensure that a request id and uuid have been assigned to each inbound http
// request
app.use(set_request_id);
app.use(log_request);

app.use(
  session({
    secret: COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // 7 days
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// there is a mix of no api prefix requests and api prefix requests that are
// being made when attempting to authorize a user with google. this is to help
// with this but it should be fixed so that the flow is more consistent
app.use('/oauth2', authrouter);

if (ENABLE_ASSET_SERVING) {
  // start api configuration -----------------------------------------------------

  const api_router = Router();

  api_router.use('/oauth2', authrouter);

  api_router.use('/users', checkAuth, userRouter);
  api_router.use('/demos', checkAuth, demoRouter);
  api_router.use('/exercises', checkAuth, exerciseRouter);
  api_router.use('/modules', checkAuth, moduleRouter);
  api_router.use('/resources', checkAuth, resourceRouter);
  api_router.use('/attempts', checkAuth, attemptRouter);

  api_router.use('/courses', (req, res, next) => {
    if (req.path === '/landing' || req.path === '/landing/') {
      return next();
    }

    return checkAuth(req, res, next);
  }, courseRouter);

  app.use("/api", api_router);


  // handle all requests as if they are trying to retrieve UI assets
  app.get("/*", async (req, res) => {
    await handler(req, res, {
      public: assets_dir,
      rewrites: [
        { "source": "/**", "destination": "/index.html" }
      ]
    });
  });

  // end api configuration -------------------------------------------------------
} else {
  app.use('/users', checkAuth, userRouter);
  app.use('/demos', checkAuth, demoRouter);
  app.use('/exercises', checkAuth, exerciseRouter);
  app.use('/modules', checkAuth, moduleRouter);
  app.use('/resources', checkAuth, resourceRouter);
  app.use('/attempts', checkAuth, attemptRouter);

  app.use('/courses', (req, res, next) => {
    if (req.path === '/landing' || req.path === '/landing/') {
      return next();
    }

    return checkAuth(req, res, next);
  }, courseRouter);
}

// catch all for dealing with errors
app.use(catchError);

init()
  .then(() => app.listen(PORT, HOST, async () => {
    console.log(`[ ready ] http://${HOST}:${PORT}`);
  }))
  .catch(console.error);
