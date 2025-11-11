const { SlashCommandBuilder } = require('discord.js');
const { handleOAuthCode, handleManualAuth } = require('../handlers/oauth');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('Authentification Google Calendar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Démarrer le processus d\'authentification')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('code')
                .setDescription('Entrer le code d\'autorisation')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Le code reçu de Google')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'start') {
            await handleManualAuth(interaction);
        } else if (subcommand === 'code') {
            const code = interaction.options.getString('code');
            await handleOAuthCode(interaction, code, guildId);
        }
    }
};