const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
    user: String,
    action: String,
    oldText: String,
    newText: String,
    rappel: Object,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Historique', historiqueSchema);