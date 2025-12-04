const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    useGoogleCalendar: { type: Boolean, default: false },
    alarmChannelId: { type: String, default: null },
    googleCredentials: {
        accessToken: String,
        refreshToken: String,
        expiryDate: Number
    }
});

module.exports = mongoose.model('Config', configSchema);