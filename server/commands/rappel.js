const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createReminder, ReminderTypes } = require('../store/reminders');
const { parseReminderCommand, getTriggerDescription } = require('../utils/context');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rappel')
        .setDescription('Créer un rappel contextuel')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de rappel')
                .setRequired(true)
                .addChoices(
                    { name: '⏰ Temporisé (dans X minutes/heures)', value: 'timer' },
                    { name: '👤 Mention utilisateur', value: 'mention' },
                    { name: '🔑 Mot-clé', value: 'keyword' },
                    { name: '😊 Réaction emoji', value: 'reaction' },
                    { name: '💬 Thread', value: 'thread' }
                ))
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('Déclencheur (ex: "dans 30m", "@user", "urgent", "emoji:✅ #canal")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message du rappel')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const type = interaction.options.getString('type');
            const triggerText = interaction.options.getString('trigger');
            const message = interaction.options.getString('message');
            const userId = interaction.user.id;
            const guildId = interaction.guildId;
            const channelId = interaction.channelId;

            // Parser le trigger selon le type
            let trigger = {};
            let valid = true;
            let errorMessage = '';

            switch (type) {
                case 'timer': {
                    const { parseTimerTrigger } = require('../utils/context');
                    trigger = parseTimerTrigger(triggerText);
                    if (!trigger || !trigger.delay) {
                        valid = false;
                        errorMessage = '❌ Format invalide. Utilisez: "dans 30m", "dans 2h", "dans 1j"';
                    }
                    break;
                }
                case 'mention': {
                    const { parseMentionTrigger } = require('../utils/context');
                    trigger = parseMentionTrigger(triggerText);
                    if (!trigger || !trigger.userId) {
                        valid = false;
                        errorMessage = '❌ Format invalide. Mentionnez un utilisateur: @user';
                    }
                    break;
                }
                case 'keyword': {
                    const { parseKeywordTrigger } = require('../utils/context');
                    trigger = parseKeywordTrigger(triggerText);
                    if (!trigger || !trigger.keyword) {
                        valid = false;
                        errorMessage = '❌ Format invalide. Utilisez: "mot-clé" ou keyword:"urgent"';
                    }
                    break;
                }
                case 'reaction': {
                    const { parseReactionTrigger } = require('../utils/context');
                    trigger = parseReactionTrigger(triggerText);
                    if (!trigger || !trigger.emoji) {
                        valid = false;
                        errorMessage = '❌ Format invalide. Utilisez: emoji:✅ #canal';
                    }
                    break;
                }
                case 'thread': {
                    const { parseThreadTrigger } = require('../utils/context');
                    trigger = parseThreadTrigger(triggerText);
                    if (!trigger || !trigger.threadId) {
                        valid = false;
                        errorMessage = '❌ Format invalide. Utilisez l\'ID du thread';
                    }
                    break;
                }
            }

            if (!valid) {
                return interaction.editReply(errorMessage);
            }

            // Créer le rappel
            const reminder = createReminder({
                userId,
                guildId,
                type,
                trigger,
                message,
                channelId
            });

            // Pour les timers, planifier immédiatement
            if (type === 'timer' && trigger.delay) {
                setTimeout(async () => {
                    try {
                        const user = await interaction.client.users.fetch(userId);
                        const embed = new EmbedBuilder()
                            .setTitle('🔔 Rappel')
                            .setDescription(message)
                            .setColor(0x00AE86)
                            .setTimestamp();

                        await user.send({ embeds: [embed] });

                        const { deleteReminder } = require('../store/reminders');
                        deleteReminder(reminder.id);
                    } catch (error) {
                        console.error('❌ Erreur envoi rappel timer:', error);
                    }
                }, trigger.delay);
            }

            // Réponse de confirmation
            const description = getTriggerDescription(type, trigger);
            const embed = new EmbedBuilder()
                .setTitle('✅ Rappel créé')
                .setDescription(`**Message:** ${message}\n**Déclencheur:** ${description}`)
                .setColor(0x00AE86)
                .setFooter({ text: `ID: ${reminder.id}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erreur création rappel:', error);
            await interaction.editReply('❌ Erreur lors de la création du rappel');
        }
    }
};