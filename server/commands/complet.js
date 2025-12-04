const { SlashCommandBuilder } = require('discord.js');
const Rappel = require('../models/Rappel');
const Historique = require('../models/Historique');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('complet')
        .setDescription('Marque comme fait')
        .addIntegerOption(o => o.setName('index').setDescription('Numéro').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const idx = interaction.options.getInteger('index') - 1;
        const rappels = await Rappel.find({ user: interaction.user.id });
        if (idx < 0 || idx >= rappels.length) return interaction.editReply("Index invalide.");

        const r = rappels[idx];
        r.completed = true;
        await r.save();

        await new Historique({
            user: interaction.user.id,
            action: 'complété',
            rappel: r.toObject()
        }).save();

        await interaction.editReply("Marqué comme fait !");
    }
};