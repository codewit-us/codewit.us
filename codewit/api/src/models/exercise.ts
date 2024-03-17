import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  Association,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize';
import { Language } from './language';
import { Tag } from './tag';
import { Demo } from './demo';

class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  declare uid: number;
  declare prompt: string;

  declare language?: NonAttribute<Language>;
  declare tags?: NonAttribute<Tag[]>;

  declare getTags: HasManyGetAssociationsMixin<Tag>;
  declare addTag: HasManyAddAssociationMixin<Tag, number>;
  declare addTags: HasManyAddAssociationsMixin<Tag, number>;
  declare setTags: HasManySetAssociationsMixin<Tag, number>;
  declare removeTag: HasManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: HasManyRemoveAssociationsMixin<Tag, number>;

  declare getLanguage: BelongsToGetAssociationMixin<Language>;
  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;

  declare static associations: {
    language: Association<Demo, Language>;
    tags: Association<Demo, Tag>;
  };

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        prompt: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'exercise',
      }
    );
  }
}

export { Exercise };
