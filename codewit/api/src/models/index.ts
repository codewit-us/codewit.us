import { Sequelize } from 'sequelize';
import { Demo } from './demo';
import { Exercise } from './exercise';
import { Tag } from './tag';
import { Language } from './language';
import { Course } from './course';
import { Module } from './module';
import { Resource } from './resource';

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

[Demo, Exercise, Tag, Language, Resource, Module, Course].forEach((model) =>
  model.initialize(sequelize)
);

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

Module.hasMany(Demo);
Module.hasMany(Resource);
Module.belongsTo(Language);

Course.belongsTo(Language);
Course.hasMany(Module);
Language.hasMany(Course);

export { Demo, Exercise, Tag, Language, Course, Module, Resource, sequelize };
