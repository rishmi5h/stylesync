import { Router } from 'express';

const router = Router();

const weatherCodeDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function getWeather(city) {
  // Step 1: Geocode the city name
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const geoResponse = await fetch(geoUrl);
  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  // Step 2: Fetch 7-day forecast
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`;
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  const daily = forecastData.daily;
  const forecast = daily.time.map((date, i) => ({
    date,
    temp_max: daily.temperature_2m_max[i],
    temp_min: daily.temperature_2m_min[i],
    precipitation_chance: daily.precipitation_probability_max[i],
    weathercode: daily.weathercode[i],
    weather_summary: `${weatherCodeDescriptions[daily.weathercode[i]] || 'Unknown'}, ${daily.temperature_2m_min[i]}°C - ${daily.temperature_2m_max[i]}°C`,
  }));

  return {
    location: { name, country, latitude, longitude },
    forecast,
  };
}

router.get('/', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ success: false, error: 'City parameter is required. Use ?city=CityName' });
    }

    const weatherData = await getWeather(city);

    return res.json({ success: true, ...weatherData });
  } catch (error) {
    console.error('Weather error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weather data. Please try again.',
    });
  }
});

export default router;
