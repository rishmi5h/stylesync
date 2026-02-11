import { useState } from 'react';
import { generateOutfitIdeas } from '../services/api';
import { getWardrobe, getProfile, getOutfitPlan, saveOutfitPlan } from '../utils/storage';
import OutfitCard from './OutfitCard';

const loadingPhrases = [
  'Mixing and matching your wardrobe...',
  'Applying color theory magic...',
  'Finding the perfect combos...',
  'Your AI stylist is thinking...',
  'Creating looks you\'ll love...',
  'Almost there, curating fire outfits...',
];

const occasionFilters = [
  { value: 'any', label: 'All' },
  { value: 'office', label: 'Office' },
  { value: 'casual', label: 'Casual' },
  { value: 'college', label: 'College' },
  { value: 'date_night', label: 'Date Night' },
  { value: 'party', label: 'Party' },
  { value: 'festive', label: 'Festive' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'travel', label: 'Travel' },
];

const seasonFilters = [
  { value: 'all_season', label: 'All Seasons' },
  { value: 'summer', label: 'Summer' },
  { value: 'rainy', label: 'Monsoon' },
  { value: 'winter', label: 'Winter' },
];

const moodFilters = [
  { value: 'versatile', label: 'All Vibes' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold & Trendy' },
  { value: 'comfort', label: 'Comfort First' },
  { value: 'ethnic', label: 'Desi Vibes' },
  { value: 'fusion', label: 'Indo-Western' },
];

const vibeFilterOptions = [
  'all', 'casual_chill', 'office_ready', 'date_worthy', 'street_cool',
  'ethnic_elegant', 'indo_western', 'weekend_brunch', 'party_mode',
  'travel_comfy', 'festive_glam',
];

const vibeLabels = {
  all: 'All',
  casual_chill: 'Casual',
  office_ready: 'Office',
  date_worthy: 'Date',
  street_cool: 'Street',
  ethnic_elegant: 'Ethnic',
  indo_western: 'Indo-Western',
  weekend_brunch: 'Brunch',
  party_mode: 'Party',
  travel_comfy: 'Travel',
  festive_glam: 'Festive',
};

export default function OutfitIdeas({ onNavigate }) {
  const [outfits, setOutfits] = useState(() => getOutfitPlan());
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ occasion: 'any', season: 'all_season', mood: 'versatile' });
  const [activeVibeFilter, setActiveVibeFilter] = useState('all');

  const wardrobe = getWardrobe();
  const profile = getProfile();

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setActiveVibeFilter('all');

    let msgIndex = 0;
    setLoadingMsg(loadingPhrases[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingPhrases.length;
      setLoadingMsg(loadingPhrases[msgIndex]);
    }, 2500);

    try {
      const result = await generateOutfitIdeas(wardrobe, profile, filters);
      const ideas = result.outfits;
      saveOutfitPlan(ideas);
      setOutfits(ideas);
    } catch (err) {
      setError(err.message || 'Failed to generate outfit ideas. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const filteredOutfits = outfits && Array.isArray(outfits)
    ? activeVibeFilter === 'all'
      ? outfits
      : outfits.filter((o) => o.vibe === activeVibeFilter)
    : [];

  if (!profile) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Set up your style profile first</h3>
        <p className="text-text-muted text-sm mb-6">We need to know your style preferences to generate outfit ideas.</p>
        <button
          onClick={() => onNavigate('profile')}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
        >
          Go to Style Profile
        </button>
      </div>
    );
  }

  if (wardrobe.length < 2) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Add items to your wardrobe</h3>
        <p className="text-text-muted text-sm mb-6">
          You need at least 2 items to generate outfit ideas. You have {wardrobe.length}.
        </p>
        <button
          onClick={() => onNavigate('wardrobe')}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
        >
          Go to Wardrobe
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Outfit Ideas</h2>
        <p className="text-text-muted text-sm mt-1">
          {outfits && outfits.length > 0
            ? `${outfits.length} outfit combinations from your ${wardrobe.length} items`
            : `Discover all possible looks from your ${wardrobe.length} wardrobe items`
          }
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Occasion */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text-muted w-16 shrink-0">Occasion</span>
          <div className="flex flex-wrap gap-1.5">
            {occasionFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilters({ ...filters, occasion: f.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.occasion === f.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted hover:text-text border border-surface-lighter'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text-muted w-16 shrink-0">Season</span>
          <div className="flex flex-wrap gap-1.5">
            {seasonFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilters({ ...filters, season: f.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.season === f.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted hover:text-text border border-surface-lighter'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text-muted w-16 shrink-0">Mood</span>
          <div className="flex flex-wrap gap-1.5">
            {moodFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilters({ ...filters, mood: f.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.mood === f.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted hover:text-text border border-surface-lighter'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-primary/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          )}
          {outfits ? 'Generate New Ideas' : 'Generate Outfit Ideas'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-3 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-sm font-medium animate-pulse">{loadingMsg}</p>
          <p className="text-xs text-text-muted mt-2">This may take 15-30 seconds</p>
        </div>
      )}

      {!loading && outfits && Array.isArray(outfits) && outfits.length > 0 && (
        <>
          {/* Vibe filter tabs */}
          <div className="mb-6 flex flex-wrap gap-1.5">
            {vibeFilterOptions.map((v) => {
              const count = v === 'all' ? outfits.length : outfits.filter((o) => o.vibe === v).length;
              if (v !== 'all' && count === 0) return null;
              return (
                <button
                  key={v}
                  onClick={() => setActiveVibeFilter(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeVibeFilter === v
                      ? 'bg-accent text-black'
                      : 'bg-surface-light text-text-muted hover:text-text border border-surface-lighter'
                  }`}
                >
                  {vibeLabels[v]} ({count})
                </button>
              );
            })}
          </div>

          {/* Outfit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOutfits.map((outfit, i) => (
              <OutfitCard key={i} outfit={outfit} />
            ))}
          </div>

          {filteredOutfits.length === 0 && (
            <p className="text-center text-text-muted text-sm py-10">No outfits match this vibe filter.</p>
          )}
        </>
      )}

      {!loading && (!outfits || outfits.length === 0) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Discover what you can wear</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Select your filters above and hit generate. Our AI will find every stylish combination possible from your wardrobe.
          </p>
        </div>
      )}
    </div>
  );
}
