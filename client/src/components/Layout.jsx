import Sidebar from './Sidebar';

export default function Layout({ activeSection, onNavigate, children }) {
  return (
    <div className="min-h-screen">
      <Sidebar activeSection={activeSection} onNavigate={onNavigate} />
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
