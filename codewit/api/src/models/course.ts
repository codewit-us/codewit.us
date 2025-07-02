import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  Association,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from 'sequelize';
import { Module } from './module';
import { Language } from './language';
import { User } from './user';

class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  declare id: string;
  declare title: string;
  declare enrolling: boolean;
  declare auto_enroll: boolean;

  declare language?: NonAttribute<Language>;
  declare modules?: NonAttribute<Module[]>;
  declare instructors?: NonAttribute<User[]>;
  declare roster?: NonAttribute<User[]>;
  declare registered?: NonAttribute<User[]>;

  declare static associations: {
    language: Association<Course, Language>;
    modules: Association<Course, Module>;
    instructors: Association<Course, User>;
    roster: Association<Course, User>;
    registered: Association<Course, User>;
  };

  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;
  declare setModules: BelongsToManySetAssociationsMixin<Module, number>;
  declare getModules: BelongsToManyGetAssociationsMixin<Module>;
  declare addModule: BelongsToManyAddAssociationMixin<Module, number>;
  declare setInstructors: BelongsToManySetAssociationsMixin<User, number>;
  declare getInstructors: BelongsToManyGetAssociationsMixin<User>;
  declare addInstructor: BelongsToManyAddAssociationMixin<User, number>;
  declare setRoster: BelongsToManySetAssociationsMixin<User, number>;
  declare getRoster: BelongsToManyGetAssociationsMixin<User>;
  declare addStudent: BelongsToManyAddAssociationMixin<User, number>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        enrolling: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        auto_enroll: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }
      },
      {
        sequelize,
        modelName: 'course',
      }
    );
  }
}

export { Course };
