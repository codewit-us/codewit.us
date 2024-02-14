import express from 'express';
import { sequelize } from './models';
import demoRouter from './routes/demo';
import exerciseRouter from './routes/exercise';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

app.use('/demos', demoRouter);
app.use('/exercises', exerciseRouter);

app.listen(port, host, async () => {
  await sequelize.sync({ force: false });
  console.log(`[ ready ] http://${host}:${port}`);
});
