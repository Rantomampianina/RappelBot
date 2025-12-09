require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const oauthRouter = require('./handlers/oauth');
const axios = require('axios');
const https = require('https');

// ✅ SERVEUR EXPRESS POUR L'API ET RENDER
const app = express();
const PORT = process.env.PORT || 3000;

// AJOUTEZ CE MIDDLEWARE CORS AU DÉBUT :
app.use(cors({
  origin: [
    'https://rappel-bot.vercel.app',
    'https://rappelbot.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// AJOUTEZ CE MIDDLEWARE POUR LES OPTIONS REQUESTS :
app.options('*', cors());
app.use(express.json());

// ✅ API POUR REACT
app.get('/api/bot/stats', async (req, res) => {
  try {
    const Rappel = require('./models/Rappel');
    
    // Compter les rappels
    const totalReminders = await Rappel.countDocuments();
    const activeReminders = await Rappel.countDocuments({ completed: false });
    
    res.json({
      status: 'online',
      uptime: process.uptime(),
      botUptime: client?.uptime || 0,
      guilds: client?.guilds?.cache?.size || 0,
      users: client?.users?.cache?.size || 0,
      commands: client.commands?.size || 0,
      reminders: {
        total: totalReminders,
        active: activeReminders
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dans le backend (server/index.js)
app.get('/api/ping', (req, res) => {
  const startTime = req.query.start ? parseInt(req.query.start) : Date.now();
  const serverTime = Date.now();
  const roundTripTime = serverTime - startTime;
  
  res.json({
    pong: true,
    serverTime,
    clientTime: startTime,
    roundTripTime,
    latency: roundTripTime / 2, // Estimation latence réseau (aller simple)
    uptime: process.uptime()
  });
});

// ✅ ROUTE POUR LES SERVEURS
app.get('/api/bot/guilds', async (req, res) => {
  try {
    const guilds = client?.guilds?.cache?.map(guild => ({
      id: guild.id,
      name: guild.name,
      members: guild.memberCount,
      icon: guild.iconURL({ size: 128 }),
      joinedAt: guild.joinedAt
    })) || [];
    
    res.json({ guilds });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ API ROUTES POUR REACT
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    bot: 'RappelBot',
    version: '1.0.0',
    uptime: process.uptime(),
    guilds: client?.guilds?.cache?.size || 0,
    commands: client.commands?.size || 0
  });
});

// ✅ ROUTES DE RAPPELS POUR REACT
app.get('/api/reminders/:userId', async (req, res) => {
  try {
    const Rappel = require('./models/Rappel');
    const reminders = await Rappel.find({ user: req.params.userId, completed: false }); // user au lieu de discordId
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ ROUTER OAUTH
app.use('/auth', oauthRouter);

// ✅ ROUTE HEALTH OBLIGATOIRE (Render la vérifie)
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'rappelbot',
        uptime: process.uptime(),
        discord: client?.readyAt ? 'connected' : 'connecting',
        guilds: client?.guilds?.cache?.size || 0,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    };
    
    // Réponse RAPIDE pour UptimeRobot et auto-ping
    res.set('Cache-Control', 'no-cache');
    res.set('Connection', 'keep-alive');
    res.json(health);
});

// ✅ ROUTE RACINE SIMPLE
app.get('/', (req, res) => {
  res.json({
    message: 'RappelBot API',
    endpoints: {
      health: '/health',
      status: '/api/status',
      reminders: '/api/reminders/:userId',
      auth: '/auth/google'
    },
    frontend: 'https://rappelbot.vercel.app'
  });
});

// Ajoutez cette route API :
app.get('/api/debug/time', (req, res) => {
    const { getCurrentTimeInTimezone, getCurrentDateInTimezone } = require('./handlers/alarm');
    
    res.json({
        server: {
            iso: new Date().toISOString(),
            local: new Date().toString(),
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        europeParis: {
            date: getCurrentDateInTimezone('Europe/Paris'),
            time: getCurrentTimeInTimezone('Europe/Paris'),
            offset: getTimezoneOffset('Europe/Paris')
        },
        utc: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toISOString().split('T')[1].split('.')[0]
        }
    });
});

// Fonction helper (ajoutez-la dans index.js ou importez-la)
function getTimezoneOffset(timezone) {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        });
        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find(part => part.type === 'timeZoneName');
        return offsetPart ? offsetPart.value : 'Unknown';
    } catch (error) {
        return 'Error: ' + error.message;
    }
}

// Démarrer le serveur web
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Express démarré sur le port ${PORT}`);
    
    // ✅ APPELER ANTI-SLEEP APRÈS QUE LE SERVEUR SOIT PRÊT
    setTimeout(() => {
        setupAntiSleep();
    }, 2000);
});

// ✅ CLIENT DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

client.commands = new Collection();

// FONCTION ANTI-SLEEP SYSTEM CORRIGÉE
function setupAntiSleep() {
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `https://${process.env.RENDER_SERVICE_NAME || 'rappelbot'}.onrender.com`;
    
    // Créer un agent HTTPS qui ignore les erreurs de certificat (pour éviter les timeout)
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        timeout: 10000 // 10 secondes max
    });
    
    // 1. Ping externe (très important pour Render)
    setInterval(async () => {
        try {
            const pingStart = Date.now();
            const response = await axios.get(`${RENDER_URL}/health`, {
                httpsAgent,
                timeout: 15000,
                headers: {
                    'User-Agent': 'RappelBot-AntiSleep/1.0'
                }
            });
            
            const pingTime = Date.now() - pingStart;
            
            if (response.status === 200) {
                console.log(`✅ Auto-ping réussi (${pingTime}ms) :`, response.data?.status || 'OK');
            } else {
                console.log(`⚠️ Ping HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.log('🔴 Auto-ping échoué:', error.message);
            
            // Tentative de fallback avec la racine
            try {
                await axios.get(`${RENDER_URL}/`, {
                    httpsAgent,
                    timeout: 10000
                });
                console.log('✅ Fallback ping réussi via /');
            } catch (fallbackError) {
                console.log('🔴 Fallback ping aussi échoué');
            }
            
        }
    }, 4.5 * 60 * 1000); // 4.5 minutes (CRITIQUE pour Render)
    
    // 2. Ping immédiat au démarrage
    setTimeout(() => {
        console.log('🚀 Premier ping anti-sleep...');
        // Appel asynchrone sans attendre
        axios.get(`${RENDER_URL}/health`, {
            httpsAgent,
            timeout: 10000
        }).then(res => {
            console.log('✅ Premier ping OK');
        }).catch(err => {
            console.log('⚠️ Premier ping échoué:', err.message);
        });
    }, 10000); // 10 secondes après démarrage
    
    // 3. Logs de monitoring améliorés
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const uptimeMinutes = client?.uptime ? Math.floor(client.uptime / 60000) : 0;
        const processUptimeMinutes = Math.floor(process.uptime() / 60);
        
        console.log(`📊 Monitoring:`);
        console.log(`   Process uptime: ${processUptimeMinutes}min`);
        console.log(`   Bot uptime: ${uptimeMinutes}min`);
        console.log(`   RAM: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
        console.log(`   RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`);
        console.log(`   Guilds: ${client?.guilds?.cache?.size || 0}`);
        // console.log(`   Ping actif: ${RENDER_URL}`);
    }, 5 * 60 * 1000); // Toutes les 5 minutes
    
    console.log(`🛡️ Système anti-sleep activé pour ${RENDER_URL}`);
}

// ✅ REFACTORISATION DE LA GESTION DES INTERACTIONS
async function handleButtonInteraction(interaction) {
    const [action, rappelId] = interaction.customId.split('_');
    
    try {
        // Boutons de rappels
        if (action === 'complete') {
            const Rappel = require('./models/Rappel');
            await Rappel.findByIdAndDelete(rappelId);
            await interaction.reply({ content: '✅ Rappel marqué comme fait !', ephemeral: true });
            return;
        }
        
        if (action === 'snooze') {
            const Rappel = require('./models/Rappel');
            const rappel = await Rappel.findById(rappelId);
            if (rappel) {
                const [hours, minutes] = rappel.time.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours), parseInt(minutes) + 5);
                const newTimeStr = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
                
                rappel.time = newTimeStr;
                rappel.completed = false;
                await rappel.save();
                
                const { planifierRappel } = require('./handlers/alarm');
                planifierRappel(rappel);
                
                await interaction.reply({ content: '⏸️ Rappel reporté de 5 minutes !', ephemeral: true });
            }
            return;
        }

        // Boutons Google Calendar
        if (interaction.customId.startsWith('google_') || interaction.customId.startsWith('create_google_')) {
            const { handleGoogleButton } = require('./handlers/google');
            await handleGoogleButton(interaction);
            return;
        }
        
        if (interaction.customId === 'google_close') {
            const { handleGoogleClose } = require('./handlers/google');
            await handleGoogleClose(interaction);
            return;
        }

        // Boutons de configuration
        if (interaction.customId === 'google_toggle') {
            const Config = require('./models/Config');
            let config = await Config.findOne({ guildId: interaction.guildId });
            if (!config) {
                config = new Config({ guildId: interaction.guildId });
            }
            config.useGoogleCalendar = !config.useGoogleCalendar;
            await config.save();
            await interaction.reply({ 
                content: `✅ Google Calendar **${config.useGoogleCalendar ? 'activé' : 'désactivé'}**`, 
                ephemeral: true 
            });
            return;
        }

        if (interaction.customId === 'google_disconnect') {
            const Config = require('./models/Config');
            await Config.findOneAndUpdate(
                { guildId: interaction.guildId },
                { 
                    useGoogleCalendar: false,
                    $unset: { googleCredentials: 1 }
                }
            );
            await interaction.reply({ 
                content: '✅ Google Calendar déconnecté avec succès', 
                ephemeral: true 
            });
            return;
        }
        
        // Si on arrive ici, le bouton n'est pas reconnu
        await interaction.reply({ content: '❌ Action non reconnue', ephemeral: true });
        
    } catch (error) {
        console.error('❌ Erreur bouton:', error);
        await interaction.reply({ 
            content: '❌ Erreur lors du traitement du bouton', 
            ephemeral: true 
        });
    }
}

// ✅ GESTION DES INTERACTIONS SIMPLIFIÉE
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        }

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.reply({ 
                    content: '❌ Commande non trouvée', 
                    ephemeral: true 
                });
                return;
            }
            
            await command.execute(interaction);
        }
    } catch (error) {
        console.error('❌ Erreur interaction:', error);
        const errorMessage = '❌ Une erreur est survenue lors du traitement.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// ✅ FONCTIONS EXISTANTES (conservées)
async function registerCommands() {
    try {
        console.log('🔄 Enregistrement automatique des commandes...');
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const command = require(path.join(commandsPath, file));
                if (command.data && command.execute) {
                    commands.push(command.data.toJSON());
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Commande chargée: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`❌ Erreur chargement ${file}:`, error.message);
            }
        }

        const rest = new REST().setToken(process.env.TOKEN);
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(`✅ ${commands.length} commandes enregistrées avec succès !`);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur enregistrement commandes:', error);
        return false;
    }
}

