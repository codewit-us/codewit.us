import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

class ModuleDemos extends Model<
  InferAttributes<ModuleDemos>,
  InferCreationAttributes<ModuleDemos>
> {
  declare moduleUid: number;
  declare demoUid: number;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        moduleUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'modules', key: 'uid' },
        },
        demoUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'demos', key: 'uid' },
        },
      },
      {
        sequelize,
        modelName: 'ModuleDemos',
        tableName: 'ModuleDemos',
        timestamps: true,
      }
    );
  }
}

export { ModuleDemos };