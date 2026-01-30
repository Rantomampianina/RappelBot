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
      <a
        href="https://discord.com/oauth2/authorize?client_id=1416353909395558451"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed top-6 right-6 z-50 transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}
      >
        <div className="group relative overflow-hidden rounded-full p-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 animate-gradient-xy"></div>
          <div className="relative bg-black/80 backdrop-blur-xl px-6 py-2.5 rounded-full flex items-center gap-2 transition group-hover:bg-black/60">
            <span className="font-bold text-white text-sm">Ajouter au Discord</span>
            <Zap className="w-4 h-4 text-cyan-400 group-hover:text-white transition" />
          </div>
        </div>
      </a>

      <style>{`
                @keyframes gradient-xy {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-xy {
                    background-size: 200% 200%;
                    animation: gradient-xy 3s ease infinite;
                }
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