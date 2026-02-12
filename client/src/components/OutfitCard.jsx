import { useState } from 'react';
import { getWardrobe } from '../utils/storage';

const vibeStyles = {
  casual_chill: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Casual' },
  office_ready: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Office' },
  date_worthy: { bg: 'bg-pink-500/15', text: 'text-pink-400', label: 'Date' },
  street_cool: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Street' },
  ethnic_elegant: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Ethnic' },
  indo_western: { bg: 'bg-teal-500/15', text: 'text-teal-400', label: 'Indo-Western' },
  weekend_brunch: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', label: 'Brunch' },
  party_mode: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Party' },
  travel_comfy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Travel' },
  festive_glam: { bg: 'bg-rose-500/15', text: 'text-rose-400', label: 'Festive' },
};

function ItemThumb({ itemData, wardrobe, size = 'default' }) {
  const item = wardrobe.find((w) => w.id === itemData?.item_id) || null;
  if (!itemData) return null;

  const sizeClass = size === 'hero'
    ? 'w-28 h-36 sm:w-32 sm:h-40'
    : 'w-20 h-24 sm:w-22 sm:h-28';

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      {item?.image ? (
        <img
          src={item.image}
          alt={itemData.name}
          className={`${sizeClass} rounded-xl object-cover border border-white/5 shadow-lg shadow-black/20`}
        />
      ) : (
        <div className={`${sizeClass} rounded-xl bg-surface-lighter flex items-center justify-center border border-white/5`}>
          <span className="text-xs text-text-muted text-center px-2 leading-tight">{itemData.name || '?'}</span>
        </div>
      )}
      <span className="text-[11px] text-text-muted text-center leading-tight max-w-20 sm:max-w-22 line-clamp-1 font-medium">
        {itemData.name}
      </span>
    </div>
  );
}

function getAllItems(outfit) {
  const items = [];
  if (outfit.items?.top) items.push({ key: 'top', data: outfit.items.top });
  if (outfit.items?.bottom) items.push({ key: 'bottom', data: outfit.items.bottom });
  if (outfit.items?.footwear) items.push({ key: 'footwear', data: outfit.items.footwear });
  if (outfit.items?.outerwear) items.push({ key: 'outerwear', data: outfit.items.outerwear });
  if (outfit.items?.accessories) {
    outfit.items.accessories.forEach((acc, i) => items.push({ key: `acc-${i}`, data: acc }));
  }
  return items;
}

export default function OutfitCard({ outfit, reasoning }) {
  const [expanded, setExpanded] = useState(false);
  const wardrobe = getWardrobe();
  const vibe = vibeStyles[outfit.vibe] || vibeStyles.casual_chill;
  const note = outfit.style_tip || reasoning || outfit.best_for || '';
  const allItems = getAllItems(outfit);

  return (
    <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden hover:border-primary/20 transition-all">
      {/* Title bar — minimal */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="font-bold text-base leading-snug truncate">{outfit.outfit_name || 'Outfit'}</h3>
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${vibe.bg} ${vibe.text}`}>
          {vibe.label}
        </span>
      </div>

      {/* Items — horizontal scroll */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {allItems.map((item, idx) => (
            <ItemThumb
              key={item.key}
              itemData={item.data}
              wardrobe={wardrobe}
              size={allItems.length === 1 ? 'hero' : 'default'}
            />
          ))}
        </div>
      </div>

      {/* Note — subtle bottom bar */}
      {note && (
        <div
          className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <p className={`text-xs text-text-muted leading-relaxed ${!expanded ? 'line-clamp-1' : ''}`}>
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
