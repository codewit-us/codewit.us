import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  Association,
  BelongsToSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
} from 'sequelize';
import { Module } from './module';
import { Language } from './language';
import { humanId } from 'human-id';

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
  declare setModules: HasManySetAssociationsMixin<Module, number>;
  declare getModules: HasManyGetAssociationsMixin<Module>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
          defaultValue: humanId({
            separator: '-',
            capitalize: false,
          }),
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
