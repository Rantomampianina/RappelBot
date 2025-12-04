import React from 'react';
import { Link } from 'react-router-dom';
import { Discord, Mail, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Connexion Admin</h1>
            <p className="text-gray-400 mt-2">Accédez au dashboard RappelBot</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Discord Login */}
            <button className="w-full flex items-center justify-center gap-3 p-4 bg-[#5865F2] hover:bg-[#4752c4] rounded-xl transition">
              <Discord className="w-6 h-6" />
              <span className="font-semibold">Se connecter avec Discord</span>
            </button>

            {/* Email Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@rappelbot.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button className="w-full flex items-center justify-center gap-2 p-4 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition">
                Se connecter
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              <Link to="/" className="text-blue-400 hover:text-blue-300 transition">
                ← Retour à l'accueil
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Cette section est réservée aux administrateurs du bot.
              Contactez le support pour obtenir un accès.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;