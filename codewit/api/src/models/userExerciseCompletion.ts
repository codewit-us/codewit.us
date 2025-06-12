import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

class UserExerciseCompletion extends Model<
  InferAttributes<UserExerciseCompletion>,
  InferCreationAttributes<UserExerciseCompletion>
> {
  declare userUid: number;
  declare exerciseUid: number;
  declare completion: number;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        userUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'uid',
          },
        },
        exerciseUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'exercises',
            key: 'uid',
          },
        },
        completion: {
          type: DataTypes.REAL,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'UserExerciseCompletion',
        tableName: 'UserExerciseCompletions',
        timestamps: false,
      }
    );
  }
}

export { UserExerciseCompletion };