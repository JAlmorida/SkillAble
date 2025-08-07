import express from "express";
import upload from "../utils/multer.js"
import { uploadMedia } from "../utils/cloudinary.js";
import path from "path";
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.route("/upload-video").post(upload.single("file"), async(req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    const result = await uploadMedia(req.file);
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: result
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error uploading file"
    });
  }
})

// POST /api/v1/media/upload-resource
router.post('/upload-resource', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // You may want to upload to cloud storage and return a public URL instead
  const fileUrl = `http://170.64.236.0:8080/uploads/${req.file.filename}`;
  res.json({
    success: true,
    data: { secure_url: fileUrl },
    message: 'Resource uploaded successfully'
  });
});

export default router;
