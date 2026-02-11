import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to control import.meta.env.VITE_API_URL per test,
// so we'll use dynamic imports with vi.stubEnv

describe('API service', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
  });

  describe('classifyItem', () => {
    it('sends POST with FormData to /api/classify', async () => {
      const mockResponse = { success: true, classification: { category: 'top' } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { classifyItem } = await import('../../services/api.js');
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' });
      const result = await classifyItem(file);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/classify'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws on non-ok response with error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const { classifyItem } = await import('../../services/api.js');
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' });

      await expect(classifyItem(file)).rejects.toThrow('Server error');
    });

    it('throws "Unable to reach the server" on network failure', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const { classifyItem } = await import('../../services/api.js');
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' });

      await expect(classifyItem(file)).rejects.toThrow('Unable to reach the server');
    });

    it('throws generic error on non-ok response without error field', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      const { classifyItem } = await import('../../services/api.js');
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' });

      await expect(classifyItem(file)).rejects.toThrow('Classification failed with status 404');
    });
  });

  describe('generateOutfitIdeas', () => {
    it('sends POST with correct JSON body', async () => {
      const mockResponse = { success: true, outfits: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { generateOutfitIdeas } = await import('../../services/api.js');
      const wardrobe = [{ id: '1', category: 'top' }];
      const profile = { gender: 'male' };
      const filters = { occasion: 'office' };

      const result = await generateOutfitIdeas(wardrobe, profile, filters);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/outfits'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wardrobe, profile, filters }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Wardrobe required' }),
      });

      const { generateOutfitIdeas } = await import('../../services/api.js');
      await expect(
        generateOutfitIdeas([], {})
      ).rejects.toThrow('Wardrobe required');
    });
  });

  describe('generateRecommendations', () => {
    it('sends POST with wardrobe and profile', async () => {
      const mockResponse = { success: true, recommendations: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { generateRecommendations } = await import('../../services/api.js');
      const wardrobe = [{ id: '1' }];
      const profile = { style: 'casual' };

      const result = await generateRecommendations(wardrobe, profile);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/recommend'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ wardrobe, profile }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWeather', () => {
    it('sends GET with city query param', async () => {
      const mockResponse = { success: true, forecast: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { getWeather } = await import('../../services/api.js');
      const result = await getWeather('Mumbai');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/weather?city=Mumbai')
      );
      expect(result).toEqual(mockResponse);
    });

    it('encodes city name with special characters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { getWeather } = await import('../../services/api.js');
      await getWeather('New Delhi');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('New%20Delhi')
      );
    });

    it('throws on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'City required' }),
      });

      const { getWeather } = await import('../../services/api.js');
      await expect(getWeather('')).rejects.toThrow('City required');
    });
  });
});
