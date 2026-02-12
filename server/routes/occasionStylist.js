import { Router } from 'express';
import { generateOccasionOutfits } from '../services/groq.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { wardrobe, profile, event } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wardrobe is required and must be a non-empty array of clothing items.',
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile is required to generate occasion-specific outfits.',
      });
    }

    if (!event || !event.type) {
      return res.status(400).json({
        success: false,
        error: 'Event details with at least an event type are required.',
      });
    }

    const outfits = await generateOccasionOutfits(wardrobe, profile, event);

    return res.json({ success: true, outfits });
  } catch (error) {
    console.error('Occasion Stylist error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate occasion outfits. Please try again.',
    });
  }
});

export default router;
