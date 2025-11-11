const { SlashCommandBuilder } = require('discord.js');
const Historique = require('../models/Historique');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanhistorique')
        .setDescription('Efface tout l\'historique'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const result = await Historique.deleteMany({ user: interaction.user.id });
        await interaction.editReply({ content: `Historique effacé ! (${result.deletedCount} entrées)`, ephemeral: true });
    }
};