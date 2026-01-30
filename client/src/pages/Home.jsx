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
              Simple | Contextuel | Efficace
            </p>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Ne ratez plus jamais un événement important grâce aux rappels intelligents et contextuels directement dans Discord.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="https://discord.com/oauth2/authorize?client_id=1416353909395558451"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform -skew-x-12 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md"
              >
                <div className="flex items-center gap-3 transform skew-x-12">
                  <span className="relative flex items-center gap-3">
                    <Zap className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
                    Ajouter au Discord
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">_</span>
                </div>
              </a>
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
                <p className="text-gray-400 mb-4 flex-grow">
                  Programmez des rappels dans le futur
                </p>
                <code className="text-sm text-cyan-400 bg-gray-900/50 px-3 py-2 rounded-lg block mt-auto">
                  /rappel dans 2h
                </code>
              </div>
            </div>

            {/* Mention Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[280px] flex flex-col">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">👤 Mention</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  Soyez notifié lors d'une mention
                </p>
                <code className="text-sm text-purple-400 bg-gray-900/50 px-3 py-2 rounded-lg block mt-auto">
                  @utilisateur
                </code>
              </div>
            </div>

            {/* Reaction Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[280px] flex flex-col">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Smile className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">😊 Réaction</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  Déclencheur par emoji
                </p>
                <code className="text-sm text-yellow-400 bg-gray-900/50 px-3 py-2 rounded-lg block mt-auto">
                  emoji:✅ #canal
                </code>
              </div>
            </div>

            {/* Keyword Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[280px] flex flex-col">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">🔑 Mot-clé</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  Surveillez des mots spécifiques
                </p>
                <code className="text-sm text-green-400 bg-gray-900/50 px-3 py-2 rounded-lg block mt-auto">
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
            {/* Documentation Button - Hyperspace Effect */}
            <div className="flex justify-center mt-12">
              <button
                className="btn-hyperspace group relative px-12 py-6 rounded-full font-bold text-xl text-white overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.6)]"
              >
                <div className="absolute inset-0 bg-black opacity-80 z-0"></div>

                {/* Light Particles/Streaks Container */}
                <div className="absolute inset-0 z-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 animate-hyperspace bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(255,255,255,0.1)_50px,rgba(255,255,255,0.1)_100px)]"></div>
                  <div className="absolute inset-0 animate-hyperspace-fast bg-[repeating-linear-gradient(90deg,transparent,transparent_100px,rgba(236,72,153,0.3)_100px,rgba(236,72,153,0.3)_120px)] mix-blend-screen"></div>
                </div>

                <span className="relative z-10 flex items-center gap-3 group-hover:italic transition-all">
                  Documentation
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
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

        .animate-hyperspace {
            animation: hyperspace 0.5s linear infinite;
            width: 200%;
        }

        .animate-hyperspace-fast {
            animation: hyperspace 0.2s linear infinite;
            width: 200%;
        }

        @keyframes hyperspace {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        /* Glitch Button Styles */
        .btn-glitch {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 20px 40px;
          min-width: 175px;
          font-weight: 700;
          font-size: 1.125rem;
          line-height: 1.5em;
          white-space: nowrap;
          cursor: pointer;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-glitch:hover,
        .btn-glitch:focus {
          animation-name: glitch;
          animation-duration: 0.2s;
          background-color: transparent;
          border-color: rgba(6, 182, 212, 0.8); /* Cyan-500 */
        }

        .btn-glitch:hover .text-content {
          animation-name: blink;
          animation-duration: 0.1s;
          animation-iteration-count: infinite;
        }

        @keyframes glitch {
          25% {
            background-color: rgba(147, 51, 234, 0.5); /* Purple-600 */
            transform: translateX(-5px);
            letter-spacing: 2px;
          }

          35% {
            background-color: rgba(6, 182, 212, 0.5); /* Cyan-500 */
            transform: translate(5px);
          }

          59% {
            opacity: 0.8;
          }

          60% {
            background-color: rgba(37, 99, 235, 0.5); /* Blue-600 */
            transform: translate(-5px);
            filter: blur(2px);
          }

          100% {
            background-color: rgba(6, 182, 212, 0.2);
            filter: blur(0);
          }
        }

        @keyframes blink {
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;