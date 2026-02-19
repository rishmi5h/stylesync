import { useState } from 'react';
import { generateOutfitIdeas } from '../services/api';
import { getWardrobe, getProfile, getOutfitPlan, saveOutfitPlan } from '../utils/storage';
import OutfitCard from './OutfitCard';

const loadingPhrases = [
  'Mixing and matching...',
  'Finding combos...',
  'Creating looks...',
  'Almost there...',
];

const occasionFilters = [
  { value: 'any', label: 'All' },
  { value: 'office', label: 'Office' },
  { value: 'casual', label: 'Casual' },
  { value: 'college', label: 'College' },
  { value: 'date_night', label: 'Date' },
  { value: 'party', label: 'Party' },
  { value: 'festive', label: 'Festive' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'travel', label: 'Travel' },
];

const seasonFilters = [
  { value: 'all_season', label: 'All' },
  { value: 'summer', label: 'Summer' },
  { value: 'rainy', label: 'Monsoon' },
  { value: 'winter', label: 'Winter' },
];

const moodFilters = [
  { value: 'versatile', label: 'Any' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'comfort', label: 'Comfy' },
  { value: 'ethnic', label: 'Desi' },
  { value: 'fusion', label: 'Fusion' },
];

const vibeFilterOptions = [
  'all', 'casual_chill', 'office_ready', 'date_worthy', 'street_cool',
  'ethnic_elegant', 'indo_western', 'weekend_brunch', 'party_mode',
  'travel_comfy', 'festive_glam',
];

const vibeLabels = {
  all: 'All', casual_chill: 'Casual', office_ready: 'Office', date_worthy: 'Date',
  street_cool: 'Street', ethnic_elegant: 'Ethnic', indo_western: 'Fusion',
  weekend_brunch: 'Brunch', party_mode: 'Party', travel_comfy: 'Travel', festive_glam: 'Festive',
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
      saveOutfitPlan(result.outfits);
      setOutfits(result.outfits);
    } catch (err) {
      setError(err.message || 'Failed to generate.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const filteredOutfits = outfits && Array.isArray(outfits)
    ? activeVibeFilter === 'all' ? outfits : outfits.filter((o) => o.vibe === activeVibeFilter)
    : [];

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 2;
  const isReady = hasProfile && hasWardrobe;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold section-heading">Outfit Ideas</h2>
          <p className="text-text-muted text-xs mt-0.5">
            {outfits && outfits.length > 0 ? `${outfits.length} combos` : `${wardrobe.length} items`}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !isReady}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all btn-press ${
            isReady
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-surface-lighter text-text-muted cursor-not-allowed'
          }`}
        >
          {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Generate
        </button>
      </div>

      {/* Setup hints */}
      {!isReady && (
        <div className="mb-4 space-y-2">
          {!hasProfile && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-text-muted">Complete your profile</p>
              <button onClick={() => onNavigate('profile')} className="shrink-0 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium">Set Up</button>
            </div>
          )}
          {!hasWardrobe && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xs text-text-muted">Add {Math.max(0, 2 - wardrobe.length)} more item{2 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium">Add</button>
            </div>
          )}
        </div>
      )}

      {/* Filters — horizontal scrollable on mobile */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted w-12 shrink-0">Occasion</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {occasionFilters.map((f) => (
              <button key={f.value} onClick={() => setFilters({ ...filters, occasion: f.value })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filters.occasion === f.value ? 'bg-primary text-white' : 'bg-surface-light text-text-muted border border-surface-lighter'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted w-12 shrink-0">Season</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {seasonFilters.map((f) => (
              <button key={f.value} onClick={() => setFilters({ ...filters, season: f.value })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filters.season === f.value ? 'bg-primary text-white' : 'bg-surface-light text-text-muted border border-surface-lighter'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted w-12 shrink-0">Mood</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {moodFilters.map((f) => (
              <button key={f.value} onClick={() => setFilters({ ...filters, mood: f.value })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filters.mood === f.value ? 'bg-primary text-white' : 'bg-surface-light text-text-muted border border-surface-lighter'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
          {error}<button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-text-muted animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {!loading && outfits && Array.isArray(outfits) && outfits.length > 0 && (
        <>
          {/* Vibe tabs — scrollable */}
          <div className="mb-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {vibeFilterOptions.map((v) => {
              const count = v === 'all' ? outfits.length : outfits.filter((o) => o.vibe === v).length;
              if (v !== 'all' && count === 0) return null;
              return (
                <button key={v} onClick={() => setActiveVibeFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeVibeFilter === v ? 'bg-primary text-white' : 'bg-surface-light text-text-muted border border-surface-lighter'
                  }`}>{vibeLabels[v]} ({count})</button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredOutfits.map((outfit, i) => (
              <div key={i} className="card-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <OutfitCard outfit={outfit} />
              </div>
            ))}
          </div>

          {filteredOutfits.length === 0 && (
            <p className="text-center text-text-muted text-xs py-8">No matches.</p>
          )}
        </>
      )}

      {!loading && (!outfits || outfits.length === 0) && (
        <div className="text-center py-14">
          <p className="text-xs text-text-muted">Generate to discover outfit combos from your wardrobe.</p>
        </div>
      )}
    </div>
  );
}
