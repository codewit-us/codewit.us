import { Router } from 'express';
import multer from 'multer';
import { importExercisesCsv } from '../controllers/exerciseImport';
import { checkAdmin } from '../middleware/auth';
import { asyncHandle } from '../middleware/catch';

const upload = multer({
  storage: multer.memoryStorage(),
  // 5 MB file size limit
  limits : { fileSize: 5 * 1024 * 1024 }
});

const router = Router();

router.post(
  '/import-csv',
  checkAdmin,
  upload.single('file'),
  asyncHandle(importExercisesCsv)
);

export default router;