import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  Association,
  NonAttribute,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
} from 'sequelize';
import { Exercise } from './exercise';
import { Language } from './language';
import { Tag } from './tag';
import { User } from './user';

class Demo extends Model<
  InferAttributes<Demo, { omit: 'exercises' | 'language' | 'tags' }>,
  InferCreationAttributes<Demo, { omit: 'exercises' | 'language' | 'tags' }>
> {
  declare uid: number;
  declare title: string;
  declare likes: number;
  declare youtube_id: string;
  declare youtube_thumbnail: string;
  declare topic: string;

  declare exercises?: NonAttribute<Exercise[]>;
  declare language?: NonAttribute<Language>;
  declare tags?: NonAttribute<Tag[]>;
  declare likedBy?: NonAttribute<User[]>;

  declare getExercises: BelongsToManyGetAssociationsMixin<Exercise>;
  declare addExercise: BelongsToManyAddAssociationMixin<Exercise, number>;
  declare addExercises: BelongsToManyAddAssociationsMixin<Exercise, number>;
  declare setExercises: BelongsToManySetAssociationsMixin<Exercise, number>;
  declare removeExercise: BelongsToManyRemoveAssociationMixin<Exercise, number>;
  declare removeExercises: BelongsToManyRemoveAssociationsMixin<
    Exercise,
    number
  >;
  declare hasExercise: BelongsToManyHasAssociationMixin<Exercise, number>;
  declare hasExercises: BelongsToManyHasAssociationsMixin<Exercise, number>;
  declare countExercises: BelongsToManyCountAssociationsMixin;

  declare getTags: BelongsToManyGetAssociationsMixin<Tag>;
  declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;
  declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>;
  declare setTags: BelongsToManySetAssociationsMixin<Tag, number>;
  declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: BelongsToManyRemoveAssociationsMixin<Tag, number>;

  declare getLanguage: BelongsToGetAssociationMixin<Language>;
  declare setLanguage: BelongsToSetAssociationMixin<Language, number>;

  declare addLikedBy: BelongsToManyAddAssociationMixin<User, number>;
  declare removeLikedBy: BelongsToManyRemoveAssociationMixin<User, number>;
  declare hasLikedBy: BelongsToManyHasAssociationMixin<User, number>;
  declare countLikedBy: BelongsToManyCountAssociationsMixin;

  declare static associations: {
    exercises: Association<Demo, Exercise>;
    language: Association<Demo, Language>;
    tags: Association<Demo, Tag>;
    likedBy: Association<Demo, User>;
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
        topic: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        likes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        youtube_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        youtube_thumbnail: {
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