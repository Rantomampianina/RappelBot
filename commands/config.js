const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Config = require('../models/Config');
const GoogleCalendarService = require('../utils/google');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configurer le bot RappelBot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('google')
                .setDescription('Configurer Google Calendar')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Définir le canal des rappels')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal pour les rappels')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        try {
            if (subcommand === 'google') {
                await this.handleGoogleConfig(interaction, guildId);
            } else if (subcommand === 'channel') {
                await this.handleChannelConfig(interaction, guildId);
            }
        } catch (error) {
            console.error('Erreur configuration:', error);
            await interaction.editReply('❌ Erreur lors de la configuration');
        }
    },

    async handleGoogleConfig(interaction, guildId) {
        const config = await Config.findOne({ guildId }) || new Config({ guildId });

        if (config.googleCredentials?.accessToken) {
            // Déjà configuré - proposer ON/OFF
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('google_toggle')
                        .setLabel(config.useGoogleCalendar ? 'Désactiver Google' : 'Activer Google')
                        .setStyle(config.useGoogleCalendar ? ButtonStyle.Danger : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('google_disconnect')
                        .setLabel('Déconnecter Google')
                        .setStyle(ButtonStyle.Secondary)
                );

            const embed = new EmbedBuilder()
                .setTitle('🔧 Configuration Google Calendar')
                .setDescription(`Statut: **${config.useGoogleCalendar ? '✅ Activé' : '❌ Désactivé'}**`)
                .setColor(config.useGoogleCalendar ? 0x00FF00 : 0xFF0000)
                .addFields(
                    { name: 'Fonctionnalités', value: '• Création automatique d\'événements\n• Synchronisation des rappels\n• Notifications Google', inline: false }
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } else {
            // Pas encore configuré - proposer la connexion
            const authUrl = GoogleCalendarService.generateAuthUrl(guildId);
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Connecter Google Calendar')
                        .setStyle(ButtonStyle.Link)
                        .setURL(authUrl),
                    new ButtonBuilder()
                        .setCustomId('google_verify')
                        .setLabel('J\'ai autorisé')
                        .setStyle(ButtonStyle.Primary)
                );

            const embed = new EmbedBuilder()
                .setTitle('🔗 Connexion Google Calendar')
                .setDescription('Pour utiliser Google Calendar, vous devez autoriser l\'accès à votre calendrier.')
                .setColor(0x4285F4)
                .addFields(
                    { name: 'Étapes', value: '1. Cliquez sur "Connecter Google Calendar"\n2. Autorisez l\'accès\n3. Revenez ici et cliquez sur "J\'ai autorisé"', inline: false }
                );

            await interaction.editReply({ embeds: [embed], components: [row] });
        }
    },

    async handleChannelConfig(interaction, guildId) {
        const channel = interaction.options.getChannel('canal');
        
        if (!channel.isTextBased()) {
            return interaction.editReply('❌ Veuillez sélectionner un canal texte');
        }

        await Config.findOneAndUpdate(
            { guildId },
            { alarmChannelId: channel.id },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setTitle('✅ Canal configuré')
            .setDescription(`Les rappels seront envoyés dans ${channel}`)
            .setColor(0x00FF00);

        await interaction.editReply({ embeds: [embed] });
    }
};