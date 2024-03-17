import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
} from 'sequelize';
import { Language as LanguageEnum } from '@codewit/language';

class Language extends Model<
  InferAttributes<Language>,
  InferCreationAttributes<Language>
> {
  declare uid: number;
  declare name: string;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        uid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.ENUM(...Object.values(LanguageEnum)),
          unique: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'language',
      }
    );
  }
}

export { Language };
