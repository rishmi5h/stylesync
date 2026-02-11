import { Router } from 'express';
import { generateOutfitIdeas } from '../services/groq.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { wardrobe, profile, filters } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wardrobe is required and must be a non-empty array of clothing items.',
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile is required to generate personalized outfits.',
      });
    }

    const outfits = await generateOutfitIdeas(wardrobe, profile, filters || {});

    return res.json({ success: true, outfits });
  } catch (error) {
    console.error('Outfit generation error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate outfit ideas. Please try again.',
    });
  }
});

export default router;
