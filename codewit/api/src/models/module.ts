import {
  Association,
  BelongsToSetAssociationMixin,
  DataTypes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManySetAssociationsMixin,
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
  declare setDemos: BelongsToManySetAssociationsMixin<Demo, number>;
  declare getDemos: BelongsToManyGetAssociationsMixin<Demo>;
  declare addDemo: BelongsToManyAddAssociationMixin<Demo, number>;
  declare removeDemo: BelongsToManyRemoveAssociationMixin<Demo, number>;

  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;
  declare setResources: BelongsToManySetAssociationsMixin<Resource, number>;
  declare getResources: BelongsToManyGetAssociationsMixin<Resource>;

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
