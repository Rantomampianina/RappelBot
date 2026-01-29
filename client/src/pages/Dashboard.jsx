import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, Users, Bell, Clock, 
  Cpu, Database, Activity, TrendingUp,
  Shield, Zap, Home, BarChart3, WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchBotStats, fetchGuilds, fetchPing } from '../services/api';

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
    <div className="bg-gray-800/30 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-300">📡 Moniteur de Latence</h4>
        <button 
          onClick={pingAPI}
          disabled={isPinging}
          className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
        >
          {isPinging ? 'Ping...' : 'Ping maintenant'}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
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
                    className={`w-full rounded-t ${
                      item.latency < 50 ? 'bg-green-500' :
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

  const fetchBotData = useCallback(async () => {
    try {
      const [statsData, guildsData] = await Promise.all([
        fetchBotStats(),
        fetchGuilds()
      ]);
      
      setStats(statsData);
      setGuilds(guildsData.guilds || []);
      setBotError(null);
    } catch (err) {
      console.error('Error fetching bot data:', err);
      setBotError('Impossible de se connecter au bot');
    } finally {
      setBotLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 30000); // Actualiser toutes les 30s
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

  if (botLoading) {
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
          <p className="text-gray-400 text-sm">Monitoring RappelBot</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link 
            to="/" 
            className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
          <a 
            href="#" 
            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
          >
            <BarChart3 className="w-5 h-5" />
            Statistiques
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard RappelBot v2.0</h1>
          <p className="text-gray-400 mt-2">Monitoring et statistiques en temps réel</p>
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
            <p className="text-gray-400 text-sm">En mémoire</p>
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
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-400">Commandes</span>
                </div>
                <div className="text-2xl font-bold">{stats?.commands || 0}</div>
                <p className="text-gray-400 text-sm">Enregistrées</p>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-400">Total rappels</span>
                </div>
                <div className="text-2xl font-bold">{stats?.reminders?.total || 0}</div>
                <p className="text-gray-400 text-sm">Depuis le début</p>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Stockage</span>
                </div>
                <div className="text-lg font-bold">RAM</div>
                <p className="text-gray-400 text-sm">En mémoire</p>
              </div>
            </div>

            <LatencyMonitor />
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Types de rappels
            </h2>
            
            <div className="space-y-3">
              {stats?.reminders?.byType && Object.entries(stats.reminders.byType).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: stats.reminders.active > 0 ? `${(count / stats.reminders.active) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              ))}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
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
        {botError && (
          <div className="fixed bottom-6 right-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl max-w-md">
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
  );
};

export default Dashboard;