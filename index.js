require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const express = require('express');
const oauthRouter = require('./handlers/oauth');

// ✅ SERVEUR EXPRESS POUR REPLIT
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(express.json());
app.use(express.static('public'));
app.use('/', oauthRouter);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ✅ ROUTES WEB POUR REPLIT
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 RappelBot - Replit</title>
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
                    <p class="online">✅ Bot Discord en ligne sur Koyeb</p>
                    <p><strong>Fonctionnalités :</strong></p>
                    <ul>
                        <li>Rappels intelligents avec IA</li>
                        <li>Intégration Google Calendar</li>
                        <li>Commandes slash Discord</li>
                        <li>Déployé sur Koyeb 🚀</li>
                    </ul>
                </div>
                <p><a href="/health">📊 Vérifier le statut complet</a></p>
                <p><em>Le bot fonctionne en arrière-plan 24/7</em></p>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        platform: 'Replit',
        bot: client?.user?.tag || 'starting...',
        guilds: client?.guilds?.cache?.size || 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        node_version: process.version
    });
});

// ✅ KEEP-ALIVE POUR REPLIT (important!)
setInterval(() => {
    if (client && client.uptime) {
        console.log('🔄 Keep-alive - Bot actif depuis', Math.floor(client.uptime / 60000), 'minutes');
    }
}, 5 * 60 * 1000); // Toutes les 5 minutes

// Démarrer le serveur web
app.listen(PORT, () => {
    console.log(`🌐 Serveur Replit démarré sur le port ${PORT}`);
});


// Fonction pour enregistrer les commandes automatiquement
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


// Fonction pour initialiser les alarmes après la connexion DB
async function initializeAlarms() {
    try {
        console.log('🔔 Initialisation des alarmes...');
        
        const Rappel = require('./models/Rappel');
        const { setupAlarmChecker, planifierRappel } = require('./handlers/alarm');
        
        // Attendre que la connexion DB soit vraiment établie
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

// Événement ready modifié
client.once('ready', async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    console.log(`📊 ${client.guilds.cache.size} serveurs`);

    try {
        // Initialiser les alarmes
        await initializeAlarms();
        
        // Statut
        client.user.setActivity('/rappel | Rappels intelligents', { type: 'WATCHING' });
        
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
});

// Gestion des interactions COMPLÈTE
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isButton()) {
            const [action, rappelId] = interaction.customId.split('_');
            
            // Boutons existants pour les rappels
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

            // NOUVEAU : Boutons Google Calendar
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
                const config = await Config.findOne({ guildId: interaction.guildId });
                if (config) {
                    config.useGoogleCalendar = !config.useGoogleCalendar;
                    await config.save();
                    await interaction.reply({ 
                        content: `✅ Google Calendar **${config.useGoogleCalendar ? 'activé' : 'désactivé'}**`, 
                        ephemeral: true 
                    });
                }
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
        }

        // Commandes slash
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
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

// Gestion des erreurs
client.on('error', (error) => {
    console.error('❌ Erreur Client Discord:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// Gestion arrêt
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du bot...');
    client.destroy();
    await mongoose.connection.close();
    process.exit(0);
});

// Connexion DB avec meilleure gestion
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

// DÉMARRAGE AUTOMATIQUE AMÉLIORÉ
async function startBot() {
    try {
        console.log('🚀 Démarrage du bot...');
        
        // 1. Enregistrer les commandes d'abord
        const commandsRegistered = await registerCommands();
        if (!commandsRegistered) {
            console.log('❌ Échec enregistrement commandes, arrêt...');
            process.exit(1);
        }
        
        // 2. Connecter la base de données
        const dbConnected = await connectDatabase();
        if (!dbConnected) {
            console.log('❌ Échec connexion DB, arrêt...');
            process.exit(1);
        }
        
        // 3. Connecter le bot Discord
        await client.login(process.env.TOKEN);
        
    } catch (error) {
        console.error('❌ Erreur démarrage bot:', error);
        process.exit(1);
    }
}

// Démarrer le bot
startBot();