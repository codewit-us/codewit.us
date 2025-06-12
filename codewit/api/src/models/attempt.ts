/*
    Create an Attempt model, which will be used to record each student's attempt at an exercise (e.g. the submission of the code they think will work, including:

    Timestamp of day/time the attempt was made
    The id of the associated exercise
    The id of the user who submitted the attempt
    An auto-incrementing submission number for that user on that exercise. The user's first submission on
    The code that the user submitted (as text)
*/

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  NonAttribute,
  HasOneSetAssociationMixin,
} from 'sequelize';
import { Exercise } from './exercise';
import { User } from './user';

class Attempt extends Model<
  InferAttributes<Attempt>,
  InferCreationAttributes<Attempt>
> {
  declare uid: number;
  declare timestamp: Date;
  declare exercise: NonAttribute<Exercise>;
  declare user: NonAttribute<User>;
  declare submissionNumber: number;
  declare code: string;
  declare completionPercentage: number;
  declare error: string;

  declare setUser: HasOneSetAssociationMixin<User, number>;
  declare setExercise: HasOneSetAssociationMixin<Exercise, number>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        submissionNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        code: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        completionPercentage: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0, max: 100 },
        },
        error: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'attempt',
      }
    );
  }
}

export { Attempt };
