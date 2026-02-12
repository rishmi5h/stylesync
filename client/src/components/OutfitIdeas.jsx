import { useState } from 'react';
import { generateOutfitIdeas } from '../services/api';
import { getWardrobe, getProfile, getOutfitPlan, saveOutfitPlan } from '../utils/storage';
import OutfitCard from './OutfitCard';

const loadingPhrases = [
  'Mixing and matching...',
  'Applying color theory...',
  'Finding combos...',
  'AI stylist is thinking...',
  'Creating looks...',
  'Almost there...',
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
      setError(err.message || 'Failed to generate. Please try again.');
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

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 2;
  const isReady = hasProfile && hasWardrobe;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Outfit Ideas</h2>
        <p className="text-text-muted text-sm mt-1">
          {outfits && outfits.length > 0
            ? `${outfits.length} combos from ${wardrobe.length} items`
            : `Discover looks from your ${wardrobe.length} items`
          }
        </p>
      </div>

      {/* Setup hints — compact */}
      {!isReady && (
        <div className="mb-6 space-y-2">
          {!hasProfile && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-text-muted">Set up your profile first</p>
              <button onClick={() => onNavigate('profile')} className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors">
                Set Up
              </button>
            </div>
          )}
          {!hasWardrobe && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-sm text-text-muted">Add {Math.max(0, 2 - wardrobe.length)} more item{2 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium transition-colors">
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
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
          disabled={loading || !isReady}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            isReady
              ? 'bg-primary hover:bg-primary-dark disabled:opacity-50 text-white shadow-primary/20'
              : 'bg-surface-lighter text-text-muted cursor-not-allowed shadow-none'
          }`}
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
          <div className="w-14 h-14 border-3 border-primary border-t-transparent rounded-full animate-spin mb-5" />
          <p className="text-sm font-medium animate-pulse">{loadingMsg}</p>
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
            <p className="text-center text-text-muted text-sm py-10">No outfits match this filter.</p>
          )}
        </>
      )}

      {!loading && (!outfits || outfits.length === 0) && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-light flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">Discover what you can wear</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Set your filters and generate — AI finds every combo from your wardrobe.
          </p>
        </div>
      )}
    </div>
  );
}
