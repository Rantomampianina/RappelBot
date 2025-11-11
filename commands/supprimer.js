const { SlashCommandBuilder } = require('discord.js');
const Rappel = require('../models/Rappel');
const Historique = require('../models/Historique');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supprimer')
        .setDescription('Supprime un rappel')
        .addIntegerOption(o => o.setName('index').setDescription('Numéro du rappel').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const idx = interaction.options.getInteger('index') - 1;
        const rappels = await Rappel.find({ user: interaction.user.id }).sort({ date: 1, time: 1 });
        if (idx < 0 || idx >= rappels.length) return interaction.editReply("Index invalide.");

        const r = rappels[idx];
        await Rappel.deleteOne({ _id: r._id });

        await new Historique({
            user: interaction.user.id,
            action: 'supprimé',
            rappel: r.toObject()
        }).save();

        await interaction.editReply(`Supprimé : **${r.text}**`);
    }
};