import { getWardrobe } from '../utils/storage';

const vibeStyles = {
  casual_chill: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Casual Chill' },
  office_ready: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Office Ready' },
  date_worthy: { bg: 'bg-pink-500/15', text: 'text-pink-400', label: 'Date Worthy' },
  street_cool: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Street Cool' },
  ethnic_elegant: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Ethnic Elegant' },
  indo_western: { bg: 'bg-teal-500/15', text: 'text-teal-400', label: 'Indo-Western' },
  weekend_brunch: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', label: 'Weekend Brunch' },
  party_mode: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Party Mode' },
  travel_comfy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Travel Comfy' },
  festive_glam: { bg: 'bg-rose-500/15', text: 'text-rose-400', label: 'Festive Glam' },
};

function ItemThumb({ itemData, wardrobe }) {
  const item = wardrobe.find((w) => w.id === itemData?.item_id) || null;
  if (!itemData) return null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {item?.image ? (
        <img
          src={item.image}
          alt={itemData.name}
          className="w-16 h-16 rounded-xl object-cover border border-surface-lighter shadow-sm"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-surface-lighter flex items-center justify-center border border-surface-lighter">
          <span className="text-[10px] text-text-muted text-center px-1 leading-tight">{itemData.name || '?'}</span>
        </div>
      )}
      <span className="text-[10px] text-text-muted text-center leading-tight max-w-16 line-clamp-2">
        {itemData.name}
      </span>
    </div>
  );
}

export default function OutfitCard({ outfit }) {
  const wardrobe = getWardrobe();
  const vibe = vibeStyles[outfit.vibe] || vibeStyles.casual_chill;

  return (
    <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      {/* Header */}
      <div className="p-4 border-b border-surface-lighter">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-sm leading-snug">{outfit.outfit_name || 'Outfit Idea'}</h3>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${vibe.bg} ${vibe.text}`}>
            {vibe.label}
          </span>
        </div>
        {outfit.color_palette && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-text-muted mr-1">Colors:</span>
            {outfit.color_palette.map((color, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[9px] bg-surface-lighter capitalize">
                {color}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Outfit Items */}
      <div className="p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {outfit.items?.top && <ItemThumb itemData={outfit.items.top} wardrobe={wardrobe} />}
          {outfit.items?.bottom && <ItemThumb itemData={outfit.items.bottom} wardrobe={wardrobe} />}
          {outfit.items?.footwear && <ItemThumb itemData={outfit.items.footwear} wardrobe={wardrobe} />}
          {outfit.items?.outerwear && <ItemThumb itemData={outfit.items.outerwear} wardrobe={wardrobe} />}
          {outfit.items?.accessories?.map((acc, i) => (
            <ItemThumb key={i} itemData={acc} wardrobe={wardrobe} />
          ))}
        </div>
      </div>

      {/* Style Tip */}
      {outfit.style_tip && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary-light leading-relaxed">
            <span className="font-semibold">Tip: </span>{outfit.style_tip}
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-4 pb-4 space-y-1.5">
        {outfit.best_for && (
          <p className="text-[11px] text-text-muted">
            <span className="font-medium text-text">Best for: </span>{outfit.best_for}
          </p>
        )}
        {outfit.weather_note && (
          <p className="text-[11px] text-amber-400/80">
            <span className="font-medium">Weather: </span>{outfit.weather_note}
          </p>
        )}
      </div>
    </div>
  );
}
