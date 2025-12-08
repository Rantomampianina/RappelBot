import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Cpu,
  Globe,
  Users,
  BarChart3,
  Bot,
  Sparkles,
  Gamepad2,
  Rocket,
  Code,
  Lock
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://rappelbot.onrender.com';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/bot/stats`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "IA Intégrée",
      description: "Algorithmes d'IA pour des rappels intelligents",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Automation",
      description: "Automatisation complète des tâches répétitives",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Gamification",
      description: "Système de niveaux et récompenses",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Performance",
      description: "Latence ultra-faible < 50ms",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "API Complète",
      description: "Documentation développeur",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Sécurité",
      description: "Chiffrement end-to-end",
      color: "from-gray-700 to-gray-900"
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-32 text-center">

          <Link to="/dashboard">
            <button className="px-10 py-5 bg-gray-800/50 backdrop-blur-lg border-2 border-gray-700 rounded-2xl font-bold text-xl hover:border-blue-500 hover:bg-gray-800 transition-all duration-300">
              Dashboard Admin
            </button>
          </Link>

          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-linear-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30">
            <div className="animate-pulse">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-lg font-semibold bg-linear-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VERSION PRO LIVE
            </span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              RappelBot
            </span>
            <span className="block text-4xl md:text-5xl mt-4 text-gray-300">
              Gaming meets Productivity
            </span>
          </h1>
          
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Le bot Discord qui transforme votre productivité en{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-purple-400 font-bold">
              expérience gaming
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="group relative px-10 py-5 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">Ajouter au Discord</span>
            </button>
            
            <Link to="/dashboard">
              <button className="px-10 py-5 bg-gray-800/50 backdrop-blur-lg border-2 border-gray-700 rounded-2xl font-bold text-xl hover:border-blue-500 hover:bg-gray-800 transition-all duration-300">
                Dashboard Pro
              </button>
            </Link>
          </div>

          {/* Live Stats */}
          <div className="inline-flex items-center gap-8 p-6 bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700">
            {stats && (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-linear-to-br from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    {stats.guilds}+
                  </div>
                  <div className="text-gray-400">Serveurs</div>
                </div>
                <div className="h-12 w-px bg-linear-to-b from-transparent via-gray-600 to-transparent"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-linear-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {stats.users}+
                  </div>
                  <div className="text-gray-400">Utilisateurs</div>
                </div>
                <div className="h-12 w-px bg-linear-to-b from-transparent via-gray-600 to-transparent"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-linear-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-gray-400">Uptime</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-5xl font-bold text-center mb-16">
            <span className="bg-linear-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Features Pro
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`absolute inset-0 bg-linear-to-br ${feature.color} rounded-3xl blur-xl transition-opacity duration-500 ${
                  hoveredCard === index ? 'opacity-50' : 'opacity-0'
                }`}></div>
                
                <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-gray-700 group-hover:border-transparent transition-all duration-500 group-hover:scale-105">
                  <div className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${feature.color} mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border-2 border-gray-700 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Prêt à booster votre productivité ?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui transforment déjà leur 
              expérience Discord avec RappelBot.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-4 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                Commencer Gratuitement
              </button>
              <button className="px-12 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl font-bold text-lg hover:border-blue-500 transition-colors">
                Voir la Démo
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;