const TimezoneDetector = require('../services/TimezoneDetector');
const UserPrefs = require('../models/UserPrefs');

async function captureTimezoneFromInteraction(interaction) {
    try {
        const userId = interaction.user.id;
        
        // Contexte de détection
        const context = {
            discordLocale: interaction.locale,
            userAgent: interaction.client?.options?.http?.headers?.['User-Agent'],
            timestamp: interaction.createdTimestamp,
            command: interaction.commandName,
            
            // IP simulation (Discord ne donne pas l'IP réel)
            // On peut utiliser une approximation via guild région
            ipAddress: await getApproximateIP(interaction)
        };
        
        // Détecter le fuseau
        const detection = await TimezoneDetector.detectTimezone(userId, context);
        
        // Si confiance faible, proposer une correction discrète
        if (detection.confidence < 0.7 && interaction.isCommand()) {
            await suggestTimezoneCorrection(interaction, detection);
        }
        
        return detection.timezone;
        
    } catch (error) {
        console.error('Erreur capture fuseau:', error);
        return 'UTC';
    }
}

async function getApproximateIP(interaction) {
    try {
        // Discord ne donne pas l'IP, mais on peut estimer via:
        // 1. Région du serveur Discord
        if (interaction.guild) {
            const guild = await interaction.guild.fetch();
            const region = guild.preferredLocale;
            // Convertir région en IP approximative
            return regionToIP(region);
        }
        
        // 2. Via l'heure de connexion Discord
        return null;
        
    } catch (error) {
        return null;
    }
}

async function suggestTimezoneCorrection(interaction, detection) {
    // Envoyer un message discret (éphémère)
    const correctionMessage = await interaction.followUp({
        content: `🌍 *Je pense que vous êtes en ${detection.timezone} (confiance: ${Math.round(detection.confidence * 100)}%).\nSi ce n'est pas correct, utilisez \`/timezone\` pour le corriger.*`,
        flags: 64, // Éphémère
        ephemeral: true
    });
    
    // Supprimer après 30 secondes
    setTimeout(() => {
        correctionMessage.delete().catch(() => {});
    }, 30000);
}

module.exports = { captureTimezoneFromInteraction };