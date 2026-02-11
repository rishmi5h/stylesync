import { useState } from 'react';
import { generateOutfits } from '../services/api';
import { getWardrobe, getProfile, getOutfitPlan, saveOutfitPlan } from '../utils/storage';
import OutfitCard from './OutfitCard';

const loadingPhrases = [
  'Curating your looks...',
  'Checking the weather forecast...',
  'Mixing and matching styles...',
  'Applying color theory...',
  'Selecting the perfect outfits...',
  'Planning your fashion week...',
];

export default function WeeklyPlan({ onNavigate }) {
  const [outfits, setOutfits] = useState(() => getOutfitPlan());
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  const wardrobe = getWardrobe();
  const profile = getProfile();

  const canGenerate = wardrobe.length >= 3 && profile;

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    let msgIndex = 0;
    setLoadingMsg(loadingPhrases[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingPhrases.length;
      setLoadingMsg(loadingPhrases[msgIndex]);
    }, 3000);

    try {
      const result = await generateOutfits(wardrobe, profile);
      const plan = result.outfits;
      saveOutfitPlan(plan);
      setOutfits(plan);
    } catch (err) {
      setError(err.message || 'Failed to generate outfits. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (day) => {
    setError('');
    setLoading(true);
    setLoadingMsg(`Regenerating ${day}'s outfit...`);

    try {
      const result = await generateOutfits(wardrobe, profile);
      const newPlan = result.outfits;
      const dayOutfit = newPlan.find((o) => o.day === day);
      if (dayOutfit && outfits) {
        const updated = outfits.map((o) => (o.day === day ? dayOutfit : o));
        saveOutfitPlan(updated);
        setOutfits(updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Set up your style profile first</h3>
        <p className="text-text-muted text-sm mb-6">We need to know your style preferences to plan your week.</p>
        <button
          onClick={() => onNavigate('profile')}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
        >
          Go to Style Profile
        </button>
      </div>
    );
  }

  if (wardrobe.length < 3) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Add more items to your wardrobe</h3>
        <p className="text-text-muted text-sm mb-6">
          You need at least 3 items to generate outfit plans. You have {wardrobe.length}.
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Weekly Outfit Plan</h2>
          <p className="text-text-muted text-sm mt-1">
            {outfits ? '7 outfits planned for your week' : 'Generate your personalized outfit plan'}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-lg shadow-primary/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          )}
          {outfits ? 'Regenerate Week' : 'Generate My Week'}
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

      {!loading && outfits && Array.isArray(outfits) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {outfits.map((outfit, i) => (
            <OutfitCard key={i} outfit={outfit} onRegenerate={handleRegenerateDay} />
          ))}
        </div>
      )}
    </div>
  );
}
