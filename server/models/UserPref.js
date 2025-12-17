const mongoose = require('mongoose');

const userPrefsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    
    // Données de fuseau
    timezone: { type: String, default: 'UTC' },
    timezoneConfidence: { type: Number, default: 0 }, // 0-1 score de confiance
    timezoneSources: [{
        source: String, // 'browser', 'ip_api', 'discord_activity', 'locale', 'manual'
        timezone: String,
        confidence: Number,
        detectedAt: Date,
        metadata: mongoose.Schema.Types.Mixed
    }],
    
    // Données de détection
    ipAddress: String,
    countryCode: String,
    discordLocale: String,
    activityPattern: {
        peakHourUTC: Number,
        totalMessages: { type: Number, default: 0 },
        lastActive: Date
    },
    
    // Statistiques
    detectionHistory: [{
        method: String,
        result: String,
        confidence: Number,
        timestamp: Date
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index pour recherche rapide
userPrefsSchema.index({ userId: 1 });
userPrefsSchema.index({ 'activityPattern.lastActive': -1 });

module.exports = mongoose.model('UserPrefs', userPrefsSchema);