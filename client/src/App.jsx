import { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import WardrobeManager from './components/WardrobeManager';
import StyleProfile from './components/StyleProfile';
import OutfitIdeas from './components/OutfitIdeas';
import Recommendations from './components/Recommendations';

function App() {
  const [activeSection, setActiveSection] = useState('wardrobe');

  const renderSection = () => {
    switch (activeSection) {
      case 'wardrobe':
        return <WardrobeManager />;
      case 'profile':
        return <StyleProfile />;
      case 'ideas':
        return <OutfitIdeas onNavigate={setActiveSection} />;
      case 'suggestions':
        return <Recommendations onNavigate={setActiveSection} />;
      default:
        return <WardrobeManager />;
    }
  };

  return (
    <Layout activeSection={activeSection} onNavigate={setActiveSection}>
      {renderSection()}
    </Layout>
  );
}

export default App;
