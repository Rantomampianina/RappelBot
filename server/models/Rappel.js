const mongoose = require('mongoose');

const rappelSchema = new mongoose.Schema({
    user: String,
    text: String,
    date: String,
    time: String,
    duration: Number,
    priority: { type: Number, default: 1 },
    repeat: { type: String, default: 'aucun' },
    timezone: { type: String, default: 'Europe/Paris' }, // Ajout du fuseau
    eventId: String,
    completed: { type: Boolean, default: false },
    channelId: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rappel', rappelSchema);