import { Sequelize } from 'sequelize';
import { Demo } from './demo';
import { Exercise } from './exercise';

const sequelize = new Sequelize({
  host: process.env.DB_HOST ?? 'localhost',
  database: 'codewitus_db',
  dialect: 'postgres',
  username: 'rohith',
  password: '12345',
  port: 5432,
});

[Demo, Exercise].forEach((model) => model.initialize(sequelize));

Demo.hasMany(Exercise, { foreignKey: 'demo_uid' });
Exercise.belongsTo(Demo, { foreignKey: 'demo_uid' });

export { Demo, Exercise, sequelize };
