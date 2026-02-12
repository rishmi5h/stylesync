import { useState, useEffect } from 'react';
import { getWardrobe, getProfile } from '../utils/storage';
import { getOccasionOutfits } from '../services/api';
import OutfitCard from './OutfitCard';

const POPULAR_EVENTS = [
  { value: 'wedding_reception', label: 'Wedding Reception', emoji: '💒' },
  { value: 'sangeet', label: 'Sangeet', emoji: '💃' },
  { value: 'diwali_party', label: 'Diwali Party', emoji: '🪔' },
  { value: 'office_presentation', label: 'Office Presentation', emoji: '💼' },
  { value: 'first_date', label: 'First Date', emoji: '❤️' },
  { value: 'house_party', label: 'House Party', emoji: '🏠' },
];

const MORE_EVENTS = [
  { value: 'haldi', label: 'Haldi Ceremony', emoji: '🌼' },
  { value: 'mehendi', label: 'Mehendi', emoji: '🌿' },
  { value: 'engagement', label: 'Engagement', emoji: '💍' },
  { value: 'navratri_garba', label: 'Navratri / Garba', emoji: '🎊' },
  { value: 'eid_celebration', label: 'Eid Celebration', emoji: '🌙' },
  { value: 'holi_brunch', label: 'Holi Brunch', emoji: '🎨' },
  { value: 'pongal', label: 'Pongal / Onam', emoji: '🌾' },
  { value: 'christmas_party', label: 'Christmas Party', emoji: '🎄' },
  { value: 'client_meeting', label: 'Client Meeting', emoji: '🤝' },
  { value: 'office_party', label: 'Office Party', emoji: '🥂' },
  { value: 'job_interview', label: 'Job Interview', emoji: '📋' },
  { value: 'anniversary_dinner', label: 'Anniversary Dinner', emoji: '🌹' },
  { value: 'temple_visit', label: 'Temple / Puja Visit', emoji: '🛕' },
  { value: 'family_gathering', label: 'Family Gathering', emoji: '👨‍👩‍👧‍👦' },
  { value: 'college_farewell', label: 'College Farewell', emoji: '🎓' },
  { value: 'brunch', label: 'Weekend Brunch', emoji: '🥐' },
  { value: 'travel', label: 'Travel Day', emoji: '✈️' },
  { value: 'concert', label: 'Concert / Gig', emoji: '🎵' },
];

const ALL_EVENTS = [...POPULAR_EVENTS, ...MORE_EVENTS];

const VENUE_OPTIONS = ['Indoor', 'Outdoor', 'Rooftop', 'Restaurant', 'Banquet Hall', 'Temple', 'Club', 'Office', 'Home', 'Garden'];
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const FORMALITY_OPTIONS = ['Casual', 'Smart Casual', 'Semi-Formal', 'Formal', 'Traditional/Ethnic'];

const loadingMessages = [
  'Understanding the vibe...',
  'Matching your wardrobe...',
  'Crafting the looks...',
  'Adding styling tips...',
  'Almost done...',
];

