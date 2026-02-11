import { Router } from 'express';
import { generateRecommendations } from '../services/groq.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { wardrobe, profile } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wardrobe is required and must be a non-empty array of clothing items.',
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile is required to generate personalized recommendations.',
      });
    }

    const result = await generateRecommendations(wardrobe, profile);

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations. Please try again.',
    });
  }
});

export default router;
