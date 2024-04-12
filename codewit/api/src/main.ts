import express from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';
import moduleRouter from './routes/module';
import resourceRouter from './routes/resource';
import courseRouter from './routes/course';
import authrouter from './routes/auth';
import passport from 'passport';
import { HOST, PORT } from './secrets';
import './auth/passport';

const app = express();

app.use(passport.initialize());
app.use(express.json());

app.use('/oauth2', authrouter);
app.use('/demos', demoRouter);
app.use('/exercises', exerciseRouter);
app.use('/modules', moduleRouter);
app.use('/resources', resourceRouter);
app.use('/courses', courseRouter);

app.listen(PORT, HOST, async () => {
  await sequelize.sync({ force: false });
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});
