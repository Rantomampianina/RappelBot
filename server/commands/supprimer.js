const { SlashCommandBuilder } = require('discord.js');
const { deleteReminder, getReminder, getUserReminders } = require('../store/reminders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supprimer')
        .setDescription('Supprimer un rappel')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID du rappel à supprimer')
                .setRequired(true)
                .setAutocomplete(true)),

    async autocomplete(interaction) {
        try {
            const focusedValue = interaction.options.getFocused();
            const userId = interaction.user.id;

            // Récupérer les rappels de l'utilisateur
            const userReminders = getUserReminders(userId);

            if (!userReminders || userReminders.length === 0) {
                return interaction.respond([]);
            }

            // Filtrer les rappels qui correspondent à la recherche
            const filtered = userReminders.filter(reminder => {
                const searchLower = focusedValue.toLowerCase();
                return reminder.message.toLowerCase().includes(searchLower) ||
                    reminder.id.toLowerCase().includes(searchLower);
            });

            // Limiter à 25 résultats (limite Discord)
            // Format: "Message... (ID court)"
            const choices = filtered.slice(0, 25).map(reminder => {
                let label = reminder.message;
                if (label.length > 50) label = label.substring(0, 47) + '...';

                // Ajouter le type ou l'ID court pour info
                label = `${label} (${reminder.type})`;

                return {
                    name: label,
                    value: reminder.id
                };
            });

            await interaction.respond(choices);
        } catch (error) {
            console.error('❌ Erreur autocomplete supprimer:', error);
            // Ne pas répondre en cas d'erreur dans l'autocomplete
        }
    },

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