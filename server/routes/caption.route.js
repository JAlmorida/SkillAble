import express from 'express';
import multer from 'multer';
import { generateCaption, getCaption } from '../controllers/caption.controller.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.post('/caption', upload.single('video'), generateCaption);
router.get('/caption', getCaption);

export default router;
