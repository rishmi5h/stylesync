import { Router } from 'express';
import multer from 'multer';
import { classifyItem } from '../services/gemini.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const classification = await classifyItem(imageBase64, mimeType);

    return res.json({ success: true, classification });
  } catch (error) {
    console.error('Classification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to classify the clothing item. Please try again.',
    });
  }
});

export default router;
