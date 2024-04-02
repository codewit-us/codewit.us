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

class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  declare uid: number;
  declare prompt: string;
  declare topic: string;

  declare language?: NonAttribute<Language>;
  declare tags?: NonAttribute<Tag[]>;

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
          type: DataTypes.STRING,
          allowNull: false,
        },
        topic: {
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
