const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserReminders } = require('../store/reminders');
const { getTriggerDescription } = require('../utils/context');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('liste')
        .setDescription('Afficher vos rappels actifs'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.user.id;
            const reminders = getUserReminders(userId);

            if (reminders.length === 0) {
                return interaction.editReply('📭 Vous n\'avez aucun rappel actif.');
            }

            const embed = new EmbedBuilder()
                .setTitle('📋 Vos rappels actifs')
                .setColor(0x00AE86)
                .setTimestamp();

            let description = '';
            reminders.forEach((reminder, index) => {
                const triggerDesc = getTriggerDescription(reminder.type, reminder.trigger);
                description += `**${index + 1}.** ${reminder.message}\n`;
                description += `   └ ${triggerDesc}\n`;
                description += `   └ ID: \`${reminder.id}\`\n\n`;
            });

            embed.setDescription(description);
            embed.setFooter({ text: `Total: ${reminders.length} rappel(s)` });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erreur liste rappels:', error);
            await interaction.editReply('❌ Erreur lors de la récupération des rappels');
        }
    }
};