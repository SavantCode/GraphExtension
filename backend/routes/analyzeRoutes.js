import express from 'express';
import analyzeController from '../controllers/analyzeController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// POST /api/analyze
router.post(
  '/analyze',
  upload.single('image'),
  analyzeController.analyzeChart
);

export default router;
