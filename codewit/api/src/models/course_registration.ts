import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import { User } from "./user";
import { Course } from "./course";

export class CourseRegistration extends Model<
  InferAttributes<CourseRegistration>,
  InferCreationAttributes<CourseRegistration>
> {
  declare courseId: string;
  declare userUid: number;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        courseId: {
          type: DataTypes.STRING,
          primaryKey: true,
          references: {
            model: "courses",
            key: "id",
          },
        },
        userUid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "users",
            key: "uid"
          }
        }
      },
      {
        sequelize,
        modelName: "course_registration",
      }
    );
  }
}
