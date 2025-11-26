// Mongoose Schéma

const mongoose = require('mongoose');

const rappelSchema = new mongoose.Schema({
    user: String,
    text: String,
    date: String,
    time: String,
    duration: Number,
    priority: Number,
    repeat: { type: String, default: 'aucun' },
    eventId: String,
    completed: Boolean,
    channelId: String
});

module.exports = mongoose.model('Rappel', rappelSchema);