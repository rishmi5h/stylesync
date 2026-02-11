import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/createApp.js';

// Mock the groq service
vi.mock('../../services/groq.js', () => ({
  extractJSON: vi.fn(),
  buildWardrobeSummary: vi.fn(),
  generateOutfitIdeas: vi.fn(),
  generateRecommendations: vi.fn(),
}));

const { generateOutfitIdeas } = await import('../../services/groq.js');

describe('POST /api/outfits', () => {
  let app;

  const validWardrobe = [
    { id: '1', category: 'top', color: 'navy', subcategory: 'crew-neck t-shirt' },
    { id: '2', category: 'bottom', color: 'blue', subcategory: 'slim jeans' },
    { id: '3', category: 'footwear', color: 'white', subcategory: 'sneakers' },
  ];

  const validProfile = {
    gender: 'male',
    style: 'casual',
    location: 'Mumbai',
  };

  beforeAll(async () => {
    // Import the real router (which uses the mocked service)
    const { default: outfitsRouter } = await import('../../routes/outfits.js');
    app = await createApp({ '/api/outfits': outfitsRouter });
  });

  beforeEach(() => {
    generateOutfitIdeas.mockReset();
  });

  it('returns 400 when wardrobe is missing', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .send({ profile: validProfile });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/wardrobe/i);
  });

  it('returns 400 when wardrobe is an empty array', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .send({ wardrobe: [], profile: validProfile });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when wardrobe is not an array', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .send({ wardrobe: 'not-an-array', profile: validProfile });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when profile is missing', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .send({ wardrobe: validWardrobe });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/profile/i);
  });

  it('returns 200 with outfits on valid request', async () => {
    const mockOutfits = [
      { outfit_name: 'The Monday Minimalist', vibe: 'office_ready', items: {} },
    ];
    generateOutfitIdeas.mockResolvedValueOnce(mockOutfits);

    const res = await request(app)
      .post('/api/outfits')
      .send({ wardrobe: validWardrobe, profile: validProfile });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.outfits).toEqual(mockOutfits);
  });

  it('passes filters to the service', async () => {
    generateOutfitIdeas.mockResolvedValueOnce([]);

    const filters = { occasion: 'office', season: 'summer', mood: 'office_ready' };
    await request(app)
      .post('/api/outfits')
      .send({ wardrobe: validWardrobe, profile: validProfile, filters });

    expect(generateOutfitIdeas).toHaveBeenCalledWith(validWardrobe, validProfile, filters);
  });

  it('returns 500 when service throws', async () => {
    generateOutfitIdeas.mockRejectedValueOnce(new Error('Groq API failed'));

    const res = await request(app)
      .post('/api/outfits')
      .send({ wardrobe: validWardrobe, profile: validProfile });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
