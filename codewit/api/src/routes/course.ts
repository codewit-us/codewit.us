import { Router } from 'express';
import { QueryTypes } from "sequelize";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getStudentCourses,
  getStudentCourse,
  getTeacherCourses,
  getCourse,
  updateCourse,
} from '../controllers/course';
import { fromZodError } from 'zod-validation-error';
import { createCourseSchema, updateCourseSchema } from '@codewit/validations';
import { checkAdmin } from '../middleware/auth';
import { asyncHandle } from "../middleware/catch";
import { sequelize, Course, Language } from "../models";

const courseRouter = Router();

courseRouter.get("/landing", asyncHandle(async (req, res) => {
  let [as_instructor, as_student] = await Promise.all([
    Course.findAll({
      include: [
        Language,
        {
          association: Course.associations.instructors,
          where: {
            googleId: req.user.googleId
          }
        },
      ]
    }),
    Course.findAll({
      include: [
        Language,
        {
          association: Course.associations.roster,
          where: {
            googleId: req.user.googleId
          }
        },
        { association: Course.associations.instructors }
      ],
      order: [
        [ Course.associations.instructors, "username" ]
      ]
    })
  ]);

  let rtn = {
    student: [],
    instructor: [],
  };

  for (let course of as_instructor) {
    rtn.instructor.push({
      id: course.id,
      title: course.title,
      language: course.language.name
    });
  }

  for (let course of as_student) {
    let instructors = [];

    for (let instructor of course.instructors) {
      let { uid, username, email, ...rest } = instructor;

      instructors.push({ uid, username, email });
    }

    rtn.student.push({
      id: course.id,
      title: course.title,
      language: course.language.name,
      instructors,
    });
  }

  res.status(200).json(rtn);
}));

courseRouter.get('/', async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/:uid', asyncHandle(async (req, res) => {
  interface UserStatus {
    is_instructor: boolean,
    is_student: boolean,
  }

  let check: UserStatus[] = await sequelize.query(
    `
    select "CourseInstructors"."userUid" is not null as is_instructor,
           "CourseRoster"."userUid" is not null as is_student
    from courses
      left join "CourseInstructors" on
        courses.id = "CourseInstructors"."courseId" and
        "CourseInstructors"."userUid" = $2
      left join "CourseRoster" on
        courses.id = "CourseRoster"."courseId" and
        "CourseRoster"."userUid" = $2
    where courses.id = $1`,
    {
      bind: [req.params.uid, req.user.uid],
      type: QueryTypes.SELECT
    }
  );

  if (check.length === 0) {
    return res.status(404).json({error: "CourseNotFound"});
  }

  let found = check[0];
  let student_and_instructor = found.is_instructor && found.is_student;
  let student_view = "student_view" in req.query && req.query["student_view"] === "1";

  if (student_and_instructor && student_view) {
    let course = await getStudentCourse(req.params.uid);

    if (course == null) {
      throw new Error("the course was not found when it was found?");
    }

    res.status(200).json({
      type: "StudentView",
      ...course,
    });
  } else if (found.is_instructor) {
    // logic here is purposely left out as the teachers view is not apart of
    // this update and will probably require different data
    res.status(200).json({
      type: "TeacherView",
    })
  } else if (found.is_student) {
    let course = await getStudentCourse(req.params.uid);

    if (course == null) {
      throw new Error("the course was not found when it was found?");
    }

    res.status(200).json({
      type: "StudentView",
      ...course,
    });
  } else {
    res.status(404).json({error: "CourseNotFound"});
  }
}));

courseRouter.get('/teacher/:id', async (req, res) => {
  try {
    const courses = await getTeacherCourses(req.params.id);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.post('/', checkAdmin, async (req, res) => {
  try {
    const validatedBody = createCourseSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const course = await createCourse(
      validatedBody.data.title,
      validatedBody.data.enrolling,
      validatedBody.data.auto_enroll,
      validatedBody.data.language,
      validatedBody.data.modules,
      validatedBody.data.instructors,
      validatedBody.data.roster
    );

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.patch('/:uid', checkAdmin, async (req, res) => {
  try {
    const validatedBody = updateCourseSchema.safeParse(req.body);
    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const course = await updateCourse(
      req.params.uid,
      validatedBody.data.title,
      validatedBody.data.enrolling,
      validatedBody.data.auto_enroll,
      validatedBody.data.language,
      validatedBody.data.modules,
      validatedBody.data.instructors,
      validatedBody.data.roster
    );

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.delete('/:uid', checkAdmin, async (req, res) => {
  try {
    const course = await deleteCourse(req.params.uid);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default courseRouter;
