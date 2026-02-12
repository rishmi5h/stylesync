import { useState } from 'react';
import './App.css';
import { getProfile } from './utils/storage';
import Layout from './components/Layout';
import Welcome from './components/Welcome';
import TodayPick from './components/TodayPick';
import WardrobeManager from './components/WardrobeManager';
import StyleProfile from './components/StyleProfile';
import OutfitIdeas from './components/OutfitIdeas';
import OccasionStylist from './components/OccasionStylist';
import Recommendations from './components/Recommendations';

function App() {
  const [activeSection, setActiveSection] = useState('today');
  const [hasProfile, setHasProfile] = useState(() => !!getProfile());

  const handleOnboardingComplete = () => {
    setHasProfile(true);
  };

  // Show Welcome onboarding for first-time users
  if (!hasProfile) {
    return <Welcome onComplete={handleOnboardingComplete} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'today':
        return <TodayPick onNavigate={setActiveSection} />;
      case 'wardrobe':
        return <WardrobeManager />;
      case 'profile':
        return <StyleProfile />;
      case 'ideas':
        return <OutfitIdeas onNavigate={setActiveSection} />;
      case 'occasion':
        return <OccasionStylist onNavigate={setActiveSection} />;
      case 'suggestions':
        return <Recommendations onNavigate={setActiveSection} />;
      default:
        return <TodayPick onNavigate={setActiveSection} />;
    }
  };

  return (
    <Layout activeSection={activeSection} onNavigate={setActiveSection}>
      {renderSection()}
    </Layout>
  );
}

export default App;
