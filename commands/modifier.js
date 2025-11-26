const { SlashCommandBuilder } = require('discord.js');
const Rappel = require('../models/Rappel');
const Historique = require('../models/Historique');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modifier')
        .setDescription('Modifie un rappel')
        .addIntegerOption(o => o.setName('index').setDescription('Numéro').setRequired(true))
        .addStringOption(o => o.setName('texte').setDescription('Nouveau texte').setRequired(false))
        .addStringOption(o => o.setName('date').setDescription('JJ/MM/AAAA').setRequired(false))
        .addStringOption(o => o.setName('heure').setDescription('HH:MM').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        const idx = interaction.options.getInteger('index') - 1;
        const rappels = await Rappel.find({ user: interaction.user.id });
        if (idx < 0 || idx >= rappels.length) return interaction.editReply("Index invalide.");

        const r = rappels[idx];
        const oldText = r.text;
        r.text = interaction.options.getString('texte') || r.text;
        r.date = interaction.options.getString('date') || r.date;
        r.time = interaction.options.getString('heure') || r.time;
        await r.save();

        await new Historique({
            user: interaction.user.id,
            action: 'modifié',
            oldText,
            newText: r.text,
            rappel: r.toObject()
        }).save();

        await interaction.editReply(`Modifié : **${oldText} → ${r.text}**`);
    }
};