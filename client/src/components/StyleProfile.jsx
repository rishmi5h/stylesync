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

const budgetOptions = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-Range' },
  { value: 'premium', label: 'Premium' },
];

export default function StyleProfile() {
  const [saved, setSaved] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [profile, setProfile] = useState(() => {
    const existing = getProfile();
    return existing || {
      styles: [],
      schedule: days.reduce((acc, day) => ({ ...acc, [day.toLowerCase()]: 'casual' }), {}),
      gender: '',
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

  const isComplete = profile.styles.length > 0 && profile.gender && profile.location;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Style Profile</h2>
        <p className="text-text-muted text-sm mt-1">Your preferences for better outfit picks</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Style Preferences */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Your Style</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleStyle(opt.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  profile.styles.includes(opt.value)
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30 hover:text-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Gender */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Gender</h3>
          <div className="flex gap-2">
            {[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-Binary' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => { setProfile({ ...profile, gender: g.value }); setSaved(false); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border ${
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

        {/* Location */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Location</h3>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => { setProfile({ ...profile, location: e.target.value }); setSaved(false); }}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            className="w-full px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50"
          />
        </section>

        {/* Budget */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Budget</h3>
          <div className="flex gap-2">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setProfile({ ...profile, budget: opt.value }); setSaved(false); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
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
            className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 hover:text-text transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showSchedule ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Weekly Schedule
            <span className="text-[10px] font-normal normal-case tracking-normal text-text-muted/60">(optional)</span>
          </button>
          {showSchedule && (
            <div className="space-y-2 animate-in">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-3 p-3 rounded-xl bg-surface-light border border-surface-lighter">
                  <span className="text-sm font-medium w-24 shrink-0">{day}</span>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {occasionOptions.map((occ) => (
                      <button
                        key={occ.value}
                        onClick={() => updateSchedule(day, occ.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
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

        {/* Save Button */}
        <div className="flex items-center gap-4 pb-8">
          <button
            onClick={handleSave}
            disabled={!isComplete}
            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              isComplete
                ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed shadow-none'
            }`}
          >
            Save Profile
          </button>
          {saved && (
            <span className="text-success text-sm font-medium animate-pulse">
              Saved!
            </span>
          )}
          {!isComplete && (
            <span className="text-text-muted text-xs">
              Select style, gender & location
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
