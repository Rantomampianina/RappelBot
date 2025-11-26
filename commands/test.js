const { SlashCommandBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tester la configuration Google'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const config = await Config.findOne({ guildId: interaction.guildId });
        
        if (!config) {
            return interaction.editReply('❌ Aucune configuration trouvée');
        }
        
        let response = `**Configuration Google:**\n`;
        response += `• Activé: ${config.useGoogleCalendar ? '✅' : '❌'}\n`;
        
        if (config.googleCredentials) {
            response += `• Access Token: ${config.googleCredentials.accessToken ? '✅' : '❌'}\n`;
            response += `• Refresh Token: ${config.googleCredentials.refreshToken ? '✅' : '❌'}\n`;
            response += `• Expire: ${new Date(config.googleCredentials.expiryDate).toLocaleString()}\n`;
        } else {
            response += `• Tokens: ❌ Non configurés\n`;
        }
        
        await interaction.editReply(response);
    }
};