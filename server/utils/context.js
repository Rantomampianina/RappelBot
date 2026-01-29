/**
 * Utilitaires pour détecter et gérer le contexte Discord
 * Utilisé par les rappels contextuels
 */

/**
 * Extraire les informations d'un trigger de réaction
 */
function parseReactionTrigger(text) {
    // Format: #canal emoji:✅
    const channelMatch = text.match(/<#(\d+)>/);
    const emojiMatch = text.match(/emoji:(\S+)/);

    return {
        channelId: channelMatch ? channelMatch[1] : null,
        emoji: emojiMatch ? emojiMatch[1] : null
    };
}

/**
 * Extraire les informations d'un trigger de mention
 */
function parseMentionTrigger(text) {
    // Format: @user ou <@123456>
    const userMatch = text.match(/<@!?(\d+)>/);

    return {
        userId: userMatch ? userMatch[1] : null
    };
}

/**
 * Extraire les informations d'un trigger de mot-clé
 */
function parseKeywordTrigger(text) {
    // Format: "mot-clé" ou keyword:"urgent"
    const keywordMatch = text.match(/keyword[:\s]+"([^"]+)"|"([^"]+)"/);

    return {
        keyword: keywordMatch ? (keywordMatch[1] || keywordMatch[2]) : text.trim()
    };
}

/**
 * Extraire les informations d'un trigger de thread
 */
function parseThreadTrigger(text) {
    // Format: thread:123456 ou ID direct
    const threadMatch = text.match(/thread[:\s]+(\d+)|^(\d+)$/);

    return {
        threadId: threadMatch ? (threadMatch[1] || threadMatch[2]) : null
    };
}

/**
 * Extraire les informations d'un trigger temporisé
 */
function parseTimerTrigger(text) {
    // Format: "dans 30m", "dans 2h", "dans 1j"
    const timerMatch = text.match(/dans\s+(\d+)\s*(m|min|h|hr|j|d)/i);

    if (!timerMatch) return null;

    const amount = parseInt(timerMatch[1]);
    const unit = timerMatch[2].toLowerCase();

    let milliseconds = 0;

    switch (unit) {
        case 'm':
        case 'min':
            milliseconds = amount * 60 * 1000;
            break;
        case 'h':
        case 'hr':
            milliseconds = amount * 60 * 60 * 1000;
            break;
        case 'j':
        case 'd':
            milliseconds = amount * 24 * 60 * 60 * 1000;
            break;
    }

    return {
        delay: milliseconds,
        triggerAt: new Date(Date.now() + milliseconds)
    };
}

/**
 * Déterminer le type de rappel à partir du texte
 */
function detectReminderType(text) {
    if (text.includes('emoji:') || text.includes('réaction')) {
        return 'reaction';
    }

    if (text.match(/<@!?\d+>/)) {
        return 'mention';
    }

    if (text.includes('keyword:') || text.includes('"')) {
        return 'keyword';
    }

    if (text.includes('thread:') || text.match(/^\d{17,19}$/)) {
        return 'thread';
    }

    if (text.match(/dans\s+\d+\s*(m|min|h|hr|j|d)/i)) {
        return 'timer';
    }

    // Par défaut, simple timer
    return 'timer';
}

/**
 * Parser le texte d'une commande de rappel
 * Retourne le type et les informations du trigger
 */
function parseReminderCommand(commandText) {
    const type = detectReminderType(commandText);

    let trigger = {};
    let message = '';

    // Extraire le message
    const messageMatch = commandText.match(/message[:\s]+"([^"]+)"|msg[:\s]+"([^"]+)"/);
    message = messageMatch ? (messageMatch[1] || messageMatch[2]) : '';

    switch (type) {
        case 'reaction':
            trigger = parseReactionTrigger(commandText);
            break;
        case 'mention':
            trigger = parseMentionTrigger(commandText);
            break;
        case 'keyword':
            trigger = parseKeywordTrigger(commandText);
            break;
        case 'thread':
            trigger = parseThreadTrigger(commandText);
            break;
        case 'timer':
            trigger = parseTimerTrigger(commandText);
            break;
    }

    return {
        type,
        trigger,
        message: message || 'Rappel'
    };
}

/**
 * Vérifier si un message correspond à un trigger de mot-clé
 */
function matchesKeyword(messageContent, keyword) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(messageContent);
}

/**
 * Vérifier si une réaction correspond à un trigger
 */
function matchesReaction(reaction, trigger) {
    if (!trigger.emoji) return false;

    // Supporter emoji Unicode et custom emoji
    const emojiName = reaction.emoji.name;
    const emojiId = reaction.emoji.id;

    return (
        emojiName === trigger.emoji ||
        trigger.emoji.includes(emojiName) ||
        (emojiId && trigger.emoji.includes(emojiId))
    );
}

/**
 * Vérifier si un message contient une mention
 */
function hasMention(message, userId) {
    return message.mentions.users.has(userId);
}

/**
 * Formater la durée en texte lisible
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return `${seconds}s`;
}

/**
 * Générer une description lisible du trigger
 */
function getTriggerDescription(type, trigger) {
    switch (type) {
        case 'reaction':
            return `Réaction ${trigger.emoji} ${trigger.channelId ? `dans <#${trigger.channelId}>` : ''}`;
        case 'mention':
            return `Mention de <@${trigger.userId}>`;
        case 'keyword':
            return `Mot-clé: "${trigger.keyword}"`;
        case 'thread':
            return `Thread <#${trigger.threadId}>`;
        case 'timer':
            return `Dans ${formatDuration(trigger.delay)}`;
        default:
            return 'Inconnu';
    }
}

module.exports = {
    parseReactionTrigger,
    parseMentionTrigger,
    parseKeywordTrigger,
    parseThreadTrigger,
    parseTimerTrigger,
    detectReminderType,
    parseReminderCommand,
    matchesKeyword,
    matchesReaction,
    hasMention,
    formatDuration,
    getTriggerDescription
};
