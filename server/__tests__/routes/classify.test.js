import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/createApp.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Mock the gemini service
vi.mock('../../services/gemini.js', () => ({
  classifyItem: vi.fn(),
}));

const { classifyItem } = await import('../../services/gemini.js');

describe('POST /api/classify', () => {
  let app;

  const mockClassification = {
    category: 'top',
    subcategory: 'crew-neck t-shirt',
    color: 'navy blue',
    pattern: 'solid',
    fabric_guess: 'pure cotton',
    formality: 'casual',
    season: 'all_season',
    description: 'Navy cotton tee',
  };

  beforeAll(async () => {
    const { default: classifyRouter } = await import('../../routes/classify.js');
    app = await createApp({ '/api/classify': classifyRouter });
  });

  beforeEach(() => {
    classifyItem.mockReset();
  });

  it('returns 400 when no image file is provided', async () => {
    const res = await request(app).post('/api/classify');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/no image/i);
  });

  it('returns 200 with classification on valid image upload', async () => {
    classifyItem.mockResolvedValueOnce(mockClassification);

    // Create a small fake image buffer (1x1 pixel PNG)
    const fakeImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/classify')
      .attach('image', fakeImageBuffer, 'test.png');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.classification).toEqual(mockClassification);
    expect(classifyItem).toHaveBeenCalledOnce();
  });

  it('passes base64 image data and mime type to service', async () => {
    classifyItem.mockResolvedValueOnce(mockClassification);

    const fakeImageBuffer = Buffer.from('fake-image-data');

    await request(app)
      .post('/api/classify')
      .attach('image', fakeImageBuffer, 'test.jpg');

    expect(classifyItem).toHaveBeenCalledWith(
      expect.any(String), // base64 data
      expect.stringMatching(/image/) // mime type
    );
  });

  it('returns 500 when service throws', async () => {
    classifyItem.mockRejectedValueOnce(new Error('Gemini API failed'));

    const fakeImageBuffer = Buffer.from('fake-image-data');

    const res = await request(app)
      .post('/api/classify')
      .attach('image', fakeImageBuffer, 'test.png');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
