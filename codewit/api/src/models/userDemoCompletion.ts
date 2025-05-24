import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

class UserDemoCompletion extends Model<
  InferAttributes<UserDemoCompletion>,
  InferCreationAttributes<UserDemoCompletion>
> {
  declare userUid: number;
  declare demoUid: number;
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
        demoUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'demos',
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
        modelName: 'UserDemoCompletion',
        tableName: 'UserDemoCompletions',
        timestamps: false,
      }
    );
  }
}

export { UserDemoCompletion };