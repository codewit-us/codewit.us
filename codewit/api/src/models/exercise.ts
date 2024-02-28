import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';

class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  declare uid: number;
  declare prompt: string;

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
