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

const { generateRecommendations } = await import('../../services/groq.js');

describe('POST /api/recommend', () => {
  let app;

  const validWardrobe = [
    { id: '1', category: 'top', color: 'navy' },
    { id: '2', category: 'bottom', color: 'blue' },
  ];

  const validProfile = {
    gender: 'male',
    style: 'casual',
    location: 'Delhi',
  };

  beforeAll(async () => {
    const { default: recommendRouter } = await import('../../routes/recommend.js');
    app = await createApp({ '/api/recommend': recommendRouter });
  });

  beforeEach(() => {
    generateRecommendations.mockReset();
  });

  it('returns 400 when wardrobe is missing', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({ profile: validProfile });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/wardrobe/i);
  });

  it('returns 400 when wardrobe is empty', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({ wardrobe: [], profile: validProfile });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when profile is missing', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({ wardrobe: validWardrobe });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/profile/i);
  });

  it('returns 200 with recommendations on valid request', async () => {
    const mockResult = {
      wardrobe_analysis: { strengths: 'Good basics', gaps: 'Need ethnic wear' },
      recommendations: [
        { item_type: 'kurta', description: 'A cotton kurta', why: 'Fills ethnic gap' },
      ],
    };
    generateRecommendations.mockResolvedValueOnce(mockResult);

    const res = await request(app)
      .post('/api/recommend')
      .send({ wardrobe: validWardrobe, profile: validProfile });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.wardrobe_analysis).toBeDefined();
    expect(res.body.recommendations).toBeDefined();
  });

  it('returns 500 when service throws', async () => {
    generateRecommendations.mockRejectedValueOnce(new Error('Service error'));

    const res = await request(app)
      .post('/api/recommend')
      .send({ wardrobe: validWardrobe, profile: validProfile });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
