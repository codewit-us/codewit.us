import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';

class Resource extends Model<
  InferAttributes<Resource>,
  InferCreationAttributes<Resource>
> {
  declare uid: number;
  declare url: string;
  declare title: string;
  declare source: string;
  declare likes: number;

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
          defaultValue: 1,
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
