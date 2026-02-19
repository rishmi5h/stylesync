import Sidebar from './Sidebar';
import InteractiveParticles from './InteractiveParticles';

export default function Layout({ activeSection, onNavigate, children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive particle background — site-wide */}
      <InteractiveParticles density="subtle" />

      {/* Ambient gradient orbs */}
      <div className="bg-orb" style={{ top: '10%', right: '-10%' }} />
      <div className="bg-orb bg-orb-accent" style={{ bottom: '5%', left: '-5%' }} />

      <Sidebar activeSection={activeSection} onNavigate={onNavigate} />
      <main className="md:ml-60 pt-16 md:pt-0 min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
