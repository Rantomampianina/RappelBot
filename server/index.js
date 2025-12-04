require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const oauthRouter = require('./handlers/oauth');

// ✅ SERVEUR EXPRESS POUR L'API ET RENDER
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS pour React
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://rappelbot-frontend.vercel.app',
    'https://rappelbot.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ API HEALTH POUR RENDER (obligatoire)
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'rappelbot-api',
    uptime: process.uptime(),
    discord: client?.readyAt ? 'connected' : 'connecting',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };
  
  res.set('Cache-Control', 'no-cache');
  res.json(health);
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
    const reminders = await Rappel.find({ discordId: req.params.userId, completed: false });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ ROUTER OAUTH
app.use('/auth', oauthRouter);

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

// Démarrer le serveur web
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
});

// ✅ CLIENT DISCORD (inchangé)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// ... [Tout le reste du code du bot reste identique]
// Gardez tout le code du bot Discord à partir de "client.commands = new Collection();"
// Jusqu'à la fin du fichier

client.commands = new Collection();

// FONCTION ANTI-SLEEP SYSTEM
function setupAntiSleep() {
    const RENDER_URL = `https://${process.env.RENDER_SERVICE_NAME || 'rappelbot'}.onrender.com`;
    
    // 1. Ping interne (actif quand le bot tourne)
    setInterval(async () => {
        try {
            const response = await fetch(`${RENDER_URL}/health`);
            if (response.ok) {
                console.log('✅ Auto-ping réussi');
            }
        } catch (error) {
            console.log('⚠️ Auto-ping échoué (normal si bot vient de démarrer)');
        }
    }, 4.5 * 60 * 1000); // 4.5 minutes (plus rapide que UptimeRobot)
    
    // 2. Logs de monitoring
    setInterval(() => {
        if (client && client.uptime) {
            const uptimeMinutes = Math.floor(client.uptime / 60000);
            const memoryUsage = process.memoryUsage();
            console.log(`📊 Stats: ${uptimeMinutes}min actif | RAM: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
        }
    }, 10 * 60 * 1000); // Toutes les 10 minutes
    
    console.log('🛡️ Système anti-sleep activé');
}

// Appeler au démarrage
setupAntiSleep();

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
        const { setupAlarmChecker, planifierRappel } = require('./handlers/alarm');
        
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ En attente de la connexion DB...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        
        const rappels = await Rappel.find({ completed: false });
        console.log(`📋 ${rappels.length} rappels à planifier`);
        
        for (const rappel of rappels) {
            planifierRappel(rappel);
        }
        
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

// Démarrer le bot
startBot();