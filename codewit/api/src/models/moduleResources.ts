import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

class ModuleResources extends Model<
  InferAttributes<ModuleResources>,
  InferCreationAttributes<ModuleResources>
> {
  declare moduleUid: number;
  declare resourceUid: number;
  declare ordering: number;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        moduleUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'modules', key: 'uid' },
        },
        resourceUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: { model: 'resources', key: 'uid' },
        },
        ordering: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'ModuleResources',
        tableName: 'ModuleResources',
        timestamps: true,
      },
    );
  }
}

export { ModuleResources };
