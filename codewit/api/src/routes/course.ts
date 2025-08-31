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
import { 
  createCourseSchema, 
  updateCourseSchema, 
  updateEnrollmentFlagsSchema,
  bulkRegistrationSchema 
} from '@codewit/validations';
import { checkAdmin, checkAuth,checkInstructorOrAdmin } from '../middleware/auth';
import {
  Course,
  User,
  UserModuleCompletion,
  sequelize,
  Language,
  CourseModules,
  CourseRegistration,
  Resource,
  Module,
} from '../models';
import { asyncHandle } from "../middleware/catch";
import {  } from "../models";
import { formatCourseResponse } from '../utils/responseFormatter';
import { Op } from 'sequelize';

interface UserStatus {
  is_instructor: boolean,
  is_student: boolean,
}

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

        const completedModules = moduleIds.filter(id => (compMap.get(id) ?? 0) >= 1).length;
        const avg = totalModules ? (completedModules / totalModules) * 100 : 0;

        return {
          studentUid       : student.uid,
          studentName      : student.username,
          completion       : avg,
          modulesCompleted : completedModules,
          modulesTotal     : totalModules, 
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

interface CourseUserStatus {
  is_instructor: boolean,
  is_student: boolean,
  enrolling: boolean,
  auto_enroll: boolean,
  title: string,
  is_registered: boolean,
}

courseRouter.get('/:uid', asyncHandle(async (req, res) => {
  let check: CourseUserStatus[] = await sequelize.query(
    `
    select "CourseInstructors"."userUid" is not null as is_instructor,
           "CourseRoster"."userUid" is not null as is_student,
           courses.enrolling,
           courses.auto_enroll,
           courses.title,
           course_registrations."userUid" is not null as is_registered
    from courses
      left join "CourseInstructors" on
        courses.id = "CourseInstructors"."courseId" and
        "CourseInstructors"."userUid" = $2
      left join "CourseRoster" on
        courses.id = "CourseRoster"."courseId" and
        "CourseRoster"."userUid" = $2
      left join course_registrations on
        courses.id = course_registrations."courseId" and
        course_registrations."userUid" = $2
    where courses.id = $1`,
    {
      bind: [req.params.uid, req.user.uid],
      type: QueryTypes.SELECT
    }
  );

  if (check.length === 0) {
    return res.status(404).json({ error: "CourseNotFound" });
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
    if (found.enrolling) {
      res.json({
        type: "Enrolling",
        title: found.title,
        is_registered: found.is_registered,
        auto_enroll: found.auto_enroll,
      });
    } else {
      res.status(404).json({ error: "CourseNotFound" });
    }
  }
}));

courseRouter.get('/:uid/registrations', checkAuth, checkInstructorOrAdmin, asyncHandle(async (req, res) => {
    const rows = await CourseRegistration.findAll({
      where   : { courseId: req.params.uid },
      include : [{
        model      : User,
        as         : 'user',
        attributes : ['uid', 'username', 'email'],
      }],
      order   : [['createdAt', 'ASC']],
    }) as (CourseRegistration & {
      user      : Pick<User, 'uid' | 'username' | 'email'>,
      createdAt : Date
    })[];

    const pending = rows.map(r => ({
      uid       : r.user.uid,
      username  : r.user.username,
      email     : r.user.email,
      requested : r.createdAt,
    }));

    res.json(pending);
  })
);

courseRouter.post('/:uid/registrations/bulk', checkAuth, checkInstructorOrAdmin, asyncHandle(async (req, res) => {
    const parsed = bulkRegistrationSchema.safeParse(req.body);
    if (parsed.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(parsed.error).toString() });
    }

    const { action, uids } = parsed.data;

    await sequelize.transaction(async (t) => {
      await CourseRegistration.destroy({
        where       : { courseId: req.params.uid, userUid: uids },
        transaction : t,
      });

      if (action === 'enroll') {
        // insert rows into CourseRoster (still raw SQL because there’s no model)
        await sequelize.query(
          `
          insert into "CourseRoster" ("courseId","userUid","createdAt","updatedAt")
          select $1, u, now(), now()
          from   unnest($2::int[]) as u
          on conflict do nothing
          `,
          { bind: [ req.params.uid, uids ], type: QueryTypes.INSERT, transaction: t }
        );
      }
    });

    return res.status(200).json({ action, uids });
  })
);

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

    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (validatedBody.data.enrolling === false) {
      await CourseRegistration.destroy({ where: { courseId: req.params.uid } });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.patch('/:uid/enrollment', checkAuth, checkInstructorOrAdmin, asyncHandle(async (req, res) => {
  const result = updateEnrollmentFlagsSchema.safeParse(req.body);

  if (result.success === false) {
    return res
      .status(400)
      .json({ message: fromZodError(result.error).toString() });
  }

  const { enrolling, auto_enroll } = result.data;

  await sequelize.transaction(async t => {
    await Course.update(
      { enrolling, auto_enroll: enrolling ? auto_enroll : false },
      { where: { id: req.params.uid }, transaction: t }
    );

    if (!enrolling) {
      await CourseRegistration.destroy({ where: { courseId: req.params.uid }, transaction: t });
    }
  });

  res.status(200).json({ enrolling, auto_enroll: enrolling ? auto_enroll : false });

}));

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

interface RegistrationStatus {
  is_student: boolean,
  enrolling: boolean,
  auto_enroll: boolean,
  is_registered: boolean,
}

courseRouter.post("/:uid/register", asyncHandle(async (req, res) => {
  await sequelize.transaction(async transaction => {
    let result: RegistrationStatus[] = await sequelize.query(
      `
      select "CourseRoster"."userUid" is not null as is_student,
             courses.enrolling,
             courses.auto_enroll,
             course_registrations."userUid" is not null as is_registered
      from courses
        left join "CourseRoster" on
          courses.id = "CourseRoster"."courseId" and
          "CourseRoster"."userUid" = $2
        left join course_registrations on
          courses.id = course_registrations."courseId" and
          course_registrations."userUid" = $2
      where courses.id = $1`,
      {
        bind: [req.params.uid, req.user.uid],
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (result.length === 0) {
      return res.status(404).json({error: "CourseNotFound"});
    }

    let found = result[0];

    if (found.is_student) {
      return res.json({type: "AlreadyEnrolled"});
    }

    if (found.is_registered) {
      return res.json({type: "AlreadyRegistered"});
    }

    if (found.enrolling) {
      if (found.auto_enroll) {
        // auto register to course

        // currently there is not a model for "CourseRoster" so I am going to
        // just insert this manually.
        await sequelize.query(
          `
          insert into "CourseRoster" ("courseId", "userUid", "createdAt", "updatedAt") values
          ($1, $2, $3, $3)`,
          {
            bind: [req.params.uid, req.user.uid, new Date()],
            type: QueryTypes.INSERT,
            transaction
          }
        );

        let course = await getStudentCourse(req.params.uid, transaction);

        if (course == null) {
          throw new Error("the course was not found when it was found?");
        }

        return res.json({
          type: "Enrolled",
          ...course,
        });
      } else {
        // request registration
        await CourseRegistration.create(
          {
            courseId: req.params.uid,
            userUid: req.user.uid,
          },
          { transaction }
        );

        return res.json({type: "Registered"});
      }
    } else {
      return res.status(404).json({error: "CourseNotFound"});
    }
  });
}));

export default courseRouter;
