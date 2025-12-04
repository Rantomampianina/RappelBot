import React, { useState, useEffect } from 'react';
import { 
  Server,
  Clock, 
  Cpu, 
  Database, 
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Home, Settings, Users, Bell, BarChart3, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000); // Actualiser toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const fetchBotData = async () => {
    try {
      const [statsRes, guildsRes] = await Promise.all([
        axios.get(`${API_URL}/api/bot/stats`),
        axios.get(`${API_URL}/api/bot/guilds`)
      ]);
      
      setStats(statsRes.data);
      setGuilds(guildsRes.data.guilds);
      setError(null);
    } catch (err) {
      console.error('Error fetching bot data:', err);
      setError('Impossible de se connecter au bot');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Connexion au bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
    {/* Sidebar */}
    <div className="hidden md:flex w-64 bg-gray-800/50 backdrop-blur-lg flex-col p-6 border-r border-gray-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400 text-sm">Espace administrateur</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        <Link 
          to="/" 
          className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
        >
          <Home className="w-5 h-5" />
          Accueil public
        </Link>
        <a 
          href="#" 
          className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
        >
          <BarChart3 className="w-5 h-5" />
          Vue d'ensemble
        </a>
        <a 
          href="#" 
          className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
        >
          <Users className="w-5 h-5" />
          Serveurs
        </a>
        <a 
          href="#" 
          className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
        >
          <Bell className="w-5 h-5" />
          Rappels
        </a>
        <a 
          href="#" 
          className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
        >
          <Settings className="w-5 h-5" />
          Paramètres
        </a>
      </nav>
      
      <div className="pt-6 border-t border-gray-700">
        <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            Dashboard RappelBot
          </h1>
          <p className="text-gray-400 mt-2">Gestion et monitoring en temps réel</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${stats ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {stats ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="font-semibold">{stats ? 'En ligne' : 'Hors ligne'}</span>
          </div>
          <button 
            onClick={fetchBotData}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold">{stats?.guilds || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Serveurs</h3>
          <p className="text-gray-400 text-sm">Bot actif sur</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold">{stats?.users || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Utilisateurs</h3>
          <p className="text-gray-400 text-sm">Utilisateurs uniques</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-8 h-8 text-purple-500" />
            <span className="text-3xl font-bold">{stats?.reminders?.active || 0}</span>
          </div>
          <h3 className="text-lg font-semibold">Rappels actifs</h3>
          <p className="text-gray-400 text-sm">En attente</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold">{formatUptime(stats?.uptime || 0)}</span>
          </div>
          <h3 className="text-lg font-semibold">Uptime</h3>
          <p className="text-gray-400 text-sm">Temps d'activité</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            Performance
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">CPU</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {stats?.memory ? `${Math.round((stats.memory.used / stats.memory.total) * 100)}%` : '0%'}
                </span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: stats?.memory ? `${Math.round((stats.memory.used / stats.memory.total) * 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-400">RAM</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {stats?.memory ? `${stats.memory.used}MB` : '0MB'}
                </span>
                <span className="text-gray-400 text-sm">/ {stats?.memory ? `${stats.memory.total}MB` : '0MB'}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-400">Commandes</span>
              </div>
              <div className="text-2xl font-bold">{stats?.commands || 0}</div>
              <p className="text-gray-400 text-sm">Commandes enregistrées</p>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-400">Total rappels</span>
              </div>
              <div className="text-2xl font-bold">{stats?.reminders?.total || 0}</div>
              <p className="text-gray-400 text-sm">Depuis le début</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Statistiques rapides
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Taux d'utilisation</span>
                <span className="font-semibold">
                  {stats?.guilds ? `${Math.min(stats.guilds * 10, 100)}%` : '0%'}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: stats?.guilds ? `${Math.min(stats.guilds * 10, 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Stabilité</span>
                <span className="font-semibold text-green-500">100%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Latence API</span>
                <span className="font-semibold">42ms</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-yellow-500 to-orange-500 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server List */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Server className="w-6 h-6 text-blue-500" />
          Serveurs ({guilds.length})
        </h2>
        
        {guilds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun serveur trouvé
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds.map((guild) => (
              <div key={guild.id} className="p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition">
                <div className="flex items-center gap-3 mb-3">
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-12 h-12 rounded-xl" />
                  ) : (
                    <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Server className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold truncate">{guild.name}</h3>
                    <p className="text-gray-400 text-sm">{guild.members} membres</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Rejoint le {new Date(guild.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl max-w-md">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-semibold">Erreur de connexion</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Dashboard;