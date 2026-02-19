import { useState } from 'react';
import { saveProfile } from '../utils/storage';
import InteractiveParticles from './InteractiveParticles';

const QUICK_STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'smart_casual', label: 'Smart Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'indo_western', label: 'Indo-Western' },
  { value: 'ethnic', label: 'Ethnic' },
  { value: 'athleisure', label: 'Athleisure' },
  { value: 'bohemian', label: 'Bohemian' },
];

export default function Welcome({ onComplete }) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [styles, setStyles] = useState([]);

  const toggleStyle = (s) => {
    setStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleFinish = () => {
    const profile = {
      gender,
      location,
      styles,
      budget: 'mid-range',
      schedule: {
        monday: 'casual', tuesday: 'casual', wednesday: 'casual',
        thursday: 'casual', friday: 'casual', saturday: 'casual', sunday: 'casual',
      },
    };
    saveProfile(profile);
    onComplete();
  };

  // Step 0: Hero — cinematic first impression
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden">
        {/* Interactive particle canvas — reacts to mouse */}
        <InteractiveParticles />

        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/[0.02] rounded-full blur-[80px] pointer-events-none" />

        {/* Main content — staggered entrance */}
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          {/* Logo with ring burst + line sweep */}
          <div className="relative mb-8">
            <div className="hero-ring" />
            <div className="hero-line-sweep" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center hero-logo-entrance logo-glow">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
          </div>

          {/* Title — clip reveal */}
          <div className="hero-title-clip mb-3">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="text-brand hero-title-shimmer">StyleSync</span>
            </h1>
          </div>

          {/* Tagline — fades up after title */}
          <p className="text-text-muted text-sm sm:text-base max-w-sm mb-12 opacity-0" style={{ animation: 'heroReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards' }}>
            Your AI stylist for daily outfits, occasions & wardrobe planning.
          </p>

          {/* CTA button — last to appear with slight bounce */}
          <button
            onClick={() => setStep(1)}
            className="px-12 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-semibold transition-colors btn-press hero-btn-entrance pointer-events-auto"
          >
            Get Started
          </button>
          <p className="text-text-muted/30 text-xs mt-4 opacity-0" style={{ animation: 'heroReveal 0.5s ease 1.1s forwards' }}>
            30-second setup
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Gender
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 page-enter">
        <div className="flex gap-1 mb-8">
          <div className="w-10 h-1 rounded-full bg-primary" />
          <div className="w-10 h-1 rounded-full bg-surface-lighter" />
          <div className="w-10 h-1 rounded-full bg-surface-lighter" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">I dress as...</h2>
        <p className="text-text-muted text-sm mb-10">Helps us pick the right fits</p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'non-binary', label: 'Non-Binary' },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => { setGender(g.value); setStep(2); }}
              className="flex-1 px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-200 border border-surface-lighter bg-surface-light hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Location
  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 page-enter">
        <div className="flex gap-1 mb-8">
          <div className="w-10 h-1 rounded-full bg-primary" />
          <div className="w-10 h-1 rounded-full bg-primary" />
          <div className="w-10 h-1 rounded-full bg-surface-lighter" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Where are you based?</h2>
        <p className="text-text-muted text-sm mb-10">For weather-aware outfits</p>

        <div className="w-full max-w-md">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            autoFocus
            className="w-full px-5 py-4 rounded-2xl bg-surface-light border border-surface-lighter text-sm text-center focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-muted/40"
            onKeyDown={(e) => { if (e.key === 'Enter' && location.trim()) setStep(3); }}
          />
          <button
            onClick={() => setStep(3)}
            disabled={!location.trim()}
            className={`w-full mt-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 btn-press ${
              location.trim()
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed'
            }`}
          >
            Continue
          </button>
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-xs text-text-muted/60 hover:text-text-muted transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Styles
  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 page-enter">
        <div className="flex gap-1 mb-8">
          <div className="w-10 h-1 rounded-full bg-primary" />
          <div className="w-10 h-1 rounded-full bg-primary" />
          <div className="w-10 h-1 rounded-full bg-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Pick your vibe</h2>
        <p className="text-text-muted text-sm mb-10">Select one or more</p>

        <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mb-8">
          {QUICK_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleStyle(s.value)}
              className={`px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 border ${
                styles.includes(s.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-surface-lighter bg-surface-light text-text-muted hover:border-primary/30 hover:text-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleFinish}
          disabled={styles.length === 0}
          className={`w-full max-w-md py-4 rounded-2xl text-sm font-semibold transition-all duration-200 btn-press ${
            styles.length > 0
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-surface-lighter text-text-muted cursor-not-allowed'
          }`}
        >
          Start Styling
        </button>
        <button
          onClick={() => setStep(2)}
          className="mt-4 text-xs text-text-muted/60 hover:text-text-muted transition-colors"
        >
          Back
        </button>
      </div>
    );
  }
}
