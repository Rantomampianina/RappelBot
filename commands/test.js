const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Tester la configuration du bot'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // ✅ FORCER le rechargement depuis la base de données
            const config = await Config.findOne({ guildId: interaction.guildId });
            
            if (!config) {
                return await interaction.editReply('❌ Aucune configuration trouvée pour ce serveur.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🧪 Test de Configuration')
                .setColor(0x00AE86)
                .addFields(
                    { name: 'Google Calendar', value: config.useGoogleCalendar ? '✅ Activé' : '❌ Désactivé', inline: true },
                    { name: 'Serveur ID', value: interaction.guildId, inline: true }
                );

            // ✅ Afficher les infos Google SEULEMENT si activé
            if (config.useGoogleCalendar && config.googleCredentials) {
                const expiryDate = new Date(config.googleCredentials.expiryDate);
                embed.addFields(
                    { name: 'Access Token', value: config.googleCredentials.accessToken ? '✅' : '❌', inline: true },
                    { name: 'Refresh Token', value: config.googleCredentials.refreshToken ? '✅' : '❌', inline: true },
                    { name: 'Expire', value: expiryDate.toLocaleString(), inline: true }
                );
            } else {
                embed.addFields(
                    { name: 'Statut Google', value: '❌ Non configuré', inline: false }
                );
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur commande test:', error);
            await interaction.editReply('❌ Erreur lors du test de configuration.');
        }
    }
};