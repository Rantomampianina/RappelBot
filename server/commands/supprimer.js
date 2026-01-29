const { SlashCommandBuilder } = require('discord.js');
const { deleteReminder, getReminder } = require('../store/reminders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supprimer')
        .setDescription('Supprimer un rappel')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID du rappel à supprimer')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const reminderId = interaction.options.getString('id');
            const userId = interaction.user.id;

            // Vérifier que le rappel existe et appartient à l'utilisateur
            const reminder = getReminder(reminderId);

            if (!reminder) {
                return interaction.editReply('❌ Rappel introuvable.');
            }

            if (reminder.userId !== userId) {
                return interaction.editReply('❌ Vous ne pouvez supprimer que vos propres rappels.');
            }

            // Supprimer le rappel
            const success = deleteReminder(reminderId);

            if (success) {
                await interaction.editReply(`✅ Rappel supprimé:\n"${reminder.message}"`);
            } else {
                await interaction.editReply('❌ Erreur lors de la suppression du rappel.');
            }

        } catch (error) {
            console.error('❌ Erreur suppression rappel:', error);
            await interaction.editReply('❌ Erreur lors de la suppression du rappel');
        }
    }
};