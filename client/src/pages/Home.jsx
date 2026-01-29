import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Smile, Key, Zap, Shield, TrendingUp } from 'lucide-react';
import BubbleParticles from '../components/BubbleParticles';
import MouseLight from '../components/MouseLight';

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 overflow-hidden">
      {/* Particle Effects */}
      <BubbleParticles />
      <MouseLight />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-3xl shadow-2xl">
                  <Zap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
              RappelBot
            </h1>
            
            {/* Slogan */}
            <p className="text-3xl md:text-4xl font-light text-gray-300 mb-4">
              Simple. Contextuel. Efficace.
            </p>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Ne ratez plus jamais un événement important grâce aux rappels intelligents et contextuels directement dans Discord.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="#"
                className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Ajouter au Discord
                </span>
              </a>
              
              <Link
                to="/dashboard"
                className="group px-10 py-5 rounded-2xl font-bold text-lg text-white backdrop-blur-lg bg-white/10 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  📚 Voir les Commandes
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 pb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Types de Rappels Contextuels
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Créez des rappels adaptés à vos besoins avec différents déclencheurs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Timer Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[280px] flex flex-col">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">⏰ Timer Relatif</h3>
                <p className="text-gray-400 mb-4">
                  Programmez des rappels dans le futur
                </p>
                <code className="text-sm text-cyan-400 bg-gray-900/50 px-3 py-2 rounded-lg block">
                  /rappel dans 2h
                </code>
              </div>
            </div>

            {/* Mention Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">👤 Mention</h3>
                <p className="text-gray-400 mb-4">
                  Soyez notifié lors d'une mention
                </p>
                <code className="text-sm text-purple-400 bg-gray-900/50 px-3 py-2 rounded-lg block">
                  @utilisateur
                </code>
              </div>
            </div>

            {/* Reaction Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Smile className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">😊 Réaction</h3>
                <p className="text-gray-400 mb-4">
                  Déclencheur par emoji
                </p>
                <code className="text-sm text-yellow-400 bg-gray-900/50 px-3 py-2 rounded-lg block">
                  emoji:✅ #canal
                </code>
              </div>
            </div>

            {/* Keyword Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">🔑 Mot-clé</h3>
                <p className="text-gray-400 mb-4">
                  Surveillez des mots spécifiques
                </p>
                <code className="text-sm text-green-400 bg-gray-900/50 px-3 py-2 rounded-lg block">
                  keyword:"urgent"
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Discord Preview Section */}
        <section className="container mx-auto px-6 pb-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              Simple à Utiliser
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16">
              Une commande suffit pour créer un rappel
            </p>
            
            {/* Discord Mockup */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative backdrop-blur-2xl bg-gray-900/60 border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Discord Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">général</div>
                    <div className="text-xs text-gray-500">Serveur RappelBot</div>
                  </div>
                </div>
                
                {/* Message */}
                <div className="mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-white font-semibold">Utilisateur</span>
                        <span className="text-xs text-gray-500">Aujourd'hui à 14:30</span>
                      </div>
                      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                        <code className="text-blue-300">/rappel dans 30m Pause café ☕</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bot Response */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-semibold">RappelBot</span>
                      <span className="bg-blue-600 text-xs px-2 py-0.5 rounded">BOT</span>
                      <span className="text-xs text-gray-500">Aujourd'hui à 14:30</span>
                    </div>
                    <div className="backdrop-blur-lg bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">✅ Rappel créé</span>
                      </div>
                      <div className="text-white mb-2">
                        <strong>Message:</strong> Pause café ☕
                      </div>
                      <div className="text-gray-300">
                        <strong>Déclencheur:</strong> Dans 30min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;