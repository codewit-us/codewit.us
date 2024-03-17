import { Sequelize } from 'sequelize';
import { Demo } from './demo';
import { Exercise } from './exercise';
import { Tag } from './tag';
import { Language } from './language';

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

[Demo, Exercise, Tag, Language].forEach((model) => model.initialize(sequelize));

Demo.belongsToMany(Exercise, { through: 'DemoExercises' });
Exercise.belongsToMany(Demo, { through: 'DemoExercises' });

Demo.belongsToMany(Tag, { through: 'DemoTags' });
Tag.belongsToMany(Demo, { through: 'DemoTags' });

Demo.belongsTo(Language);
Language.hasMany(Demo);

Exercise.belongsToMany(Tag, { through: 'ExerciseTags' });
Tag.belongsToMany(Exercise, { through: 'ExerciseTags' });

Exercise.belongsTo(Language);
Language.hasMany(Exercise);

export { Demo, Exercise, Tag, Language, sequelize };
