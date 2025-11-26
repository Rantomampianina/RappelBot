const { SlashCommandBuilder } = require('discord.js');
const Historique = require('../models/Historique');

module.exports = {
    data: new SlashCommandBuilder().setName('historique').setDescription('Historique'),
    async execute(interaction) {
        await interaction.deferReply();
        const hist = await Historique.find({ user: interaction.user.id }).sort({ timestamp: -1 }).limit(10);
        if (!hist.length) return interaction.editReply("Aucun historique.");
        let msg = "**Historique :**\n";
        hist.forEach(h => msg += `• ${h.action} **${h.rappel.text}**\n`);
        await interaction.editReply(msg);
    }
};