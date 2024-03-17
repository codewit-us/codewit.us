import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
} from 'sequelize';

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare uid: number;
  declare name: string;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: 'tag',
      }
    );
  }
}

export { Tag };
