import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/createApp.js';

describe('GET /api/weather', () => {
  let app;
  let originalFetch;

  beforeAll(async () => {
    const { default: weatherRouter } = await import('../../routes/weather.js');
    app = await createApp({ '/api/weather': weatherRouter });
  });

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns 400 when city param is missing', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/city/i);
  });

  it('returns weather data for a valid city', async () => {
    // Mock geocoding response
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [
            { latitude: 28.6, longitude: 77.2, name: 'New Delhi', country: 'India' },
          ],
        }),
      })
      // Mock forecast response
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          daily: {
            time: ['2025-01-20', '2025-01-21'],
            temperature_2m_max: [22, 24],
            temperature_2m_min: [10, 12],
            precipitation_probability_max: [5, 10],
            weathercode: [0, 1],
          },
        }),
      });

    const res = await request(app).get('/api/weather?city=Delhi');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.location).toEqual({
      name: 'New Delhi',
      country: 'India',
      latitude: 28.6,
      longitude: 77.2,
    });
    expect(res.body.forecast).toHaveLength(2);
    expect(res.body.forecast[0]).toHaveProperty('date', '2025-01-20');
    expect(res.body.forecast[0]).toHaveProperty('temp_max', 22);
    expect(res.body.forecast[0]).toHaveProperty('temp_min', 10);
    expect(res.body.forecast[0]).toHaveProperty('weather_summary');
  });

  it('handles city not found (no geocoding results)', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ results: undefined }),
    });

    const res = await request(app).get('/api/weather?city=Xyznotacity');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('encodes city name in URL', async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [
            { latitude: 19.0, longitude: 72.8, name: 'Mumbai', country: 'India' },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({
          daily: {
            time: ['2025-01-20'],
            temperature_2m_max: [32],
            temperature_2m_min: [24],
            precipitation_probability_max: [20],
            weathercode: [2],
          },
        }),
      });

    await request(app).get('/api/weather?city=New%20Delhi');

    // Verify the geocoding URL was called with encoded city
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('New%20Delhi')
    );
  });
});
