/**
 * Système de stockage en mémoire pour les rappels contextuels
 * Pas de base de données - Tout en RAM
 */

const { v4: uuidv4 } = require('crypto');

// Stockage principal des rappels
const reminders = new Map();

// Index pour accès rapide par utilisateur
const userReminders = new Map();

// Index pour accès rapide par serveur
const guildReminders = new Map();

/**
 * Types de rappels contextuels supportés
 */
const ReminderTypes = {
    REACTION: 'reaction',      // Déclenché par une réaction
    MENTION: 'mention',        // Déclenché par une mention
    KEYWORD: 'keyword',        // Déclenché par un mot-clé
    THREAD: 'thread',          // Déclenché dans un thread
    TIMER: 'timer'             // Temporisé (simple délai)
};

/**
 * Créer un nouveau rappel
 */
function createReminder({ userId, guildId, type, trigger, message, channelId }) {
    const id = generateId();

    const reminder = {
        id,
        userId,
        guildId,
        channelId,
        type,
        trigger,
        message,
        createdAt: new Date(),
        active: true,
        triggeredCount: 0
    };

    // Stocker le rappel
    reminders.set(id, reminder);

    // Indexer par utilisateur
    if (!userReminders.has(userId)) {
        userReminders.set(userId, new Set());
    }
    userReminders.get(userId).add(id);

    // Indexer par serveur
    if (guildId) {
        if (!guildReminders.has(guildId)) {
            guildReminders.set(guildId, new Set());
        }
        guildReminders.get(guildId).add(id);
    }

    console.log(`✅ Rappel créé: ${id} (type: ${type}) pour ${userId}`);
    return reminder;
}

/**
 * Récupérer un rappel par ID
 */
function getReminder(id) {
    return reminders.get(id);
}

/**
 * Récupérer tous les rappels d'un utilisateur
 */
function getUserReminders(userId) {
    const userReminderIds = userReminders.get(userId);
    if (!userReminderIds) return [];

    return Array.from(userReminderIds)
        .map(id => reminders.get(id))
        .filter(r => r && r.active);
}

/**
 * Récupérer tous les rappels d'un serveur
 */
function getGuildReminders(guildId) {
    const guildReminderIds = guildReminders.get(guildId);
    if (!guildReminderIds) return [];

    return Array.from(guildReminderIds)
        .map(id => reminders.get(id))
        .filter(r => r && r.active);
}

/**
 * Récupérer tous les rappels actifs
 */
function getAllReminders() {
    return Array.from(reminders.values()).filter(r => r.active);
}

/**
 * Supprimer un rappel
 */
function deleteReminder(id) {
    const reminder = reminders.get(id);
    if (!reminder) return false;

    // Retirer des index
    const userReminderIds = userReminders.get(reminder.userId);
    if (userReminderIds) {
        userReminderIds.delete(id);
    }

    if (reminder.guildId) {
        const guildReminderIds = guildReminders.get(reminder.guildId);
        if (guildReminderIds) {
            guildReminderIds.delete(id);
        }
    }

    // Supprimer le timeout si existant
    if (reminder.timeout) {
        clearTimeout(reminder.timeout);
        console.log(`⏱️ Timeout annulé pour le rappel: ${id}`);
    }

    // Supprimer le rappel
    reminders.delete(id);
    console.log(`🗑️ Rappel supprimé: ${id}`);
    return true;
}

/**
 * Associer un timeout à un rappel
 */
function setReminderTimeout(id, timeout) {
    const reminder = reminders.get(id);
    if (reminder) {
        reminder.timeout = timeout;
        return true;
    }
    return false;
}

/**
 * Désactiver un rappel (soft delete)
 */
function deactivateReminder(id) {
    const reminder = reminders.get(id);
    if (reminder) {
        reminder.active = false;
        console.log(`⏸️ Rappel désactivé: ${id}`);
        return true;
    }
    return false;
}

/**
 * Incrémenter le compteur de déclenchements
 */
function incrementTriggerCount(id) {
    const reminder = reminders.get(id);
    if (reminder) {
        reminder.triggeredCount++;
        return reminder.triggeredCount;
    }
    return 0;
}

/**
 * Nettoyer les anciens rappels (appelé périodiquement)
 */
function cleanOldReminders(maxAgeHours = 720) { // 30 jours par défaut
    const now = new Date();
    let cleaned = 0;

    for (const [id, reminder] of reminders.entries()) {
        const ageHours = (now - reminder.createdAt) / (1000 * 60 * 60);

        if (!reminder.active && ageHours > maxAgeHours) {
            deleteReminder(id);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 Nettoyé ${cleaned} anciens rappels`);
    }

    return cleaned;
}

/**
 * Obtenir les statistiques
 */
function getStats() {
    const all = getAllReminders();
    const byType = {};

    for (const type of Object.values(ReminderTypes)) {
        byType[type] = all.filter(r => r.type === type).length;
    }

    return {
        total: reminders.size,
        active: all.length,
        users: userReminders.size,
        guilds: guildReminders.size,
        byType
    };
}

/**
 * Générer un ID unique
 */
function generateId() {
    return `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export JSON (pour sauvegarde manuelle)
 */
function exportToJSON() {
    return {
        reminders: Array.from(reminders.entries()),
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
    };
}

/**
 * Import JSON (pour restauration)
 */
function importFromJSON(data) {
    if (!data || !data.reminders) return 0;

    let imported = 0;
    for (const [id, reminder] of data.reminders) {
        reminders.set(id, reminder);

        // Reconstruire les index
        if (!userReminders.has(reminder.userId)) {
            userReminders.set(reminder.userId, new Set());
        }
        userReminders.get(reminder.userId).add(id);

        if (reminder.guildId) {
            if (!guildReminders.has(reminder.guildId)) {
                guildReminders.set(reminder.guildId, new Set());
            }
            guildReminders.get(reminder.guildId).add(id);
        }

        imported++;
    }

    console.log(`📥 Importé ${imported} rappels depuis JSON`);
    return imported;
}

module.exports = {
    ReminderTypes,
    createReminder,
    getReminder,
    getUserReminders,
    getGuildReminders,
    getAllReminders,
    deleteReminder,
    deactivateReminder,
    incrementTriggerCount,
    cleanOldReminders,
    getStats,
    exportToJSON,
    importFromJSON,
    setReminderTimeout
};
