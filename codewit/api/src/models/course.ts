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

class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  declare id: string;
  declare title: string;

  declare language?: NonAttribute<Language>;
  declare modules?: NonAttribute<Module[]>;

  declare static associations: {
    language: Association<Course, Language>;
    modules: Association<Course, Module>;
  };

  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;
  declare setModules: BelongsToManySetAssociationsMixin<Module, number>;
  declare getModules: BelongsToManyGetAssociationsMixin<Module>;
  declare addModule: BelongsToManyAddAssociationMixin<Module, number>;

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
      },
      {
        sequelize,
        modelName: 'course',
      }
    );
  }
}

export { Course };
