import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { Course, CourseModules, Language, Module, sequelize } from '../models';

async function createCourse(
  title: string,
  language?: string,
  modules?: number[]
): Promise<Course> {
  return sequelize.transaction(async (transaction) => {
    // acquire SHARE ROW EXCLUSIVE lock, This lock allows concurrent reads
    // and locks the table against concurrent writes to avoid race conditions
    // when reading the current count of courses to create a unique course id
    // refer: https://www.postgresql.org/docs/16/explicit-locking.html
    await sequelize.query('LOCK TABLE "courses" IN SHARE ROW EXCLUSIVE MODE', {
      transaction,
    });

    const course_count = await Course.count({ transaction });
    const course = await Course.create(
      {
        id: uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
          separator: '-',
          // use the current count of courses as the seed to ensure uniqueness
          seed: course_count + 1,
        }),
        title,
      },
      { transaction }
    );

    if (language) {
      const [lang] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });

      await course.setLanguage(lang, { transaction });
    }

    if (modules) {
      await Promise.all(
        modules.map(async (moduleId, idx) => {
          await course.addModule(moduleId, {
            through: { ordering: idx + 1 },
            transaction,
          });
        })
      );
    }

    await course.reload({
      include: [Language, Module],
      order: [[Module, CourseModules, 'ordering', 'ASC']],
      transaction,
    });

    return course;
  });
}

async function updateCourse(
  uid: string,
  title?: string,
  language?: string,
  modules?: number[]
): Promise<Course | null> {
  return sequelize.transaction(async (transaction) => {
    const course = await Course.findByPk(uid, { transaction });

    if (!course) {
      return null;
    }

    if (title) {
      course.title = title;
    }

    if (language) {
      const [lang] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });

      await course.setLanguage(lang, { transaction });
    }

    if (modules) {
      // Remove all existing module associations
      await course.setModules([], { transaction });

      await Promise.all(
        modules.map(async (moduleId, idx) => {
          await course.addModule(moduleId, {
            through: { ordering: idx + 1 },
            transaction,
          });
        })
      );
    }

    await course.save({ transaction });
    await course.reload({
      include: [Language, Module],
      order: [[Module, CourseModules, 'ordering', 'ASC']],
      transaction,
    });

    return course;
  });
}

async function deleteCourse(uid: string): Promise<Course | null> {
  const course = await Course.findByPk(uid);

  if (!course) {
    return null;
  }

  await course.destroy();

  return course;
}

async function getCourse(uid: string): Promise<Course | null> {
  const course = await Course.findByPk(uid, {
    include: [Language, Module],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return course;
}

async function getAllCourses(): Promise<Course[]> {
  const courses = await Course.findAll({
    include: [Language, Module],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return courses;
}

export { createCourse, updateCourse, deleteCourse, getCourse, getAllCourses };
