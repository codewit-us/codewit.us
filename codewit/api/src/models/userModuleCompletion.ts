import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

class UserModuleCompletion extends Model<
  InferAttributes<UserModuleCompletion>,
  InferCreationAttributes<UserModuleCompletion>
> {
  declare userUid: number;
  declare moduleUid: number;
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
        moduleUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'modules',
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
        modelName: 'UserModuleCompletion',
        tableName: 'UserModuleCompletions',
        timestamps: false,
      }
    );
  }
}

export { UserModuleCompletion };