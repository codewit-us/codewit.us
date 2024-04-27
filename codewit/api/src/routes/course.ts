import { Router } from 'express';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  updateCourse,
} from '../controllers/course';
import { fromZodError } from 'zod-validation-error';
import { createCourseSchema, updateCourseSchema } from '@codewit/validations';

const courseRouter = Router();

courseRouter.get('/', async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

courseRouter.get('/:uid', async (req, res) => {
  try {
    const course = await getCourse(req.params.uid);
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

courseRouter.post('/', async (req, res) => {
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

courseRouter.patch('/:uid', async (req, res) => {
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

courseRouter.delete('/:uid', async (req, res) => {
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
