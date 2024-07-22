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
} from 'sequelize';

class Attempt extends Model<
  InferAttributes<Attempt>,
  InferCreationAttributes<Attempt>
> {
  declare uid: number;
  declare timestamp: Date;
  declare exerciseId: number;
  declare userId: number;
  declare submissionNumber: number;
  declare code: string;

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
        exerciseId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
      },
      {
        sequelize,
        modelName: 'attempt',
      }
    );
  }
}

export { Attempt };
