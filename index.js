require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');
const oauthRouter = require('./handlers/oauth');

// ✅ SERVEUR EXPRESS POUR RENDER
const app = express();
const PORT = process.env.PORT || 3000;


app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'rappelbot',
        uptime: process.uptime(),
        discord: client?.readyAt ? 'connected' : 'connecting',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    };
    
    // Réponse rapide pour UptimeRobot
    res.set('Cache-Control', 'no-cache');
    res.json(health);
});

// Route racine optimisée
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 RappelBot - GitHub Codespaces</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #2ea44f 0%, #1a7f37 100%);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .status {
                    background: rgba(255,255,255,0.2);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .online { color: #00ff00; font-weight: bold; }
                a {
                    color: #ffd700;
                    text-decoration: none;
                    font-weight: 500;
                }
                a:hover { text-decoration: underline; }
                code {
                    background: rgba(0,0,0,0.3);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', monospace;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 RappelBot</h1>
                <div class="status">
                    <p class="online">✅ Bot Discord en ligne sur Render</p>
                    <p><strong>Statut :</strong> 24/7 actif - Hébergement GitHub 🚀</p>
                    <p><strong>Fonctionnalités :</strong></p>
                    <ul>
                        <li>Rappels intelligents avec IA</li>
                        <li>Intégration Google Calendar</li>
                        <li>Commandes slash Discord</li>
                        <li>Base de données MongoDB</li>
                        <li>Déployé sur GitHub Codespaces - 100% gratuit</li>
                    </ul>
                </div>
                <p><a href="/health">📊 Vérifier le statut complet</a></p>
                <p><a href="/auth">🔗 Authentification Google</a></p>
                <p><em>Le bot fonctionne en arrière-plan 24/7 sans interruption</em></p>
                <p><small>Codespace: <code>${CODESPACE_NAME}</code></small></p>
            </div>
        </body>
        </html>
    `);
});


// Middleware de base
app.use(express.json());
app.use(express.static('public'));

// ✅ ROUTES STATIQUES EN PREMIER
app.get('/', (req, res) => {
    console.log('📍 Route / appelée');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 RappelBot - Railway</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
                .status { 
                    background: rgba(255,255,255,0.2); 
                    padding: 20px; 
                    border-radius: 10px; 
                    margin: 20px 0; 
                }
                .online { color: #00ff00; font-weight: bold; }
                a { color: #ffd700; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 RappelBot</h1>
                <div class="status">
                    <p class="online">✅ Bot Discord en ligne sur Railway</p>
                    <p><strong>URL :</strong> https://4tuxn0jj.up.railway.app</p>
                    <p><strong>Fonctionnalités :</strong></p>
                    <ul>
                        <li>Rappels intelligents avec IA</li>
                        <li>Intégration Google Calendar</li>
                        <li>Commandes slash Discord</li>
                        <li>Déployé sur Railway 🚀</li>
                    </ul>
                </div>
                <p><a href="/health">📊 Vérifier le statut complet</a></p>
                <p><a href="/auth">🔗 Authentification Google</a></p>
                <p><em>Le bot fonctionne en arrière-plan 24/7</em></p>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        platform: 'Railway', 
        bot: 'RappelBot',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        guilds: client?.guilds?.cache?.size || 0
    });
});

// ✅ ROUTES DE DÉBOGAGE
app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if(middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if(middleware.name === 'router') {
            // Routes du routeur OAuth
            middleware.handle.stack.forEach(handler => {
                if(handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods),
                        source: 'oauthRouter'
                    });
                }
            });
        }
    });
    res.json({ routes, total: routes.length });
});

// ✅ ROUTER OAUTH APRÈS LES ROUTES STATIQUES
app.use('/', oauthRouter);

// ✅ ROUTE 404 DOIT ÊTRE LA DERNIÈRE
app.use('*', (req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Page non trouvée - RappelBot</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #ff4444; }
            </style>
        </head>
        <body>
            <h1>❌ Page non trouvée</h1>
            <p>La page que vous recherchez n'existe pas.</p>
            <p><a href="/">Retour à l'accueil</a></p>
        </body>
        </html>
    `);
});

// Démarrer le serveur web
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Express démarré sur le port ${PORT}`);
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