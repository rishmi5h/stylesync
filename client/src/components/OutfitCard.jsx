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

function ItemThumb({ itemData, wardrobe }) {
  const item = wardrobe.find((w) => w.id === itemData?.item_id) || null;
  if (!itemData) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      {item?.image ? (
        <img src={item.image} alt={itemData.name}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-surface-lighter" />
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-surface-lighter flex items-center justify-center border border-surface-lighter">
          <span className="text-[9px] text-text-muted text-center px-1 leading-tight">{itemData.name || '?'}</span>
        </div>
      )}
      <span className="text-[9px] text-text-muted text-center leading-tight max-w-14 sm:max-w-16 line-clamp-1">
        {itemData.name}
      </span>
    </div>
  );
}

/* Truncated text that expands on click */
function Clamp({ text, label, labelClass = 'text-primary-light' }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <p className={`text-[10px] text-text-muted leading-snug ${!open ? 'line-clamp-1' : ''}`} onClick={() => setOpen(!open)}>
      <span className={`font-medium ${labelClass}`}>{label} </span>{text}
    </p>
  );
}

export default function OutfitCard({ outfit, reasoning }) {
  const wardrobe = getWardrobe();
  const vibe = vibeStyles[outfit.vibe] || vibeStyles.casual_chill;

  return (
    <div className="bg-surface-light rounded-xl border border-surface-lighter overflow-hidden hover:border-primary/20 transition-all group">
      {/* Header */}
      <div className="p-3 border-b border-surface-lighter">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-xs leading-snug truncate">{outfit.outfit_name || 'Outfit'}</h3>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold ${vibe.bg} ${vibe.text}`}>
            {vibe.label}
          </span>
        </div>
        {outfit.color_palette && (
          <div className="flex items-center gap-1 mt-1.5 overflow-x-auto scrollbar-none">
            {outfit.color_palette.map((color, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full text-[8px] bg-surface-lighter capitalize whitespace-nowrap">{color}</span>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {outfit.items?.top && <ItemThumb itemData={outfit.items.top} wardrobe={wardrobe} />}
          {outfit.items?.bottom && <ItemThumb itemData={outfit.items.bottom} wardrobe={wardrobe} />}
          {outfit.items?.footwear && <ItemThumb itemData={outfit.items.footwear} wardrobe={wardrobe} />}
          {outfit.items?.outerwear && <ItemThumb itemData={outfit.items.outerwear} wardrobe={wardrobe} />}
          {outfit.items?.accessories?.map((acc, i) => (
            <ItemThumb key={i} itemData={acc} wardrobe={wardrobe} />
          ))}
        </div>
      </div>

      {/* Footer — all clamped to 1 line, tap to expand */}
      {(reasoning || outfit.style_tip || outfit.best_for || outfit.weather_note) && (
        <div className="px-3 pb-2.5 space-y-0.5">
          <Clamp text={reasoning} label="AI:" labelClass="text-primary" />
          <Clamp text={outfit.style_tip} label="Tip:" />
          <Clamp text={outfit.best_for} label="For:" labelClass="text-text" />
          <Clamp text={outfit.weather_note} label="Weather:" labelClass="text-amber-400/80" />
        </div>
      )}
    </div>
  );
}
