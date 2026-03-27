import express from 'express';
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
import { COOKIE_KEY, HOST, PORT, REDIS_HOST, REDIS_PORT } from './secrets';
import './auth/passport';
import { checkAuth } from './middleware/auth';
import { catchError, asyncHandle } from "./middleware/catch";
import { init } from "./utils/id_generator";

const app = express();

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

app.use('/oauth2', authrouter);

app.use('/users', checkAuth, userRouter);
app.use('/demos', checkAuth, demoRouter);
app.use('/exercises', checkAuth, exerciseRouter);
app.use('/modules', checkAuth, moduleRouter);
app.use('/resources', checkAuth, resourceRouter);
app.use('/courses', checkAuth, courseRouter);
app.use('/attempts', checkAuth, attemptRouter);

app.use(catchError);

init()
  .then(() => app.listen(PORT, HOST, async () => {
    console.log(`[ ready ] http://${HOST}:${PORT}`);
  }))
  .catch(console.error);
