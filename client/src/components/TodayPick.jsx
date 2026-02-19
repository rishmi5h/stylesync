import { useState, useEffect, useRef } from 'react';
import { getWardrobe, getProfile, getWearHistory, getTodayPick, saveTodayPick, addWearEntry } from '../utils/storage';
import { getTodayPick as fetchTodayPick, getWeather } from '../services/api';
import OutfitCard from './OutfitCard';

const loadingMessages = [
  'Checking the weather...',
  'Scanning your wardrobe...',
  'Picking the perfect outfit...',
  'Almost ready...',
];

export default function TodayPick({ onNavigate }) {
  const [outfit, setOutfit] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
  const [error, setError] = useState('');
  const [worn, setWorn] = useState(false);
  const [rejectedPicks, setRejectedPicks] = useState([]);

  const wardrobe = getWardrobe();
  const profile = getProfile();
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayOccasion = profile?.schedule?.[dayName.toLowerCase()] || 'casual';

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 3;
  const isReady = hasProfile && hasWardrobe;

  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const cached = getTodayPick();
    if (cached?.outfit) {
      setOutfit(cached.outfit);
      setReasoning(cached.outfit.reasoning || '');
    }
  }, []);

  const fetchWeatherData = async () => {
    if (!profile?.location) return null;
    try {
      const data = await getWeather(profile.location);
      if (data.success && data.forecast?.length > 0) return data.forecast[0];
    } catch { /* optional */ }
    return null;
  };

  const generatePick = async (rejected = []) => {
    setLoading(true);
    setError('');
    setWorn(false);
    try {
      const weatherData = await fetchWeatherData();
      setWeather(weatherData);
      const wearHistory = getWearHistory();
      const result = await fetchTodayPick(wardrobe, profile, weatherData, wearHistory, rejected);
      if (result.success && result.outfit) {
        setOutfit(result.outfit);
        setReasoning(result.outfit.reasoning || '');
        saveTodayPick(result.outfit);
      } else {
        throw new Error('Could not generate a pick');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const newRejected = outfit ? [...rejectedPicks, outfit] : rejectedPicks;
    setRejectedPicks(newRejected);
    generatePick(newRejected);
  };

  const handleWoreIt = () => {
    if (!outfit) return;
    const itemIds = [];
    const items = outfit.items || {};
    if (items.top) itemIds.push(items.top.item_id);
    if (items.bottom) itemIds.push(items.bottom.item_id);
    if (items.footwear) itemIds.push(items.footwear.item_id);
    if (items.outerwear) itemIds.push(items.outerwear.item_id);
    if (items.accessories) items.accessories.forEach((a) => itemIds.push(a.item_id));
    addWearEntry(itemIds.filter(Boolean), outfit.outfit_name);
    setWorn(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Today's Pick</h2>
          <p className="text-xs text-text-muted mt-0.5">{dayName}, {dateStr}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
            {todayOccasion.replace(/_/g, ' ')}
          </span>
          {weather && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
              {weather.temp_min}–{weather.temp_max}°C
            </span>
          )}
        </div>
      </div>

      {/* Setup hints */}
      {!isReady && !outfit && !loading && (
        <div className="mb-4 space-y-2">
          {!hasProfile && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-text-muted">Complete your profile</p>
              <button onClick={() => onNavigate('profile')} className="shrink-0 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium">Set Up</button>
            </div>
          )}
          {!hasWardrobe && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xs text-text-muted">Add {3 - wardrobe.length} more item{3 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium">Add</button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!outfit && !loading && (
        <div className="flex flex-col items-center text-center py-12 sm:py-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-6 animate-float">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Ready for your outfit?</h3>
          <p className="text-sm text-text-muted max-w-xs mb-8">
            {isReady
              ? "We'll pick the perfect outfit based on your style, wardrobe, and today's weather."
              : "Complete your profile and add some clothes to get started."}
          </p>
          <button
            onClick={() => generatePick([])}
            disabled={!isReady}
            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all btn-press ${
              isReady
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed'
            }`}
          >
            {isReady ? "Get Today's Pick" : "Complete Setup First"}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-text-muted">{loadingMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20">
          <p className="text-xs text-danger">{error}</p>
          <button onClick={() => generatePick(rejectedPicks)} className="mt-1 text-xs text-danger/80 hover:text-danger underline">Try again</button>
        </div>
      )}

      {/* Outfit display */}
      {outfit && !loading && (
        <div className="space-y-3">
          <OutfitCard outfit={outfit} reasoning={reasoning} />

          <div className="flex gap-2">
            <button
              onClick={handleWoreIt}
              disabled={worn}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all btn-press ${
                worn ? 'bg-success/15 text-success' : 'bg-success/10 hover:bg-success/20 text-success border border-success/20'
              }`}
            >
              {worn ? 'Logged!' : 'Wore it'}
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-lighter hover:bg-surface-lighter/80 text-text-muted btn-press"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
