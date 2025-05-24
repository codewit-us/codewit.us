import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

class DemoExercises extends Model<
  InferAttributes<DemoExercises>,
  InferCreationAttributes<DemoExercises>
> {
  declare demoUid: number;
  declare exerciseUid: number;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        demoUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'demos', key: 'uid' },
        },
        exerciseUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'exercises', key: 'uid' },
        },
      },
      {
        sequelize,
        modelName: 'DemoExercises',
        tableName: 'DemoExercises',
        timestamps: true,
      }
    );
  }
}

export { DemoExercises };