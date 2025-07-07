import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { StudentCourse } from "@codewit/interfaces";

import { Course, CourseModules, Language, Module, Demo, Resource, sequelize } from '../models';
import { CourseResponse } from '../typings/response.types';
import { formatCourseResponse } from '../utils/responseFormatter';

async function createCourse(
  title: string,
  enrolling: boolean,
  auto_enroll: boolean,
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

    if (auto_enroll && !enrolling) {
      auto_enroll = false;
    }

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
        enrolling,
        auto_enroll,
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
  enrolling?: boolean,
  auto_enroll?: boolean,
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

    if (typeof enrolling === "boolean") {
      course.enrolling = enrolling;

      if (!enrolling) {
        course.auto_enroll = false;
      }
    }

    if (typeof auto_enroll === "boolean") {
      if (course.enrolling) {
        course.auto_enroll = auto_enroll;
      }
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

async function deleteCourse(uid: string): Promise<Course | null> {
  const course = await Course.findByPk(uid);

  if (!course) {
    return null;
  }

  await course.destroy();

  return course;
}

async function getCourse(uid: string): Promise<CourseResponse | null> {
  const course = await Course.findByPk(uid, {
    include: [
      Language,
      Module,
      { association: Course.associations.instructors },
      { association: Course.associations.roster },
    ],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return formatCourseResponse(course);
}

async function getAllCourses(): Promise<CourseResponse[]> {
  const courses = await Course.findAll({
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Language, Resource],
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors },
      { association: Course.associations.roster },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });
  return formatCourseResponse(courses);
}

async function getTeacherCourses(teacherId: string): Promise<CourseResponse[]> {

  const courses = await Course.findAll({
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Language, Resource],
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors, where: { googleId: teacherId } },
      { association: Course.associations.roster },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });

  return formatCourseResponse(courses);
}

async function getStudentCourses(studentId: string): Promise<CourseResponse[]> {
  const courses = await Course.findAll({
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Language, Resource, Demo],
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors },
      { association: Course.associations.roster, where: { googleId: studentId } },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });

  return formatCourseResponse(courses, true);
}

async function getStudentCoursesByUid(userUid: number): Promise<CourseResponse[]> {
  const courses = await Course.findAll({
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Language, Resource, Demo],
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors },
      { association: Course.associations.roster, where: { uid: userUid } },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });

  return formatCourseResponse(courses, true);
}

export async function getStudentCourse(course_id: string): Promise<StudentCourse | null> {
  const course = await Course.findOne({
    where: { id: course_id },
    include: [
      Language,
      {
        association: Course.associations.modules,
        include: [Language, Resource, Demo],
        through: { attributes: ['ordering'] },
      },
      { association: Course.associations.instructors },
    ],
    order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
  });

  if (course == null) {
    return null;
  }

  let modules = [];
  let instructors = [];

  for (let course_module of course.modules) {
    let demos = [];
    let resources = [];

    for (let module_demo of course_module.demos) {
      demos.push({
        uid: module_demo.uid,
        title: module_demo.title,
        youtube_id: module_demo.youtube_id,
        youtube_thumbnail: module_demo.youtube_thumbnail,
      });
    }

    for (let module_resource of course_module.resources) {
      resources.push({
        uid: module_resource.uid,
        url: module_resource.url,
        title: module_resource.title,
        source: module_resource.source,
        likes: module_resource.likes,
      });
    }

    modules.push({
      uid: course_module.uid,
      topic: course_module.topic,
      language: course_module.language.name,
      demos,
      resources,
    });
  }

  for (let course_instructor of course.instructors) {
    instructors.push({
      uid: course_instructor.uid,
      username: course_instructor.username,
      email: course_instructor.email,
    });
  }

  return {
    id: course.id,
    title: course.title,
    language: course.language.name,
    modules,
    instructors,
  };
}

export { 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getCourse, 
  getAllCourses, 
  getStudentCourses,
  getStudentCoursesByUid, 
  getTeacherCourses 
};
