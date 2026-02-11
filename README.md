# StyleSync — AI Wardrobe Planner & Stylist

An AI-powered wardrobe planner built for Indian fashion. Upload photos of your clothes, get them auto-classified, discover outfit combinations, and receive smart purchase suggestions — all tailored to Indian weather, fabrics, and styles.

## Features

- **AI Wardrobe Classification** — Upload clothing images and get instant classification (category, color, fabric, pattern, formality, season, occasion tags) using Google Gemini Flash
- **Outfit Ideas** — Generate all possible outfit combinations from your wardrobe with filters for occasion, season, and mood
- **Smart Suggestions** — AI-powered purchase recommendations to fill wardrobe gaps, with INR pricing and links to Myntra/Amazon
- **India-Specific** — Supports Indian clothing types (kurta, saree, sherwani, churidar), fabrics (khadi, chanderi silk, georgette), patterns (bandhani, ikat, chikankari), and Indian seasons/weather
- **Style Profile** — Set your style preferences, gender, location, budget, and weekly schedule for personalized recommendations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Backend | Node.js, Express |
| AI (Vision) | Google Gemini 2.0 Flash |
| AI (Text) | Groq (Llama 3.3 70B) |
| Weather | Open-Meteo API (free) |
| Storage | localStorage |
| Deployment | Netlify (client) + Railway (server) |

## Project Structure

```
StyleSync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API client
│   │   ├── utils/          # localStorage helpers
│   │   └── App.jsx         # Main app
│   └── package.json
├── server/                 # Express backend
│   ├── routes/             # API endpoints
│   ├── services/           # Gemini & Groq integrations
│   ├── server.js           # Entry point
│   ├── Dockerfile          # Railway deployment
│   └── package.json
└── netlify.toml            # Netlify config
```

## Getting Started

### Prerequisites

- Node.js >= 18
- [Google Gemini API key](https://aistudio.google.com/apikey)
- [Groq API key](https://console.groq.com/keys)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/rishmi5h/stylesync.git
   cd stylesync
   ```

2. **Create `.env` at the repo root**
   ```env
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   ```

3. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Start both servers**
   ```bash
   # Terminal 1 — Backend (port 3001)
   cd server && npm run dev

   # Terminal 2 — Frontend (port 5173)
   cd client && npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classify` | Classify a clothing image (multipart form) |
| POST | `/api/outfits` | Generate outfit ideas from wardrobe |
| POST | `/api/recommend` | Get purchase recommendations |
| GET | `/api/weather?city=` | Fetch weather for a city |
| GET | `/api/health` | Health check |

## Deployment

**Frontend** — Deployed to [Netlify](https://netlify.com) from the `client/` directory.

**Backend** — Deployed to [Railway](https://railway.app) from the `server/` directory using Docker.

### Environment Variables

**Railway (server):**
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `CLIENT_URL` — your Netlify URL (for CORS)

**Netlify (client):**
- `VITE_API_URL` — your Railway URL (e.g., `https://stylesyncapi.rishmi5h.com`)

## Live Demo

- **App**: [stylesync.rishmi5h.com](https://stylesync.rishmi5h.com)
- **API**: [stylesyncapi.rishmi5h.com](https://stylesyncapi.rishmi5h.com)

## License

MIT
