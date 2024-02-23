import {
  Model,
  DataTypes,
  Association,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
} from 'sequelize';
import { Exercise } from './exercise';

class Demo extends Model<InferAttributes<Demo>, InferCreationAttributes<Demo>> {
  declare uid: number;
  declare title: string;
  declare likes: number;
  declare youtube_id: string;

  declare exercises?: CreationOptional<Exercise[]>;

  declare static associations: {
    exercises: Association<Demo, Exercise>;
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
          defaultValue: 0,
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
