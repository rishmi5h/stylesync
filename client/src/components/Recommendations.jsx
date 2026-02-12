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

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 3;
  const isReady = hasProfile && hasWardrobe;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Smart Suggestions</h2>
          <p className="text-text-muted text-sm mt-1">AI-powered purchase recommendations</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !isReady}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg ${
            isReady
              ? 'bg-accent hover:bg-accent-light disabled:opacity-50 text-black shadow-accent/20'
              : 'bg-surface-lighter text-text-muted cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          )}
          {data ? 'Refresh' : 'Get Suggestions'}
        </button>
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
              <p className="text-sm text-text-muted">Add {Math.max(0, 3 - wardrobe.length)} more item{3 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium transition-colors">
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 border-3 border-accent border-t-transparent rounded-full animate-spin mb-5" />
          <p className="text-sm font-medium animate-pulse">Analyzing wardrobe gaps...</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Wardrobe Analysis */}
          {data.wardrobe_analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-light border border-surface-lighter">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <h3 className="text-sm font-semibold">Strengths</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{data.wardrobe_analysis.strengths}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-light border border-surface-lighter">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <h3 className="text-sm font-semibold">Gaps</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{data.wardrobe_analysis.gaps}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations?.map((rec, i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface-light border border-surface-lighter">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-base font-bold capitalize">{rec.item_type}</h3>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium bg-accent/20 text-accent">
                  #{i + 1}
                </span>
              </div>

              {rec.description && (
                <p className="text-sm text-text-muted mb-3">{rec.description}</p>
              )}

              {rec.why && (
                <div className="mb-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-primary-light">
                    <span className="font-semibold">Why: </span>{rec.why}
                  </p>
                </div>
              )}

              {/* Pairs With */}
              {rec.pairs_with && rec.pairs_with.length > 0 && (
                <div className="mb-3">
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
              <div className="flex flex-wrap gap-3 mb-3">
                {rec.budget_price && (
                  <div className="px-3 py-1.5 rounded-xl bg-surface-lighter">
                    <span className="text-[10px] text-text-muted block">Budget</span>
                    <span className="text-sm font-semibold text-success">{rec.budget_price}</span>
                  </div>
                )}
                {rec.premium_price && (
                  <div className="px-3 py-1.5 rounded-xl bg-surface-lighter">
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
                    className="flex-1 text-center py-2 rounded-xl bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 text-xs font-medium transition-colors"
                  >
                    Myntra
                  </a>
                  <a
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(rec.search_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-xs font-medium transition-colors"
                  >
                    Amazon
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-light flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">Smart purchase suggestions</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            AI analyzes your wardrobe gaps and suggests items to unlock more outfits.
          </p>
        </div>
      )}
    </div>
  );
}
