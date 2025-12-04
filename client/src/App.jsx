import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Bell,
  Settings,
  Users,
  BarChart,
  Shield,
  Globe,
  Zap,
  Cloud,
  Cpu
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`);
      setApiStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Rappels Intelligents",
      description: "Rappels automatisés avec IA et planification intelligente"
    },
    {
      icon: <CalendarDays className="w-8 h-8" />,
      title: "Google Calendar Sync",
      description: "Synchronisation bidirectionnelle avec Google Calendar"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestion d'Équipe",
      description: "Rappels partagés et collaboration en temps réel"
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Analytics Avancés",
      description: "Statistiques détaillées et insights personnalisés"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sécurité Maximale",
      description: "Chiffrement end-to-end et protection des données"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-plateforme",
      description: "Discord, Web, Mobile et intégrations API"
    }
  ];

  const stats = [
    { label: "Serveurs Actifs", value: apiStatus?.guilds || "0", color: "text-green-500" },
    { label: "Uptime", value: apiStatus ? `${Math.floor(apiStatus.uptime / 3600)}h` : "0h", color: "text-blue-500" },
    { label: "Commandes", value: apiStatus?.commands || "0", color: "text-purple-500" },
    { label: "Statut", value: apiStatus?.status || "Offline", color: apiStatus?.status === 'online' ? 'text-green-500' : 'text-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">RappelBot</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="hover:text-blue-400 transition">Fonctionnalités</a>
              <a href="#stats" className="hover:text-blue-400 transition">Statistiques</a>
              <a href="#api" className="hover:text-blue-400 transition">API</a>
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            RappelBot Pro
          </span>
        </h1>
        <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          La plateforme de productivité ultime pour Discord. Rappels intelligents, 
          intégration Google Calendar et analytics avancés.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105">
            Ajouter au Discord
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-xl font-bold text-lg transition border border-gray-700">
            Essayer le Dashboard
          </button>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Fonctionnalités Premium</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition group">
              <div className="text-blue-500 mb-4 group-hover:scale-110 transition">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Status */}
      <section id="api" className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">API Status</h2>
              <p className="text-gray-400">Connectivité backend en temps réel</p>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-8 h-8 text-green-500" />
              <Cloud className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : apiStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-2xl font-bold text-green-500">Online</div>
              </div>
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-sm text-gray-400">Serveurs</div>
                <div className="text-2xl font-bold">{apiStatus.guilds}</div>
              </div>
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-sm text-gray-400">Version</div>
                <div className="text-2xl font-bold">{apiStatus.version}</div>
              </div>
              <div className="bg-black/50 rounded-xl p-4">
                <div className="text-sm text-gray-400">Uptime</div>
                <div className="text-2xl font-bold">{Math.floor(apiStatus.uptime / 3600)}h</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 text-2xl font-bold">API Offline</div>
              <p className="text-gray-400 mt-2">Le backend ne répond pas</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">RappelBot</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} RappelBot. Tous droits réservés.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Docs</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Support</a>
              <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;