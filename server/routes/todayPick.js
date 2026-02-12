import { Router } from 'express';
import { generateTodayPick } from '../services/groq.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { wardrobe, profile, weather, wearHistory, rejectedPicks } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wardrobe is required and must be a non-empty array of clothing items.',
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: 'Profile is required to generate your daily outfit pick.',
      });
    }

    const outfit = await generateTodayPick(
      wardrobe,
      profile,
      weather || null,
      wearHistory || [],
      rejectedPicks || []
    );

    return res.json({ success: true, outfit });
  } catch (error) {
    console.error('Today\'s Pick error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate today\'s outfit pick. Please try again.',
    });
  }
});

export default router;
