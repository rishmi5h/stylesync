import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/createApp.js';

describe('Health & Root endpoints', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('GET /api/health', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('returns a valid ISO timestamp', async () => {
      const res = await request(app).get('/api/health');
      const date = new Date(res.body.timestamp);
      expect(date.toISOString()).toBe(res.body.timestamp);
    });
  });

  describe('GET /', () => {
    it('returns API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        name: 'StyleSync API',
        version: '1.0.0',
        status: 'running',
      });
    });
  });
});
