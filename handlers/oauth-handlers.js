const { EmbedBuilder } = require('discord.js');
const GoogleCalendarService = require('../utils/google');

async function handleOAuthCode(interaction, code, guildId) {
    await interaction.deferReply({ ephemeral: true });

    try {
        console.log('🔄 Traitement du code OAuth...');
        
        const tokens = await GoogleCalendarService.getTokensFromCode(code);
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

async function handleManualAuth(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const authUrl = GoogleCalendarService.generateAuthUrl(interaction.guildId);

    const embed = new EmbedBuilder()
        .setTitle('🔗 Connexion Google Calendar')
        .setDescription(`**Étapes à suivre :**

1. **Cliquez sur ce lien** pour autoriser l'accès :
   [🔗 Autoriser Google Calendar](${authUrl})

2. **Vous serez redirigé vers notre application**
3. **Copiez le code** depuis l'URL (paramètre \`code=...\`)
4. **Utilisez la commande** :
   \`/auth code:VOTRE_CODE\``)
        .setColor(0x4285F4)
        .setFooter({ text: 'Le code expire après 10 minutes' });

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    handleOAuthCode,
    handleManualAuth
};