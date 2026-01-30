require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { setupEventListeners } = require('./handlers/events');
const { getStats, cleanOldReminders } = require('./store/reminders');

// ================== EXPRESS API SERVER ==================
const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
    origin: [
        'https://rappel-bot.vercel.app',
        'https://rappelbot.vercel.app',
        'http://localhost:5173' // Dev local
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// ================== API ROUTES (MONITORING) ==================

// SIMPLE DASHBOARD AUTH MIDDLEWARE
const verifyDashboardAccess = (req, res, next) => {
    const { key } = req.query;
    const expectedKey = process.env.DASHBOARD_ACCESS_KEY;

    if (!expectedKey) {
        return res.status(500).json({ error: 'Dashboard access not configured' });
    }

    if (key !== expectedKey) {
        return res.status(403).json({ error: 'Invalid access key' });
    }

    next();
};

// Protected stats endpoint (requires key)
app.get('/api/dashboard/stats', verifyDashboardAccess, (req, res) => {
    try {
        const reminderStats = getStats();

        res.json({
            status: 'online',
            uptime: process.uptime(),
            botUptime: client?.uptime || 0,
            guilds: client?.guilds?.cache?.size || 0,
            users: client?.users?.cache?.size || 0,
            commands: client.commands?.size || 0,
            reminders: reminderStats,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            },
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected guilds endpoint (requires key)
app.get('/api/dashboard/guilds', verifyDashboardAccess, (req, res) => {
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

// Stats du bot
app.get('/api/bot/stats', (req, res) => {
    try {
        const reminderStats = getStats();

        res.json({
            status: 'online',
            uptime: process.uptime(),
            botUptime: client?.uptime || 0,
            guilds: client?.guilds?.cache?.size || 0,
            users: client?.users?.cache?.size || 0,
            commands: client.commands?.size || 0,
            reminders: reminderStats,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            },
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ping pour latence
app.get('/api/ping', (req, res) => {
    const startTime = req.query.start ? parseInt(req.query.start) : Date.now();
    const serverTime = Date.now();
    const roundTripTime = serverTime - startTime;

    res.json({
        pong: true,
        serverTime,
        clientTime: startTime,
        roundTripTime,
        latency: roundTripTime / 2,
        uptime: process.uptime()
    });
});

// Liste des serveurs Discord
app.get('/api/bot/guilds', (req, res) => {
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

// Status API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        bot: 'RappelBot',
        version: '2.0.0',
        uptime: process.uptime(),
        guilds: client?.guilds?.cache?.size || 0,
        commands: client.commands?.size || 0,
        storage: 'RAM'
    });
});

// Health check (pour Render/services)
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

    res.set('Cache-Control', 'no-cache');
    res.set('Connection', 'keep-alive');
    res.json(health);
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: 'RappelBot API v2.0',
        description: 'Bot Discord de rappels contextuels',
        endpoints: {
            health: '/health',
            status: '/api/status',
            stats: '/api/bot/stats',
            guilds: '/api/bot/guilds',
            ping: '/api/ping'
        },
        frontend: 'https://rappelbot.vercel.app',
        storage: 'RAM (in-memory)',
        version: '2.0.0'
    });
});

// Démarrer le serveur Express
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Express démarré sur le port ${PORT}`);
});

// ================== DISCORD CLIENT ==================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,  // Pour les réactions
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

client.commands = new Collection();

// ================== REGISTER COMMANDS ==================

async function registerCommands() {
    try {
        console.log('🔄 Enregistrement des commandes...');

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

        console.log(`✅ ${commands.length} commandes enregistrées !`);
        return true;

    } catch (error) {
        console.error('❌ Erreur enregistrement commandes:', error);
        return false;
    }
}

// ================== INTERACTION HANDLER ==================

client.on('interactionCreate', async (interaction) => {
    try {
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
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) {
                console.error(`❌ Autocomplete non géré pour la commande ${interaction.commandName}`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error('❌ Erreur autocomplete:', error);
            }
        }
    } catch (error) {
        console.error('❌ Erreur interaction:', error);
        const errorMessage = '❌ Une erreur est survenue.';

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// ================== BOT READY EVENT ==================

client.once('clientReady', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);
    console.log(`📊 Serveurs: ${client.guilds.cache.size}`);
    console.log(`👥 Utilisateurs: ${client.users.cache.size}`);

    // Configurer les event listeners pour les rappels contextuels
    setupEventListeners(client);

    // Nettoyer les anciens rappels toutes les 24h
    setInterval(() => {
        cleanOldReminders(720); // 30 jours
    }, 24 * 60 * 60 * 1000);

    // Statut du bot
    client.user.setActivity('/rappel | Rappels contextuels', { type: 0 });

    console.log('🎯 Bot prêt et opérationnel !');
});

// ================== ERROR HANDLING ==================

client.on('error', (error) => {
    console.error('❌ Erreur Discord Client:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// ================== GRACEFUL SHUTDOWN ==================

process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du bot...');
    client.destroy();
    server.close(() => {
        console.log('✅ Serveur Express arrêté');
        process.exit(0);
    });
});

// ================== START BOT ==================

async function startBot() {
    try {
        console.log('🚀 Démarrage de RappelBot v2.0...');

        const commandsRegistered = await registerCommands();
        if (!commandsRegistered) {
            console.log('❌ Échec enregistrement commandes');
            process.exit(1);
        }

        await client.login(process.env.TOKEN);

    } catch (error) {
        console.error('❌ Erreur démarrage bot:', error);
        process.exit(1);
    }
}

// Démarrer après le serveur Express
server.on('listening', () => {
    console.log('✅ Serveur HTTP prêt');
    startBot();
});