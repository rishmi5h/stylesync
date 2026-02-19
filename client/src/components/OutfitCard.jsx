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

function ItemTile({ itemData, wardrobe }) {
  const item = wardrobe.find((w) => w.id === itemData?.item_id) || null;
  if (!itemData) return null;

  return (
    <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
      {item?.image ? (
        <img
          src={item.image}
          alt={itemData.name}
          className="w-full aspect-[3/4] rounded-xl object-cover"
        />
      ) : (
        <div className="w-full aspect-[3/4] rounded-xl bg-surface-lighter flex items-center justify-center">
          <span className="text-xs text-text-muted text-center px-2 leading-tight">{itemData.name || '?'}</span>
        </div>
      )}
      <span className="text-[11px] text-text-muted text-center leading-tight line-clamp-1 w-full px-0.5">
        {itemData.name}
      </span>
    </div>
  );
}

export default function OutfitCard({ outfit, reasoning }) {
  const [expanded, setExpanded] = useState(false);
  const wardrobe = getWardrobe();
  const vibe = vibeStyles[outfit.vibe] || vibeStyles.casual_chill;
  const note = outfit.style_tip || reasoning || outfit.best_for || '';
  const allItems = getAllItems(outfit);

  return (
    <div className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden hover:border-primary/20 card-hover">
      {/* Title + vibe inline */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h3 className="font-bold text-sm leading-snug truncate">{outfit.outfit_name || 'Outfit'}</h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${vibe.bg} ${vibe.text}`}>
          {vibe.label}
        </span>
      </div>

      {/* Items grid — fills full width */}
      <div className="px-3 pb-2">
        <div className={`grid gap-2 ${
          allItems.length === 1 ? 'grid-cols-1 max-w-[200px]' :
          allItems.length === 2 ? 'grid-cols-2' :
          allItems.length === 3 ? 'grid-cols-3' :
          allItems.length === 4 ? 'grid-cols-4' :
          'grid-cols-4 sm:grid-cols-5'
        }`}>
          {allItems.map((item) => (
            <ItemTile key={item.key} itemData={item.data} wardrobe={wardrobe} />
          ))}
        </div>
      </div>

      {/* Note */}
      {note && (
        <div
          className="px-3 py-2 border-t border-white/5 cursor-pointer"
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
