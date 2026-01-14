import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  Association,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize';
import { Language } from './language';
import { Tag } from './tag';
import { Demo } from './demo';
import { Difficulty } from '../typings/response.types';

class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  declare uid: number;
  declare prompt: string;
  declare topic: string;
  declare referenceTest: string;
  declare starterCode: string;
  declare languageUid: number;

  declare language?: NonAttribute<Language>;
  declare tags?: NonAttribute<Tag[]>;

  declare title?: string | null;
  declare difficulty?: Difficulty | null;

  declare createdAt?: Date;
  declare updatedAt?: Date;

  declare getTags: BelongsToManyGetAssociationsMixin<Tag>;
  declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;
  declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>;
  declare setTags: BelongsToManySetAssociationsMixin<Tag, number>;
  declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: BelongsToManyRemoveAssociationsMixin<Tag, number>;

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
          type: DataTypes.TEXT,
          allowNull: false,
        },
        topic: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        referenceTest: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        starterCode: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        languageUid: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'languages',
            key: 'uid',
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        difficulty: {
          type: DataTypes.ENUM('easy', 'hard', 'worked example'),
          allowNull: true,
        }
      },
      {
        sequelize,
        modelName: 'exercise',
        tableName: 'exercises',
      }
    );
  }
}

export { Exercise };