async function initializeAlarms() {
    try {
        console.log('🔔 Initialisation des alarmes...');
        
        const Rappel = require('./models/Rappel');
        const { setupAlarmChecker, replanifierToutesAlarmes } = require('./handlers/alarm');
        
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ En attente de la connexion DB...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        
        // Replanifier toutes les alarmes existantes
        await replanifierToutesAlarmes();
        
        // Configurer le vérificateur
        setupAlarmChecker(client);
        console.log('✅ Système d\'alarmes initialisé');
        
        return true;
    } catch (error) {
        console.error('❌ Erreur initialisation alarmes:', error);
        return false;
    }
}

// ✅ ÉVÉNEMENT READY
client.once('clientReady', async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    console.log(`📊 ${client.guilds.cache.size} serveurs`);

    try {
        await initializeAlarms();
        client.user.setActivity('/rappel | Rappels intelligents', { type: 'WATCHING' });
        console.log('🎯 Bot complètement initialisé et prêt !');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
});

// ✅ GESTION DES ERREURS
client.on('error', (error) => {
    console.error('❌ Erreur Client Discord:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// ✅ GESTION ARRÊT
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du bot...');
    client.destroy();
    await mongoose.connection.close();
    server.close(() => {
        console.log('✅ Serveur Express arrêté');
        process.exit(0);
    });
});

// ✅ CONNEXION DATABASE
async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Base de données connectée');
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion DB:', error);
        return false;
    }
}

// ✅ DÉMARRAGE AUTOMATIQUE
async function startBot() {
    try {
        console.log('🚀 Démarrage du bot...');
        
        const commandsRegistered = await registerCommands();
        if (!commandsRegistered) {
            console.log('❌ Échec enregistrement commandes, arrêt...');
            process.exit(1);
        }
        
        const dbConnected = await connectDatabase();
        if (!dbConnected) {
            console.log('❌ Échec connexion DB, arrêt...');
            process.exit(1);
        }
        
        await client.login(process.env.TOKEN);
        
    } catch (error) {
        console.error('❌ Erreur démarrage bot:', error);
        process.exit(1);
    }
}

// Démarrer le bot APRÈS que le serveur soit prêt
server.on('listening', () => {
    console.log('✅ Serveur HTTP prêt, démarrage du bot...');
    startBot();
});