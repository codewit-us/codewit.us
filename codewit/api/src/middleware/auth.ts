import { Request, Response, NextFunction } from 'express';
import { sequelize } from '../models';
import { QueryTypes } from 'sequelize';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.redirect('/oauth2/google');
  } else {
    next();
  }
};

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.isAdmin !== true) {
    return res.status(401).json({ message: 'Unauthorized' });
  } else {
    next();
  }
};

// Ensure caller is admin OR instructor of the course in :uid / :courseId
const checkInstructorOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.redirect('/oauth2/google'); 
  if (req.user.isAdmin) return next();

  const courseId = (req.params.uid ?? req.params.courseId);
  if (!courseId) return res.status(400).json({ error: 'CourseIdMissing' });

  const [row] = await sequelize.query<{ is_instructor: boolean }>(`
    select "CourseInstructors"."userUid" is not null as is_instructor
    from courses
      left join "CourseInstructors"
        on courses.id = "CourseInstructors"."courseId"
       and "CourseInstructors"."userUid" = $2
    where courses.id = $1
  `, { bind: [courseId, req.user.uid], type: QueryTypes.SELECT });

  if (row?.is_instructor) return next();
  return res.status(403).json({ error: 'Forbidden' });
};

export { checkAuth, checkAdmin, checkInstructorOrAdmin };