export default function OccasionStylist({ onNavigate }) {
  const [event, setEvent] = useState({ type: '', venue: '', time: '', formality: '', notes: '' });
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const wardrobe = getWardrobe();
  const profile = getProfile();

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 3;
  const isReady = hasProfile && hasWardrobe;

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!event.type) return;
    setLoading(true);
    setError('');
    setOutfits([]);
    setGenerated(false);

    try {
      const result = await getOccasionOutfits(wardrobe, profile, event);
      if (result.success && result.outfits) {
        const sorted = Array.isArray(result.outfits)
          ? result.outfits.sort((a, b) => (a.rank || 0) - (b.rank || 0))
          : [result.outfits];
        setOutfits(sorted);
        setGenerated(true);
      } else {
        throw new Error('Could not generate occasion outfits');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEvent({ type: '', venue: '', time: '', formality: '', notes: '' });
    setOutfits([]);
    setGenerated(false);
    setError('');
    setShowMore(false);
    setShowDetails(false);
  };

  const selectedEvent = ALL_EVENTS.find((e) => e.value === event.type);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Occasion Stylist</h2>
      </div>

      {/* Setup hints */}
      {!isReady && !generated && !loading && (
        <div className="mb-4 space-y-2">
          {!hasProfile && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-text-muted">Complete your profile</p>
              <button onClick={() => onNavigate('profile')} className="shrink-0 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium">Set Up</button>
            </div>
          )}
          {!hasWardrobe && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xs text-text-muted">Add {Math.max(0, 3 - wardrobe.length)} more item{3 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium">Add</button>
            </div>
          )}
        </div>
      )}

      {/* Event form */}
      {!generated && (
        <div className="space-y-4">
          {/* Popular events */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-2">Occasion</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {POPULAR_EVENTS.map((et) => (
                <button
                  key={et.value}
                  onClick={() => setEvent({ ...event, type: et.value })}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    event.type === et.value
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-surface-light hover:bg-surface-lighter text-text-muted border border-surface-lighter'
                  }`}
                >
                  <span className="text-sm">{et.emoji}</span>
                  <span className="truncate">{et.label}</span>
                </button>
              ))}
            </div>

            {!showMore ? (
              <button onClick={() => setShowMore(true)} className="mt-2 text-xs text-primary hover:text-primary-light font-medium">
                + {MORE_EVENTS.length} more
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1.5">
                {MORE_EVENTS.map((et) => (
                  <button
                    key={et.value}
                    onClick={() => setEvent({ ...event, type: et.value })}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      event.type === et.value
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-surface-light hover:bg-surface-lighter text-text-muted border border-surface-lighter'
                    }`}
                  >
                    <span className="text-sm">{et.emoji}</span>
                    <span className="truncate">{et.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional details */}
          {event.type && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors mb-2"
              >
                <svg className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                Details (optional)
              </button>

              {showDetails && (
                <div className="space-y-3 animate-in">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Venue</label>
                      <select value={event.venue} onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                        className="w-full bg-surface-light border border-surface-lighter rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-primary/50">
                        <option value="">Any</option>
                        {VENUE_OPTIONS.map((v) => <option key={v} value={v.toLowerCase()}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Time</label>
                      <select value={event.time} onChange={(e) => setEvent({ ...event, time: e.target.value })}
                        className="w-full bg-surface-light border border-surface-lighter rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-primary/50">
                        <option value="">Any</option>
                        {TIME_OPTIONS.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Formality</label>
                      <select value={event.formality} onChange={(e) => setEvent({ ...event, formality: e.target.value })}
                        className="w-full bg-surface-light border border-surface-lighter rounded-lg px-2 py-2 text-xs text-text focus:outline-none focus:border-primary/50">
                        <option value="">Any</option>
                        {FORMALITY_OPTIONS.map((f) => <option key={f} value={f.toLowerCase()}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea value={event.notes} onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                    placeholder="e.g., Conservative family, might rain..."
                    className="w-full bg-surface-light border border-surface-lighter rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 resize-none h-14"
                  />
                </div>
              )}
            </div>
          )}

          {/* Generate button */}
          {event.type && (
            <button
              onClick={handleGenerate}
              disabled={loading || !isReady}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isReady
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-surface-lighter text-text-muted cursor-not-allowed'
              }`}
            >
              {isReady ? `Style Me` : 'Complete setup first'}
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-text-muted animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
          {error}<button onClick={handleGenerate} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Results */}
      {generated && outfits.length > 0 && !loading && (
        <div className="space-y-4">
          {/* Event summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{selectedEvent?.emoji}</span>
              <span className="text-xs font-semibold">{selectedEvent?.label}</span>
              <span className="text-xs text-text-muted ml-1">
                {[event.venue, event.time, event.formality].filter(Boolean).join(' · ')}
              </span>
            </div>
            <button onClick={handleReset} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-lighter hover:bg-surface-lighter/80 text-text-muted">
              New
            </button>
          </div>

          {/* Outfit cards */}
          {outfits.map((outfit, idx) => (
            <div key={idx} className="space-y-2">
              {/* Rank + score inline */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  idx === 0 ? 'bg-amber-500/15 text-amber-400' :
                  idx === 1 ? 'bg-slate-400/15 text-slate-400' :
                  'bg-orange-700/15 text-orange-400'
                }`}>
                  #{idx + 1}
                </span>
                {outfit.completeness_score && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                    outfit.completeness_score >= 90 ? 'bg-success/15 text-success' :
                    outfit.completeness_score >= 70 ? 'bg-amber-500/15 text-amber-400' :
                    'bg-danger/15 text-danger'
                  }`}>
                    {outfit.completeness_score}%
                  </span>
                )}
              </div>

              <OutfitCard outfit={outfit} />

              {/* Missing piece — compact */}
              {outfit.missing_piece && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs text-text-muted">
                    <span className="text-accent font-medium">Need: </span>
                    <span className="capitalize">{outfit.missing_piece.item_type}</span>
                    {outfit.missing_piece.estimated_price && <span className="text-text-muted/60"> · {outfit.missing_piece.estimated_price}</span>}
                  </p>
                  {outfit.missing_piece.search_query && (
                    <a href={`https://www.myntra.com/${outfit.missing_piece.search_query.replace(/\s+/g, '-')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 px-2 py-0.5 rounded text-xs bg-accent/10 hover:bg-accent/20 text-accent font-medium">Shop</a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
