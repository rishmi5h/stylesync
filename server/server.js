import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const { default: express } = await import('express');
const { default: cors } = await import('cors');
const { default: classifyRouter } = await import('./routes/classify.js');
const { default: outfitsRouter } = await import('./routes/outfits.js');
const { default: recommendRouter } = await import('./routes/recommend.js');
const { default: weatherRouter } = await import('./routes/weather.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/classify', classifyRouter);
app.use('/api/outfits', outfitsRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/weather', weatherRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`StyleSync server running on port ${PORT}`);
});
