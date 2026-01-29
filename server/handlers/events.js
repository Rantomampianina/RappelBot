/**
 * Gestionnaire d'événements Discord pour les rappels contextuels
 * Écoute: réactions, mentions, messages, threads
 */

const { EmbedBuilder } = require('discord.js');
const {
    getAllReminders,
    incrementTriggerCount,
    ReminderTypes
} = require('../store/reminders');
const { matchesReaction, hasMention, matchesKeyword } = require('../utils/context');

/**
 * Configure tous les event listeners pour les rappels contextuels
 */
function setupEventListeners(client) {
    console.log('📡 Configuration des listeners d\'événements...');

    // Listener pour les réactions
    client.on('messageReactionAdd', async (reaction, user) => {
        try {
            // Ignorer les réactions du bot
            if (user.bot) return;

            const reminders = getAllReminders().filter(r => r.type === ReminderTypes.REACTION);

            for (const reminder of reminders) {
                // Vérifier le canal si spécifié
                if (reminder.trigger.channelId && reminder.trigger.channelId !== reaction.message.channelId) {
                    continue;
                }

                // Vérifier l'emoji
                if (matchesReaction(reaction, reminder.trigger)) {
                    await sendReminder(client, reminder, {
                        context: `Réaction ${reaction.emoji.name} par <@${user.id}>`
                    });
                    incrementTriggerCount(reminder.id);
                }
            }
        } catch (error) {
            console.error('❌ Erreur reaction listener:', error);
        }
    });

    // Listener pour les messages (mentions, mots-clés, threads)
    client.on('messageCreate', async (message) => {
        try {
            // Ignorer les messages du bot
            if (message.author.bot) return;

            const reminders = getAllReminders();

            for (const reminder of reminders) {
                let shouldTrigger = false;
                let context = '';

                switch (reminder.type) {
                    case ReminderTypes.MENTION:
                        if (hasMention(message, reminder.trigger.userId)) {
                            shouldTrigger = true;
                            context = `Mention de <@${reminder.trigger.userId}> par <@${message.author.id}>`;
                        }
                        break;

                    case ReminderTypes.KEYWORD:
                        if (matchesKeyword(message.content, reminder.trigger.keyword)) {
                            shouldTrigger = true;
                            context = `Mot-clé "${reminder.trigger.keyword}" détecté`;
                        }
                        break;

                    case ReminderTypes.THREAD:
                        if (message.channel.isThread() && message.channel.id === reminder.trigger.threadId) {
                            shouldTrigger = true;
                            context = `Nouveau message dans le thread`;
                        }
                        break;
                }

                if (shouldTrigger) {
                    await sendReminder(client, reminder, { context, messageUrl: message.url });
                    incrementTriggerCount(reminder.id);
                }
            }
        } catch (error) {
            console.error('❌ Erreur message listener:', error);
        }
    });

    console.log('✅ Event listeners configurés: reactions, messages, mentions, keywords, threads');
}

/**
 * Envoyer un rappel à l'utilisateur
 */
async function sendReminder(client, reminder, options = {}) {
    try {
        const user = await client.users.fetch(reminder.userId);

        const embed = new EmbedBuilder()
            .setTitle('🔔 Rappel déclenché')
            .setDescription(`**${reminder.message}**`)
            .setColor(0xFF6B35)
            .setTimestamp();

        if (options.context) {
            embed.addFields({ name: 'Déclencheur', value: options.context });
        }

        if (options.messageUrl) {
            embed.addFields({ name: 'Message', value: `[Voir le message](${options.messageUrl})` });
        }

        if (reminder.channelId) {
            embed.addFields({ name: 'Canal', value: `<#${reminder.channelId}>` });
        }

        embed.setFooter({ text: `Rappel #${reminder.id} | Déclenché ${reminder.triggeredCount + 1}x` });

        await user.send({ embeds: [embed] });
        console.log(`✅ Rappel envoyé à ${user.tag}: "${reminder.message}"`);

    } catch (error) {
        console.error(`❌ Erreur envoi rappel ${reminder.id}:`, error.message);
    }
}

module.exports = {
    setupEventListeners,
    sendReminder
};
