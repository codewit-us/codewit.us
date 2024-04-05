import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { Course, CourseModules, Language, Module } from '../models';

async function createCourse(
  title: string,
  language?: string,
  modules?: number[]
): Promise<Course> {
  const course = await Course.create({
    id: uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      // use the current count of courses as the seed to ensure uniqueness
      seed: (await Course.count()) + 1,
    }),
    title,
  });

  if (language) {
    const [lang] = await Language.findOrCreate({
      where: { name: language },
    });

    await course.setLanguage(lang);
  }

  if (modules) {
    await Promise.all(
      modules.map(async (moduleId, idx) => {
        await course.addModule(moduleId, { through: { ordering: idx + 1 } });
      })
    );
  }

  await course.reload({
    include: [Language, Module],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return course;
}

async function updateCourse(
  uid: string,
  title?: string,
  language?: string,
  modules?: number[]
): Promise<Course | null> {
  const course = await Course.findByPk(uid);

  if (!course) {
    return null;
  }

  if (title) {
    course.title = title;
  }

  if (language) {
    const [lang] = await Language.findOrCreate({
      where: { name: language },
    });

    await course.setLanguage(lang);
  }

  if (modules) {
    // Remove all existing module associations
    await course.setModules([]);

    await Promise.all(
      modules.map(async (moduleId, idx) => {
        await course.addModule(moduleId, { through: { ordering: idx + 1 } });
      })
    );
  }

  await course.save();
  await course.reload({
    include: [Language, Module],
    order: [[Module, CourseModules, 'ordering', 'ASC']],
  });

  return course;
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
