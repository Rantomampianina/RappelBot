import React, { useState, useEffect, useCallback } from 'react';
import {
  Server, Users, Bell, Clock,
  Cpu, Database, Activity, TrendingUp,
  Shield, Zap, Home, BarChart3, WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPing } from '../services/api';
import BubbleParticles from '../components/BubbleParticles';
import MouseLight from '../components/MouseLight';

// Composant LatencyMonitor
const LatencyMonitor = () => {
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [currentPing, setCurrentPing] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const pingAPI = useCallback(async () => {
    if (isPinging) return;

    setIsPinging(true);

    try {
      const data = await fetchPing();
      const latency = data.latency || Math.round(data.roundTripTime / 2);

      setCurrentPing(latency);
      setLatencyHistory(prev => {
        const newHistory = [...prev, { time: Date.now(), latency }];
        return newHistory.slice(-20);
      });

    } catch (error) {
      setCurrentPing(null);
      console.log('Ping failed:', error.message);
    } finally {
      setIsPinging(false);
    }
  }, [isPinging]);

  useEffect(() => {
    const interval = setInterval(pingAPI, 30000);
    pingAPI();

    return () => clearInterval(interval);
  }, [pingAPI]);

  const avgLatency = latencyHistory.length > 0
    ? Math.round(latencyHistory.reduce((sum, item) => sum + item.latency, 0) / latencyHistory.length)
    : null;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-300">📡 Moniteur de Latence</h4>
        <button
          onClick={pingAPI}
          disabled={isPinging}
          className="text-xs px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg disabled:opacity-50 font-medium transition-all"
        >
          {isPinging ? 'Ping...' : 'Ping maintenant'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {currentPing ? `${currentPing}ms` : '--'}
          </div>
          <div className="text-xs text-gray-400">Actuel</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {avgLatency ? `${avgLatency}ms` : '--'}
          </div>
          <div className="text-xs text-gray-400">Moyenne</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {latencyHistory.length}
          </div>
          <div className="text-xs text-gray-400">Mesures</div>
        </div>
      </div>

      {latencyHistory.length > 1 && (
        <div className="mt-4">
          <div className="text-xs text-gray-400 mb-2">
            Historique des latences (dernières {latencyHistory.length} mesures)
          </div>
          <div className="h-16 flex items-end gap-1">
            {latencyHistory.slice(-10).map((item, index) => {
              const height = Math.min(100, Math.max(10, (item.latency / 3)));
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${item.latency < 50 ? 'bg-green-500' :
                      item.latency < 100 ? 'bg-yellow-500' :
                        item.latency < 200 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.latency}ms
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [botLoading, setBotLoading] = useState(true);
  const [botError, setBotError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Extract key from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const accessKey = searchParams.get('key');

  const fetchBotData = useCallback(async () => {
    if (!accessKey) {
      setAccessDenied(true);
      setBotLoading(false);
      return;
    }

    try {
      const [statsData, guildsData] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'https://rappelbot.onrender.com'}/api/dashboard/stats?key=${accessKey}`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL || 'https://rappelbot.onrender.com'}/api/dashboard/guilds?key=${accessKey}`).then(r => r.json())
      ]);

      if (statsData.error || guildsData.error) {
        setAccessDenied(true);
        setBotError(statsData.error || guildsData.error);
      } else {
        setStats(statsData);
        setGuilds(guildsData.guilds || []);
        setBotError(null);
      }
    } catch (err) {
      console.error('Error fetching bot data:', err);
      setBotError('Impossible de se connecter au bot');
    } finally {
      setBotLoading(false);
    }
  }, [accessKey]);

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000);
    return () => clearInterval(interval);
  }, [fetchBotData]);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Access Denied Screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 flex items-center justify-center">
        <BubbleParticles />
        <MouseLight />
        <div className="relative z-10 text-center max-w-md p-8">
          <Shield className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-white mb-4">Accès Refusé</h1>
          <p className="text-gray-400 mb-6">
            {botError || "Vous n'avez pas l'autorisation d'accéder à ce dashboard."}
          </p>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">
              Clé d'accès manquante ou invalide
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (botLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 flex items-center justify-center">
        <BubbleParticles />
        <MouseLight />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Connexion au bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 overflow-hidden">
      {/* Particle Effects */}
      <BubbleParticles />
      <MouseLight />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Dashboard RappelBot
            </h1>
            <p className="text-xl text-gray-400">Monitoring et statistiques en temps réel</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 text-white font-medium"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-10 h-10 text-blue-500" />
                  <span className="text-4xl font-bold text-white">{stats?.guilds || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Serveurs</h3>
                <p className="text-gray-400 text-sm">Bot actif sur</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-10 h-10 text-green-500" />
                  <span className="text-4xl font-bold text-white">{stats?.users || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Utilisateurs</h3>
                <p className="text-gray-400 text-sm">Utilisateurs uniques</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Bell className="w-10 h-10 text-purple-500" />
                  <span className="text-4xl font-bold text-white">{stats?.reminders?.active || 0}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Rappels actifs</h3>
                <p className="text-gray-400 text-sm">En mémoire</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-10 h-10 text-yellow-500" />
                  <span className="text-4xl font-bold text-white">{formatUptime(stats?.uptime || 0)}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Uptime</h3>
                <p className="text-gray-400 text-sm">Temps d'activité</p>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <Activity className="w-6 h-6 text-blue-500" />
                Performance
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-purple-500" />
                    <span className="text-sm text-gray-400">RAM</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">
                      {stats?.memory ? `${stats.memory.used}MB` : '0MB'}
                    </span>
                    <span className="text-gray-400 text-sm pb-1">/ {stats?.memory ? `${stats.memory.total}MB` : '0MB'}</span>
                  </div>
                </div>

                <div className="p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="text-sm text-gray-400">Commandes</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.commands || 0}</div>
                  <p className="text-gray-400 text-sm">Enregistrées</p>
                </div>

                <div className="p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-red-500" />
                    <span className="text-sm text-gray-400">Total rappels</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.reminders?.total || 0}</div>
                  <p className="text-gray-400 text-sm">Depuis le début</p>
                </div>

                <div className="p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-green-500" />
                    <span className="text-sm text-gray-400">Stockage</span>
                  </div>
                  <div className="text-xl font-bold text-white">RAM</div>
                  <p className="text-gray-400 text-sm">En mémoire</p>
                </div>
              </div>

              <LatencyMonitor />
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Types de rappels
              </h2>

              <div className="space-y-4">
                {stats?.reminders?.byType && Object.entries(stats.reminders.byType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 capitalize font-medium">{type}</span>
                      <span className="font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: stats.reminders.active > 0 ? `${(count / stats.reminders.active) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Server List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <Server className="w-6 h-6 text-blue-500" />
              Serveurs ({guilds.length})
            </h2>

            {guilds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun serveur trouvé
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guilds.map((guild) => (
                  <div key={guild.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        {guild.icon ? (
                          <img src={guild.icon} alt={guild.name} className="w-14 h-14 rounded-xl" />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Server className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-white truncate">{guild.name}</h3>
                          <p className="text-gray-400 text-sm">{guild.members} membres</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Rejoint le {new Date(guild.joinedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {botError && (
            <div className="fixed bottom-6 right-6 backdrop-blur-xl bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-2xl max-w-md shadow-2xl z-50">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Erreur de connexion</p>
                  <p className="text-sm">{botError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;