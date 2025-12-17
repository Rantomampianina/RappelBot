const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    channelId: String,
    guildId: String,
    content: String,
    timestamp: { type: Date, required: true, index: true },
    hourUTC: { type: Number, index: true }, // 0-23 pour analyse rapide
    locale: String,
    source: { type: String, enum: ['discord', 'web'], default: 'discord' }
});

// Index composé pour analyse temporelle
messageSchema.index({ userId: 1, hourUTC: 1 });

module.exports = mongoose.model('Message', messageSchema);