import { Router } from 'express';
import multer from 'multer';
import { importExercises } from '../controllers/courseImport';
import { checkAdmin } from '../middleware/auth';
import { asyncHandle } from '../middleware/catch';

const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: 5 * 1024 * 1024 }
});

const router = Router();

router.post(
  '/courses/:courseId/import-exercises',
  checkAdmin,
  upload.single('file'),
  asyncHandle(importExercises)
);

export default router;