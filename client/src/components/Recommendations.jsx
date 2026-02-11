import { useState } from 'react';
import { generateRecommendations } from '../services/api';
import { getWardrobe, getProfile } from '../utils/storage';
import ItemCard from './ItemCard';

export default function Recommendations({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wardrobe = getWardrobe();
  const profile = getProfile();

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await generateRecommendations(wardrobe, profile);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations.');
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
        <p className="text-text-muted text-sm mb-6">We need your preferences to make smart suggestions.</p>
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
          You need at least 3 items to get purchase suggestions. You have {wardrobe.length}.
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
          <h2 className="text-2xl font-bold">Smart Suggestions</h2>
          <p className="text-text-muted text-sm mt-1">AI-powered purchase recommendations to enhance your wardrobe</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50 text-black font-medium text-sm transition-colors shadow-lg shadow-accent/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          )}
          {data ? 'Refresh Suggestions' : 'Get Suggestions'}
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
          <div className="w-16 h-16 border-3 border-accent border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-sm font-medium animate-pulse">Analyzing your wardrobe gaps...</p>
          <p className="text-xs text-text-muted mt-2">Finding the best items to complete your collection</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Wardrobe Analysis */}
          {data.wardrobe_analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-light border border-surface-lighter">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <h3 className="text-sm font-semibold">Strengths</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{data.wardrobe_analysis.strengths}</p>
              </div>
              <div className="p-5 rounded-2xl bg-surface-light border border-surface-lighter">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <h3 className="text-sm font-semibold">Gaps</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{data.wardrobe_analysis.gaps}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations?.map((rec, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-light border border-surface-lighter">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold capitalize">{rec.item_type}</h3>
                  {rec.description && (
                    <p className="text-sm text-text-muted mt-1">{rec.description}</p>
                  )}
                </div>
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                  Recommendation {i + 1}
                </span>
              </div>

              {rec.why && (
                <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-primary-light">
                    <span className="font-semibold">Why: </span>{rec.why}
                  </p>
                </div>
              )}

              {/* Pairs With */}
              {rec.pairs_with && rec.pairs_with.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Pairs With</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.pairs_with.map((itemId, j) => {
                      const item = wardrobe.find((w) => w.id === itemId);
                      return item ? (
                        <ItemCard key={j} item={item} compact />
                      ) : (
                        <span key={j} className="px-2 py-1 rounded-lg bg-surface-lighter text-xs text-text-muted">
                          {itemId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="flex flex-wrap gap-3 mb-4">
                {rec.budget_price && (
                  <div className="px-4 py-2 rounded-xl bg-surface-lighter">
                    <span className="text-[10px] text-text-muted block">Budget</span>
                    <span className="text-sm font-semibold text-success">{rec.budget_price}</span>
                  </div>
                )}
                {rec.premium_price && (
                  <div className="px-4 py-2 rounded-xl bg-surface-lighter">
                    <span className="text-[10px] text-text-muted block">Premium</span>
                    <span className="text-sm font-semibold text-accent">{rec.premium_price}</span>
                  </div>
                )}
              </div>

              {/* Search Buttons */}
              {rec.search_query && (
                <div className="flex gap-2">
                  <a
                    href={`https://www.myntra.com/${encodeURIComponent(rec.search_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 rounded-xl bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 text-xs font-medium transition-colors"
                  >
                    Search on Myntra
                  </a>
                  <a
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(rec.search_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-xs font-medium transition-colors"
                  >
                    Search on Amazon
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Get smart purchase suggestions</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Our AI will analyze your wardrobe, find gaps, and suggest 2 items that would unlock the most new outfit combinations.
          </p>
        </div>
      )}
    </div>
  );
}
