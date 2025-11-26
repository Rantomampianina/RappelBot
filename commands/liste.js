const { SlashCommandBuilder } = require('discord.js');
const Rappel = require('../models/Rappel');

module.exports = {
    data: new SlashCommandBuilder().setName('liste').setDescription('Tes rappels'),
    async execute(interaction) {
        await interaction.deferReply();
        const rappels = await Rappel.find({ user: interaction.user.id });
        if (!rappels.length) return interaction.editReply("Aucun rappel.");
        let msg = "**Tes rappels :**\n";
        rappels.forEach((r, i) => msg += `${i+1}. **${r.text}** le **${r.date}** à **${r.time}**\n`);
        await interaction.editReply(msg);
    }
};