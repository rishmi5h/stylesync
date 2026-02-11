import { useState, useEffect } from 'react';
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
  { value: 'budget', label: 'Budget', desc: 'Best value picks' },
  { value: 'mid-range', label: 'Mid-Range', desc: 'Quality & value balance' },
  { value: 'premium', label: 'Premium', desc: 'Top-tier brands' },
];

export default function StyleProfile() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(() => {
    const existing = getProfile();
    return existing || {
      styles: [],
      schedule: days.reduce((acc, day) => ({ ...acc, [day]: 'casual' }), {}),
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
      schedule: { ...prev.schedule, [day]: occasion },
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Style Profile</h2>
        <p className="text-text-muted text-sm mt-1">Tell us about your style so we can plan better outfits</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Style Preferences */}
        <section>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Style Preferences</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleStyle(opt.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
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
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Gender</h3>
          <div className="flex gap-2">
            {['male', 'female', 'non-binary'].map((g) => (
              <button
                key={g}
                onClick={() => { setProfile({ ...profile, gender: g }); setSaved(false); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border ${
                  profile.gender === g
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                {g.replace('-', ' ')}
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Location</h3>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => { setProfile({ ...profile, location: e.target.value }); setSaved(false); }}
            placeholder="Enter your city (e.g., Mumbai, Delhi, Bangalore)"
            className="w-full px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50"
          />
        </section>

        {/* Budget */}
        <section>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Budget Preference</h3>
          <div className="grid grid-cols-3 gap-2">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setProfile({ ...profile, budget: opt.value }); setSaved(false); }}
                className={`px-4 py-3 rounded-xl text-center transition-all border ${
                  profile.budget === opt.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30'
                }`}
              >
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-[10px] mt-0.5 opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Schedule */}
        <section>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Typical Week</h3>
          <div className="space-y-2">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-3 p-3 rounded-xl bg-surface-light border border-surface-lighter">
                <span className="text-sm font-medium w-24 shrink-0">{day}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {occasionOptions.map((occ) => (
                    <button
                      key={occ.value}
                      onClick={() => updateSchedule(day, occ.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        profile.schedule[day] === occ.value
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
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
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
              Profile saved!
            </span>
          )}
          {!isComplete && (
            <span className="text-text-muted text-xs">
              Select at least one style, gender, and enter your location
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
