import { DataTypes, Sequelize } from 'sequelize';
import { Demo } from './demo';
import { Exercise } from './exercise';
import { Tag } from './tag';
import { Language } from './language';
import { Course } from './course';
import { CourseRegistration } from "./course_registration";
import { Module } from './module';
import { Resource } from './resource';
import { User } from './user';
import { Attempt } from './attempt';
import { UserDemoCompletion } from './userDemoCompletion';
import { UserExerciseCompletion } from './userExerciseCompletion';
import { UserModuleCompletion } from './userModuleCompletion';
import { DemoExercises } from './demoExercises';
import { ModuleDemos } from './moduleDemos';

require('dotenv').config();

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

[
  Demo,
  Exercise,
  Tag,
  Language,
  Resource,
  Module,
  Course,
  CourseRegistration,
  User,
  Attempt,
  UserDemoCompletion,
  UserExerciseCompletion,
  UserModuleCompletion,
  DemoExercises,
  ModuleDemos,
].forEach((model) => model.initialize(sequelize));

Demo.belongsToMany(Exercise, { through: DemoExercises });
Exercise.belongsToMany(Demo, { through: DemoExercises });

const DemoTags = sequelize.define(
  'DemoTags',
  {
    ordering: DataTypes.INTEGER,
  },
  { timestamps: false }
);

Demo.belongsToMany(Tag, { through: DemoTags });
Tag.belongsToMany(Demo, { through: DemoTags });

Demo.belongsTo(Language);
Language.hasMany(Demo);

const ExerciseTags = sequelize.define(
  'ExerciseTags',
  {
    ordering: DataTypes.INTEGER,
  },
  { timestamps: false }
);

Exercise.belongsToMany(Tag, { through: ExerciseTags });
Tag.belongsToMany(Exercise, { through: ExerciseTags });

Exercise.belongsTo(Language, { foreignKey: 'languageUid' });
Language.hasMany(Exercise, { foreignKey: 'languageUid' });

Demo.belongsToMany(Module, { through: ModuleDemos });
Module.belongsToMany(Demo, { through: ModuleDemos });

Resource.belongsToMany(Module, { through: 'ModuleResources' });
Module.belongsToMany(Resource, { through: 'ModuleResources' });

Module.belongsTo(Language);
Language.hasMany(Module);

Course.belongsTo(Language);
Language.hasMany(Course);

const CourseModules = sequelize.define(
  'CourseModules',
  {
    ordering: DataTypes.INTEGER,
  },
  { timestamps: false }
);

Course.belongsToMany(Module, { through: CourseModules });
Module.belongsToMany(Course, { through: CourseModules });

Course.belongsToMany(User, { through: 'CourseInstructors', as: 'instructors' });
User.belongsToMany(Course, {
  through: 'CourseInstructors',
  as: 'instructorCourses',
});

Course.belongsToMany(User, { through: 'CourseRoster', as: 'roster' });
User.belongsToMany(Course, { through: 'CourseRoster', as: 'studentCourses' });

Course.belongsToMany(User, { through: CourseRegistration, as: "registered"});
User.belongsToMany(Course, { through: CourseRegistration, as: "registered"});

Demo.belongsToMany(User, { through: 'DemoLikes', as: 'likedBy' });
User.belongsToMany(Demo, { through: 'DemoLikes', as: 'likedDemos' });

Resource.belongsToMany(User, { through: 'ResourceLikes', as: 'likedBy' });
User.belongsToMany(Resource, {
  through: 'ResourceLikes',
  as: 'likedResources',
});

Attempt.belongsTo(Exercise);
Attempt.belongsTo(User);

// UserDemoCompletion Associations
User.hasMany(UserDemoCompletion, { foreignKey: 'userUid' });
Demo.hasMany(UserDemoCompletion, { foreignKey: 'demoUid' });
UserDemoCompletion.belongsTo(User, { foreignKey: 'userUid' });
UserDemoCompletion.belongsTo(Demo, { foreignKey: 'demoUid' });

// UserExerciseCompletion Associations
User.hasMany(UserExerciseCompletion, { foreignKey: 'userUid' });
Exercise.hasMany(UserExerciseCompletion, { foreignKey: 'exerciseUid' });
UserExerciseCompletion.belongsTo(User, { foreignKey: 'userUid' });
UserExerciseCompletion.belongsTo(Exercise, { foreignKey: 'exerciseUid' });

// UserModuleCompletion Associations
User.hasMany(UserModuleCompletion, { foreignKey: 'userUid' });
Module.hasMany(UserModuleCompletion, { foreignKey: 'moduleUid' });
UserModuleCompletion.belongsTo(User, { foreignKey: 'userUid' });
UserModuleCompletion.belongsTo(Module, { foreignKey: 'moduleUid' });

export {
  Demo,
  Exercise,
  Tag,
  DemoTags,
  DemoExercises,
  ExerciseTags,
  Language,
  Course,
  Module,
  ModuleDemos,
  CourseModules,
  Resource,
  User,
  Attempt,
  UserDemoCompletion,
  UserExerciseCompletion,
  UserModuleCompletion,
  sequelize,
};
