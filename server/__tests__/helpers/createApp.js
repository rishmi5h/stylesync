import express from 'express';

/**
 * Creates an Express app with the same route mounting as server.js
 * but without CORS, dotenv, or listen() — for supertest.
 */
export async function createApp(routeMounts = {}) {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Mount provided routes
  for (const [path, router] of Object.entries(routeMounts)) {
    app.use(path, router);
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root route
  app.get('/', (req, res) => {
    res.json({ name: 'StyleSync API', version: '1.0.0', status: 'running' });
  });

  return app;
}
