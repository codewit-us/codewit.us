import express from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';
import { moduleRouter } from './routes/module';

const host = process.env.API_HOST ?? 'localhost';
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;

const app = express();
app.use(express.json());

app.use('/demos', demoRouter);
app.use('/exercises', exerciseRouter);
app.use('/modules', moduleRouter);

app.listen(port, host, async () => {
  await sequelize.sync({ force: false });
  console.log(`[ ready ] http://${host}:${port}`);
});
