import express from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';
import moduleRouter from './routes/module';
import resourceRouter from './routes/resource';
import courseRouter from './routes/course';

const host = process.env.API_HOST ?? 'localhost';
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;

const app = express();
app.use(express.json());

app.use('/demos', demoRouter);
app.use('/exercises', exerciseRouter);
app.use('/modules', moduleRouter);
app.use('/resources', resourceRouter);
app.use('/courses', courseRouter);

app.listen(port, host, async () => {
  await sequelize.sync({ force: false });
  console.log(`[ ready ] http://${host}:${port}`);
});
