import { Sequelize } from 'sequelize';
import { Demo } from './demo';
import { Exercise } from './exercise';

if (
  !process.env.DB_HOST ||
  !process.env.DB_NAME ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_PORT
) {
  throw new Error(
    'Please provide the DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, and DB_PORT environment variables'
  );
}

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
});

[Demo, Exercise].forEach((model) => model.initialize(sequelize));

Demo.belongsToMany(Exercise, { through: 'DemoExercises' });
Exercise.belongsToMany(Demo, { through: 'DemoExercises' });

export { Demo, Exercise, sequelize };
