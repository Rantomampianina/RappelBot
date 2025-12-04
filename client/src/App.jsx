import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home, BarChart3, Settings, User, LogOut, Menu, X } from 'lucide-react';
import HomePage from './pages/Home';
import DashboardPage from './pages/Dashboard';

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-lg border-b border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">RappelBot</h1>
                  <p className="text-xs text-gray-400">Productivity Gaming Platform</p>
                </div>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition">
                  <Home className="w-4 h-4" />
                  Accueil
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/login" className="flex items-center gap-2 hover:text-blue-400 transition">
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:scale-105 transition">
                  Ajouter le Bot
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
              <div className="md:hidden mt-4 pb-4">
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/" 
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    Accueil
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/login" 
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Connexion
                  </Link>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold">
                    Ajouter le Bot
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<div className="container mx-auto p-8">Page de connexion à venir...</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">RappelBot</h3>
                <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Tous droits réservés</p>
              </div>
              <div className="flex gap-6">
                <Link to="/" className="text-gray-400 hover:text-white transition">Accueil</Link>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
                <a href="#" className="text-gray-400 hover:text-white transition">Documentation</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;