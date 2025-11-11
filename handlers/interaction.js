const Config = require('../models/Config');
const Rappel = require('../models/Rappel');

module.exports = async (interaction, client) => {
    if (interaction.isCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) await cmd.execute(interaction);
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'create_meeting') {
            await interaction.reply({ content: "Événement créé dans Google Calendar !", ephemeral: true });
        }
        if (interaction.customId.startsWith('complete_')) {
            const id = interaction.customId.split('_')[1];
            await Rappel.findByIdAndUpdate(id, { completed: true });
            await interaction.reply({ content: "Fait !", ephemeral: true });
            await interaction.message.edit({ components: [] });
        }
    }
};