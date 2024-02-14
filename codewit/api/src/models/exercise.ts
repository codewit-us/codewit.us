import {
  Model,
  DataTypes,
  ForeignKey,
  NonAttribute,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';
import { Demo } from './demo';

class Exercise extends Model<
  InferAttributes<Exercise>,
  InferCreationAttributes<Exercise>
> {
  declare uid: number;
  declare prompt: string;
  declare demo_uid: ForeignKey<Demo['uid']>;

  declare demo?: NonAttribute<Demo>;

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
        demo_uid: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'demo_uid',
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
