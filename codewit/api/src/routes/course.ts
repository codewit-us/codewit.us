import { Router } from 'express';
import { QueryTypes } from "sequelize";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getStudentCourses,
  getStudentCoursesByUid,
  getStudentCourse,
  getTeacherCourses,
  getCourse,
  updateCourse,
} from '../controllers/course';
import { fromZodError } from 'zod-validation-error';
import { createCourseSchema, updateCourseSchema } from '@codewit/validations';
import { checkAdmin, checkAuth } from '../middleware/auth';
import { 
  Course, 
  User, 
  UserModuleCompletion, 
  sequelize, 
  Language,
  CourseModules,
  Resource,
  Module,
} from '../models';
import { asyncHandle } from "../middleware/catch";
import {  } from "../models";
import { formatCourseResponse } from '../utils/responseFormatter';

type UserStatus = { is_instructor: boolean; is_student: boolean };

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

courseRouter.get('/:courseId/progress', checkAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Load course + roster
    const course = await Course.findByPk(courseId, {
      include: [{ model: User, as: 'roster', attributes: ['uid', 'username'] }],
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // All module-ids that belong to the course
    const courseModules   = await course.getModules({ attributes: ['uid'] });
    const moduleIds       = courseModules.map(m => m.uid);
    const totalModules    = moduleIds.length;

    // For every student build one row
    const rows = await Promise.all(
      course.roster.map(async (student) => {
        // fetch only the completions this student actually has
        const compRows = await UserModuleCompletion.findAll({
          where: { userUid: student.uid, moduleUid: moduleIds },
          attributes: ['moduleUid', 'completion'],
        });

        // map <moduleUid, completion>
        const compMap = new Map<number, number>();
        compRows.forEach(r => compMap.set(r.moduleUid, r.completion));

        const sum = moduleIds.reduce(
          (acc, id) => acc + (compMap.get(id) ?? 0), 0
        );
        const avg = totalModules ? sum / totalModules : 0; 

        return {
          studentUid  : student.uid,
          studentName : student.username,
          // 0‒1  (UI multiplies by 100)
          completion  : avg,        
        };
      })
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/student/by-uid/:uid', async (req, res) => {
   try {
     const uid = Number(req.params.uid);
     const courses = await getStudentCoursesByUid(uid);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/teacher/:id', async (req, res) => {
  try {
    const courses = await getTeacherCourses(req.params.id);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/', async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/:uid/role', asyncHandle(async (req, res) => {
  interface UserStatus { 
    is_instructor: boolean; 
    is_student: boolean 
  }
  const [row] = await sequelize.query<UserStatus>(
    `
    select
      "CourseInstructors"."userUid" is not null as is_instructor,
      "CourseRoster"."userUid"      is not null as is_student
    from courses
      left join "CourseInstructors"
        on courses.id = "CourseInstructors"."courseId"
       and "CourseInstructors"."userUid" = $2
      left join "CourseRoster"
        on courses.id = "CourseRoster"."courseId"
       and "CourseRoster"."userUid" = $2
    where courses.id = $1
    `,
    { bind: [req.params.uid, req.user.uid], type: QueryTypes.SELECT }
  );

  if (!row) return res.status(404).json({ role: null });

  if (row.is_instructor) return res.json({ role: 'instructor' });
  if (row.is_student)    return res.json({ role: 'student' });
  return res.json({ role: null });
}));

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
    const course = await Course.findOne({
      where: { id: req.params.uid },
      include: [
        Language,
        {
          association: Course.associations.modules,
          include: [Language, Resource],
          through: { attributes: ['ordering'] },
        },
        { association: Course.associations.instructors, where: { uid: req.user.uid } },
        { association: Course.associations.roster },
      ],
      order: [[Course.associations.modules, CourseModules, 'ordering', 'ASC']],
    });

    let result = formatCourseResponse(course, true);

    res.status(200).json({
      type: "TeacherView",
      ...result,
    });
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
