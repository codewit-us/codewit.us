import {
  Model,
  DataTypes,
  Association,
  NonAttribute,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';
import { Exercise } from './exercise';

class Demo extends Model<
  InferAttributes<Demo, { omit: 'exercises' }>,
  InferCreationAttributes<Demo, { omit: 'exercises' }>
> {
  declare uid: number;
  declare title: string;
  declare likes: number;
  declare youtube_id: string;

  declare exercises?: NonAttribute<Exercise[]>; // Note this is optional since it's only populated when explicitly requested in code

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
