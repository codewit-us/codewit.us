import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  Association,
  NonAttribute,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize';
import { Exercise } from './exercise';
import { Language } from './language';
import { Tag } from './tag';

class Demo extends Model<
  InferAttributes<Demo, { omit: 'exercises' | 'language' | 'tags' }>,
  InferCreationAttributes<Demo, { omit: 'exercises' | 'language' | 'tags' }>
> {
  declare uid: number;
  declare title: string;
  declare likes: number;
  declare youtube_id: string;

  declare exercises?: NonAttribute<Exercise[]>;
  declare language?: NonAttribute<Language>;
  declare tags?: NonAttribute<Tag[]>;

  declare getExercises: HasManyGetAssociationsMixin<Exercise>;
  declare addExercise: HasManyAddAssociationMixin<Exercise, number>;
  declare addExercises: HasManyAddAssociationsMixin<Exercise, number>;
  declare setExercises: HasManySetAssociationsMixin<Exercise, number>;
  declare removeExercise: HasManyRemoveAssociationMixin<Exercise, number>;
  declare removeExercises: HasManyRemoveAssociationsMixin<Exercise, number>;
  declare hasExercise: HasManyHasAssociationMixin<Exercise, number>;
  declare hasExercises: HasManyHasAssociationsMixin<Exercise, number>;
  declare countExercises: HasManyCountAssociationsMixin;

  declare getTags: HasManyGetAssociationsMixin<Tag>;
  declare addTag: HasManyAddAssociationMixin<Tag, number>;
  declare addTags: HasManyAddAssociationsMixin<Tag, number>;
  declare setTags: HasManySetAssociationsMixin<Tag, number>;
  declare removeTag: HasManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: HasManyRemoveAssociationsMixin<Tag, number>;

  declare getLanguage: BelongsToGetAssociationMixin<Language>;
  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;

  declare static associations: {
    exercises: Association<Demo, Exercise>;
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
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        likes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        youtube_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'demo',
      }
    );
  }
}

export { Demo };
