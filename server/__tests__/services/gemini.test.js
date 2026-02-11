import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock generate content function
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

// Mock the @google/generative-ai module — use a class so `new` works
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
      constructor() {}
      getGenerativeModel(...args) {
        return mockGetGenerativeModel(...args);
      }
    },
  };
});

describe('classifyItem', () => {
  const validClassification = {
    category: 'top',
    subcategory: 'crew-neck t-shirt',
    color: 'navy blue',
    pattern: 'solid',
    fabric_guess: 'pure cotton',
    formality: 'casual',
    season: 'all_season',
    weather_suitability: 'Good for AC offices and mild weather',
    fit: 'regular',
    condition: 'good',
    versatility: 4,
    occasion_tags: ['daily_wear', 'college', 'casual_outing'],
    care_tip: 'Machine wash cold',
    description: 'Navy blue cotton crew-neck tee',
  };

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
    // Reset module cache so gemini.js re-evaluates with the new env
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns valid classification with all required fields', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(validClassification),
      },
    });

    const { classifyItem } = await import('../../services/gemini.js');
    const result = await classifyItem('base64data', 'image/jpeg');

    expect(result).toMatchObject({
      category: 'top',
      subcategory: 'crew-neck t-shirt',
      color: 'navy blue',
    });
  });

  it('strips markdown fences from response', async () => {
    const responseWithFences = '```json\n' + JSON.stringify(validClassification) + '\n```';
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => responseWithFences,
      },
    });

    const { classifyItem } = await import('../../services/gemini.js');
    const result = await classifyItem('base64data', 'image/jpeg');
    expect(result.category).toBe('top');
  });

  it('normalizes invalid categories using category map', async () => {
    const withInvalidCategory = { ...validClassification, category: 'shirt' };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(withInvalidCategory),
      },
    });

    const { classifyItem } = await import('../../services/gemini.js');
    const result = await classifyItem('base64data', 'image/jpeg');
    expect(result.category).toBe('top');
  });

  it('normalizes kurta to ethnic_top', async () => {
    const withKurta = { ...validClassification, category: 'kurta' };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(withKurta),
      },
    });

    const { classifyItem } = await import('../../services/gemini.js');
    const result = await classifyItem('base64data', 'image/jpeg');
    expect(result.category).toBe('ethnic_top');
  });

  it('falls back to accessory for unknown categories', async () => {
    const withUnknown = { ...validClassification, category: 'xyzunknown' };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(withUnknown),
      },
    });

    const { classifyItem } = await import('../../services/gemini.js');
    const result = await classifyItem('base64data', 'image/jpeg');
    expect(result.category).toBe('accessory');
  });

  it('throws when API key is missing', async () => {
    vi.unstubAllEnvs();
    // Don't set GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY;

    const { classifyItem } = await import('../../services/gemini.js');
    await expect(classifyItem('base64data', 'image/jpeg')).rejects.toThrow(/API key/i);
  });
});
