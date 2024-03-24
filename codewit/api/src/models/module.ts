import {
  Association,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import { Language } from './language';
import { Demo } from './demo';
import { Resource } from './resource';

class Module extends Model<
  InferAttributes<Module>,
  InferCreationAttributes<Module>
> {
  declare uid: number;
  declare topic: string;

  declare language?: NonAttribute<Language>;
  declare demos?: NonAttribute<Demo[]>;
  declare resources?: NonAttribute<Resource[]>;

  declare static associations: {
    language: Association<Module, Language>;
    demos: Association<Module, Demo>;
    resources: Association<Module, Resource>;
  };

  // module has many demos mixins
  declare setDemos: HasManySetAssociationsMixin<Demo, number>;
  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;
  declare setResources: HasManySetAssociationsMixin<Resource, number>;
  declare getResources: HasManyGetAssociationsMixin<Resource>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        topic: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'module',
      }
    );
  }
}

export { Module };
