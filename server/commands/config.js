const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../store/reminders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configuration du bot et statistiques'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const stats = getStats();
            const client = interaction.client;

            const embed = new EmbedBuilder()
                .setTitle('⚙️ Configuration RappelBot')
                .setColor(0x5865F2)
                .addFields(
                    { name: '📊 Rappels actifs', value: `${stats.active}`, inline: true },
                    { name: '👥 Utilisateurs', value: `${stats.users}`, inline: true },
                    { name: '🏠 Serveurs', value: `${stats.guilds}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '⏰ Timer', value: `${stats.byType.timer || 0}`, inline: true },
                    { name: '👤 Mentions', value: `${stats.byType.mention || 0}`, inline: true },
                    { name: '🔑 Mots-clés', value: `${stats.byType.keyword || 0}`, inline: true },
                    { name: '😊 Réactions', value: `${stats.byType.reaction || 0}`, inline: true },
                    { name: '💬 Threads', value: `${stats.byType.thread || 0}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '🤖 Bot', value: `v2.0.0`, inline: true },
                    { name: '📈 Uptime', value: `${Math.floor(client.uptime / 1000 / 60)} min`, inline: true },
                    { name: '💾 Stockage', value: 'RAM (en mémoire)', inline: true }
                )
                .setFooter({ text: 'RappelBot - Rappels contextuels' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erreur config:', error);
            await interaction.editReply('❌ Erreur lors de la récupération de la configuration');
        }
    }
};