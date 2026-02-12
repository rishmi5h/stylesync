import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env for local dev — Railway sets env vars directly
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '.env') });

const { default: express } = await import('express');
const { default: cors } = await import('cors');
const { default: classifyRouter } = await import('./routes/classify.js');
const { default: outfitsRouter } = await import('./routes/outfits.js');
const { default: recommendRouter } = await import('./routes/recommend.js');
const { default: weatherRouter } = await import('./routes/weather.js');
const { default: todayPickRouter } = await import('./routes/todayPick.js');
const { default: occasionStylistRouter } = await import('./routes/occasionStylist.js');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow Netlify frontend + localhost for dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    // In production, also allow any netlify.app subdomain
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now — tighten after deploy
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/classify', classifyRouter);
app.use('/api/outfits', outfitsRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/today-pick', todayPickRouter);
app.use('/api/occasion-stylist', occasionStylistRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ name: 'StyleSync API', version: '1.0.0', status: 'running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StyleSync server running on port ${PORT}`);
});
