import { useState } from 'react';
import { getProfile, saveProfile } from '../utils/storage';

const styleOptions = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'smart_casual', label: 'Smart Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'indo_western', label: 'Indo-Western' },
  { value: 'ethnic', label: 'Ethnic / Traditional' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'athleisure', label: 'Athleisure' },
  { value: 'ethnic_fusion', label: 'Ethnic Fusion' },
];

const occasionOptions = [
  { value: 'office', label: 'Office' },
  { value: 'casual', label: 'Casual' },
  { value: 'college', label: 'College' },
  { value: 'date_night', label: 'Date Night' },
  { value: 'party', label: 'Party' },
  { value: 'festive', label: 'Festive / Puja' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'workout', label: 'Workout' },
  { value: 'wfh', label: 'WFH' },
  { value: 'outdoor', label: 'Outdoor' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const regionOptions = [
  { value: 'North India', label: 'North India', city: 'Delhi' },
  { value: 'South India', label: 'South India', city: 'Chennai' },
  { value: 'West India', label: 'West India', city: 'Mumbai' },
  { value: 'East India', label: 'East India', city: 'Kolkata' },
  { value: 'Northeast India', label: 'Northeast', city: 'Guwahati' },
  { value: 'Central India', label: 'Central India', city: 'Nagpur' },
];

const budgetOptions = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-Range' },
  { value: 'premium', label: 'Premium' },
];

export default function StyleProfile({ onNavigate }) {
  const [saved, setSaved] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [profile, setProfile] = useState(() => {
    const existing = getProfile();
    return existing || {
      styles: [],
      schedule: days.reduce((acc, day) => ({ ...acc, [day.toLowerCase()]: 'casual' }), {}),
      gender: '',
      region: '',
      location: '',
      budget: 'mid-range',
    };
  });

  const toggleStyle = (style) => {
    setProfile((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
    setSaved(false);
  };

  const updateSchedule = (day, occasion) => {
    setProfile((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [day.toLowerCase()]: occasion },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isComplete = profile.styles.length > 0 && profile.gender;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold section-heading">Style Profile</h2>
        <div className="flex items-center gap-2">
          {saved && <span className="text-success text-xs font-medium animate-pulse">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={!isComplete}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
              isComplete
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Style Preferences */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Style</h3>
          <div className="flex flex-wrap gap-1.5">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleStyle(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  profile.styles.includes(opt.value)
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Gender */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Gender</h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-Binary' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => { setProfile({ ...profile, gender: g.value }); setSaved(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  profile.gender === g.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </section>

        {/* Region */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Region
            <span className="font-normal normal-case tracking-normal text-text-muted/60 ml-1">(optional — for weather)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {regionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const newRegion = profile.region === opt.value ? '' : opt.value;
                  const newLocation = newRegion ? opt.city : '';
                  setProfile({ ...profile, region: newRegion, location: newLocation });
                  setSaved(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  profile.region === opt.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <div className="divider-ornament" />

        {/* Budget */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Budget</h3>
          <div className="flex flex-wrap gap-1.5">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setProfile({ ...profile, budget: opt.value }); setSaved(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  profile.budget === opt.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Schedule */}
        <section>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 hover:text-text transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${showSchedule ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Schedule
            <span className="font-normal normal-case tracking-normal text-text-muted/60">(optional)</span>
          </button>
          {showSchedule && (
            <div className="space-y-1.5 animate-in">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-2 p-2 rounded-lg bg-surface-light border border-surface-lighter">
                  <span className="text-xs font-medium w-12 shrink-0">{day.slice(0, 3)}</span>
                  <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1 pb-0.5">
                    {occasionOptions.map((occ) => (
                      <button
                        key={occ.value}
                        onClick={() => updateSchedule(day, occ.value)}
                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                          profile.schedule[day.toLowerCase()] === occ.value
                            ? 'bg-primary text-white'
                            : 'bg-surface-lighter text-text-muted hover:text-text'
                        }`}
                      >
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!isComplete && (
          <p className="text-text-muted text-xs pb-4">Select style & gender to save</p>
        )}

        {/* Suggestions — accessible from Profile on mobile */}
        <div className="divider-ornament" />
        <button
          onClick={() => onNavigate('suggestions')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-light border border-surface-lighter hover:border-primary/30 transition-all group btn-press"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div className="text-left flex-1">
            <span className="text-sm font-medium text-text block">Wardrobe Suggestions</span>
            <span className="text-xs text-text-muted">Get AI-powered tips to fill gaps in your wardrobe</span>
          </div>
          <svg className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
