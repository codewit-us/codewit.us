import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { Course, CourseModules, Language, Module, Demo, sequelize } from '../models';
import { CourseResponse } from '../typings/response.types';
import { formatCourseResponse } from '../utils/responseFormatter';

async function createCourse(
  title: string,
  language?: string,
  modules?: number[],
  instructors?: number[],
  roster?: number[]
): Promise<CourseResponse> {
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

    if (instructors) {
      await course.setInstructors(instructors, { transaction });
    }

    if (roster) {
      await course.setRoster(roster, { transaction });
    }

    await course.reload({
      // eager load the instructors
      include: [
        Language,
        Module,
        { association: Course.associations.instructors },
        { association: Course.associations.roster },
      ],
      order: [[Module, CourseModules, 'ordering', 'ASC']],
      transaction,
    });

    return formatCourseResponse(course);
  });
}

async function updateCourse(
  uid: string,
  title?: string,
  language?: string,
  modules?: number[],
  instructors?: number[],
  roster?: number[]
): Promise<CourseResponse> {
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

    if (instructors) {
      await course.setInstructors(instructors, { transaction });
    }

    if (roster) {
      await course.setRoster(roster, { transaction });
    }

    await course.save({ transaction });
    await course.reload({
      include: [Language, Module],
      order: [[Module, CourseModules, 'ordering', 'ASC']],
      transaction,
    });

    return formatCourseResponse(course);
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
    include: [
      Language,
      Module,
      { association: Course.associations.instructors },
      { association: Course.associations.roster },
    ],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return course;
}

async function getAllCourses(): Promise<Course[]> {
  const courses = await Course.findAll({
    include: [
      Language,
      Module,
      { association: Course.associations.instructors },
      { association: Course.associations.roster },
    ],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });
  return courses;
}

async function getStudentCourses(studentId: string): Promise<Course[]> {
  const courses = await Course.findAll({
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Demo], 
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors },
      { association: Course.associations.roster, where: { googleId: studentId } },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });

  return courses;
}


export { createCourse, updateCourse, deleteCourse, getCourse, getAllCourses, getStudentCourses };
