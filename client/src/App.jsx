import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import HomePage from './pages/Home';
import DashboardPage from './pages/Dashboard';

// Floating Header Component
const FloatingHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <>
      {/* Top Left - Brand */}
      <Link
        to="/"
        className={`fixed top-6 left-6 z-50 transition-all duration-300 ${scrolled ? 'scale-90 opacity-80' : 'scale-100'}`}
      >
        <div className="flex items-center gap-3 backdrop-blur-md bg-black/20 border border-white/10 px-4 py-2 rounded-full hover:bg-black/40 transition">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-wide">RappelBot</span>
        </div>
      </Link>

      {/* Top Right - CTA */}
      {/* Top Right - CTA (Animated Fly-in) */}
      <a
        href="https://discord.com/oauth2/authorize?client_id=1416353909395558451"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed top-6 right-6 z-50 transition-all duration-700 ease-out transform ${scrolled
            ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
            : 'translate-x-[-30vw] translate-y-[30vh] opacity-0 scale-50 pointer-events-none'
          }`}
      >
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-xl px-6 py-2.5 rounded-xl skew-x-[-12deg] shadow-lg hover:shadow-cyan-500/50 transition-shadow">
          <div className="flex items-center gap-2 skew-x-[12deg]">
            <span className="font-bold text-white text-sm">Ajouter au Discord</span>
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      </a>

      <style>{`
                /* No custom keyframes needed for this transition, relying on Tailwind classes */
            `}</style>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white">

        <FloatingHeader />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;