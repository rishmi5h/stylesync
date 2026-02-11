const formalityColors = {
  casual: 'bg-green-500/20 text-green-400',
  smart_casual: 'bg-blue-500/20 text-blue-400',
  semi_formal: 'bg-purple-500/20 text-purple-400',
  formal: 'bg-amber-500/20 text-amber-400',
  festive: 'bg-pink-500/20 text-pink-400',
  ethnic_casual: 'bg-teal-500/20 text-teal-400',
  ethnic_formal: 'bg-rose-500/20 text-rose-400',
};

const seasonIcons = {
  summer: '\u2600\uFE0F',
  winter: '\u2744\uFE0F',
  all_season: '\uD83C\uDF0D',
  rainy: '\uD83C\uDF27\uFE0F',
};

const categoryLabels = {
  top: 'Top',
  bottom: 'Bottom',
  outerwear: 'Outerwear',
  footwear: 'Footwear',
  accessory: 'Accessory',
  innerwear: 'Innerwear',
  ethnic_top: 'Ethnic Top',
  ethnic_bottom: 'Ethnic Bottom',
  ethnic_set: 'Ethnic Set',
};

export default function ItemCard({ item, onDelete, onEdit, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-light/50">
        {item.image && (
          <img
            src={item.image}
            alt={item.description}
            className="w-10 h-10 rounded-md object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{item.subcategory || item.category}</p>
          <p className="text-xs text-text-muted truncate">{item.color}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-surface-light rounded-2xl overflow-hidden border border-surface-lighter hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {item.image && (
        <div className="aspect-square overflow-hidden">
          <img
            src={item.image}
            alt={item.description}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-semibold capitalize">{item.subcategory || item.category}</h3>
            <p className="text-xs text-text-muted capitalize">{categoryLabels[item.category] || item.category}</p>
          </div>
          <span className="text-sm">{seasonIcons[item.season] || ''}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-lighter capitalize">
            {item.color}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-lighter capitalize">
            {item.pattern}
          </span>
          {item.fabric_guess && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-400 capitalize">
              {item.fabric_guess}
            </span>
          )}
          {item.formality && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${formalityColors[item.formality] || 'bg-surface-lighter'}`}>
              {item.formality?.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Weather suitability */}
        {item.weather_suitability && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <p className="text-[10px] text-amber-400 leading-snug">{item.weather_suitability}</p>
          </div>
        )}

        {/* Occasion tags */}
        {item.occasion_tags && item.occasion_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.occasion_tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary-light capitalize">
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
            {item.occasion_tags.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] text-text-muted">
                +{item.occasion_tags.length - 4}
              </span>
            )}
          </div>
        )}

        {item.description && (
          <p className="text-xs text-text-muted line-clamp-2 mb-2">{item.description}</p>
        )}

        {/* Care tip */}
        {item.care_tip && (
          <p className="text-[10px] text-text-muted/70 italic mb-2 line-clamp-1">{item.care_tip}</p>
        )}

        {/* Versatility score */}
        {item.versatility && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] text-text-muted">Versatility:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`w-2 h-2 rounded-full ${
                    n <= item.versatility ? 'bg-primary' : 'bg-surface-lighter'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="flex-1 text-xs py-1.5 rounded-lg bg-surface-lighter hover:bg-primary/20 hover:text-primary transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="flex-1 text-xs py-1.5 rounded-lg bg-surface-lighter hover:bg-danger/20 hover:text-danger transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
