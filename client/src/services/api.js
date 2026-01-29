import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://rappelbot.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== MONITORING API ====================

export const fetchApiStatus = async () => {
  try {
    const response = await api.get('/api/status');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const fetchBotStats = async () => {
  try {
    const response = await api.get('/api/bot/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching bot stats:', error);
    throw error;
  }
};

export const fetchGuilds = async () => {
  try {
    const response = await api.get('/api/bot/guilds');
    return response.data;
  } catch (error) {
    console.error('Error fetching guilds:', error);
    throw error;
  }
};

export const fetchPing = async () => {
  try {
    const startTime = Date.now();
    const response = await api.get(`/api/ping?start=${startTime}`);
    return response.data;
  } catch (error) {
    console.error('Ping error:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;