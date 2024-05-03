import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  Association,
  BelongsToManyAddAssociationMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyCountAssociationsMixin,
} from 'sequelize';
import { User } from './user';

class Resource extends Model<
  InferAttributes<Resource>,
  InferCreationAttributes<Resource>
> {
  declare uid: number;
  declare url: string;
  declare title: string;
  declare source: string;
  declare likes: number;

  declare likedBy?: NonAttribute<User[]>;

  declare addLikedBy: BelongsToManyAddAssociationMixin<User, number>;
  declare removeLikedBy: BelongsToManyRemoveAssociationMixin<User, number>;
  declare hasLikedBy: BelongsToManyHasAssociationMixin<User, number>;
  declare countLikedBy: BelongsToManyCountAssociationsMixin;

  declare static associations: {
    likedBy: Association<Resource, User>;
  };

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        source: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        likes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'resource',
      }
    );
  }
}

export { Resource };
