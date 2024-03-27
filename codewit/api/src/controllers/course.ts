import { Course, Language, Module } from '../models';

async function createCourse(
  title: string,
  language?: string,
  modules?: number[]
): Promise<Course> {
  const course = await Course.create({
    title,
  });

  if (language) {
    const [lang] = await Language.findOrCreate({
      where: { name: language },
    });

    await course.setLanguage(lang);
  }

  if (modules) {
    await course.setModules(modules);
  }

  await course.reload({ include: [Language, Module] });

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
    await course.setModules(modules);
  }

  await course.save();
  await course.reload({ include: [Language, Module] });

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
  });

  return course;
}

async function getAllCourses(): Promise<Course[]> {
  const courses = await Course.findAll({
    include: [Language, Module],
  });

  return courses;
}

export { createCourse, updateCourse, deleteCourse, getCourse, getAllCourses };
