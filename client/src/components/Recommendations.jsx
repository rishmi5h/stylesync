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
      setError(err.message || 'Failed to generate.');
    } finally {
      setLoading(false);
    }
  };

  const hasProfile = !!profile;
  const hasWardrobe = wardrobe.length >= 3;
  const isReady = hasProfile && hasWardrobe;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Suggestions</h2>
        <button
          onClick={handleGenerate}
          disabled={loading || !isReady}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-xs transition-colors btn-press ${
            isReady
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-surface-lighter text-text-muted cursor-not-allowed'
          }`}
        >
          {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {data ? 'Refresh' : 'Generate'}
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
              <p className="text-xs text-text-muted">Add {Math.max(0, 3 - wardrobe.length)} more item{3 - wardrobe.length !== 1 ? 's' : ''}</p>
              <button onClick={() => onNavigate('wardrobe')} className="shrink-0 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium">Add</button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-text-muted animate-pulse">Analyzing gaps...</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-4">
          {/* Analysis */}
          {data.wardrobe_analysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card-stagger p-3 rounded-xl bg-surface-light border border-surface-lighter" style={{ animationDelay: '0ms' }}>
                <p className="text-xs font-semibold text-success uppercase mb-1">Strengths</p>
                <p className="text-xs text-text-muted leading-relaxed">{data.wardrobe_analysis.strengths}</p>
              </div>
              <div className="card-stagger p-3 rounded-xl bg-surface-light border border-surface-lighter" style={{ animationDelay: '80ms' }}>
                <p className="text-xs font-semibold text-accent uppercase mb-1">Gaps</p>
                <p className="text-xs text-text-muted leading-relaxed">{data.wardrobe_analysis.gaps}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations?.map((rec, i) => (
            <div key={i} className="card-stagger p-3 sm:p-4 rounded-xl bg-surface-light border border-surface-lighter" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold capitalize">{rec.item_type}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/20 text-accent">#{i + 1}</span>
              </div>

              {rec.why && (
                <p className="text-xs text-text-muted mb-2"><span className="text-primary-light font-medium">Why: </span>{rec.why}</p>
              )}

              {/* Pairs + Price inline */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {rec.budget_price && (
                  <span className="text-xs text-success font-medium">{rec.budget_price}</span>
                )}
                {rec.budget_price && rec.premium_price && <span className="text-text-muted/30">·</span>}
                {rec.premium_price && (
                  <span className="text-xs text-accent font-medium">{rec.premium_price}</span>
                )}
              </div>

              {rec.pairs_with && rec.pairs_with.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {rec.pairs_with.map((itemId, j) => {
                    const item = wardrobe.find((w) => w.id === itemId);
                    return item ? (
                      <ItemCard key={j} item={item} compact />
                    ) : (
                      <span key={j} className="px-2 py-0.5 rounded bg-surface-lighter text-xs text-text-muted">{itemId}</span>
                    );
                  })}
                </div>
              )}

              {rec.search_query && (
                <div className="flex gap-2">
                  <a href={`https://www.myntra.com/${encodeURIComponent(rec.search_query)}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs font-medium">Myntra</a>
                  <a href={`https://www.amazon.in/s?k=${encodeURIComponent(rec.search_query)}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium">Amazon</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-14">
          <button
            onClick={handleGenerate}
            disabled={!isReady}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press ${
              isReady
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed'
            }`}
          >
            {isReady ? 'Get Suggestions' : 'Complete Setup First'}
          </button>
        </div>
      )}
    </div>
  );
}
