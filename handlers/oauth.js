const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GoogleCalendarService = require('../utils/google');
const Config = require('../models/Config');

async function handleOAuthCode(interaction, code, guildId) {
    await interaction.deferReply({ ephemeral: true });

    try {
        console.log('🔄 Traitement du code OAuth...');
        
        // Échanger le code contre des tokens
        const tokens = await GoogleCalendarService.getTokensFromCode(code);
        
        // Sauvegarder les tokens pour le serveur
        await GoogleCalendarService.saveTokens(guildId, tokens);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Google Calendar Connecté !')
            .setDescription('Votre compte Google Calendar a été lié avec succès.')
            .addFields(
                { name: 'Fonctionnalités activées', value: '• Création automatique d\'événements\n• Synchronisation des rappels\n• Notifications Google', inline: false }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Erreur OAuth:', error);
        await interaction.editReply('❌ Erreur lors de la connexion Google Calendar. Vérifiez que le code est valide.');
    }
}

// Commande pour entrer manuellement le code
async function handleManualAuth(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('🔗 Connexion Google Calendar')
        .setDescription(`**Étapes à suivre :**

1. **Cliquez sur ce lien** pour autoriser l'accès :
   [🔗 Autoriser Google Calendar](https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent)

2. **Copiez le code** depuis l'URL après autorisation
   (il commence par "4/0A...")

3. **Utilisez la commande** :
   \`/auth code:VOTRE_CODE\``)
        .setColor(0x4285F4)
        .setFooter({ text: 'Le code expire après 10 minutes' });

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    handleOAuthCode,
    handleManualAuth
};