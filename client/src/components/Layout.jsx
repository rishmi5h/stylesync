import { useRef, useCallback } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ activeSection, onNavigate, children }) {
  const spotlightRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = spotlightRef.current;
    if (!el) return;
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    if (!el.classList.contains('active')) {
      el.classList.add('active');
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = spotlightRef.current;
    if (el) el.classList.remove('active');
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse-following spotlight */}
      <div ref={spotlightRef} className="cursor-spotlight" />

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
