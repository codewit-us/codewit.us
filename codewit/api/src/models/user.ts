import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare uid: number;
  declare username: string;
  declare email: string;
  declare googleId: string;
  declare isAdmin: boolean;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        googleId: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        isAdmin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'user',
      }
    );
  }
}

export { User };
