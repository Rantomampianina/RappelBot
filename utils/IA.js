const Rappel = require('../models/Rappel');

module.exports = async (text, userId) => {
    const lower = text.toLowerCase();
    
    // Détection améliorée des réunions
    const meetingKeywords = ['réunion', 'meeting', 'conférence', 'rendez-vous', 'session', 'réunion', 'meeting'];
    const isMeeting = meetingKeywords.some(keyword => lower.includes(keyword));
    
    // Détection améliorée de la durée
    let duration = 0;
    const durationPatterns = [
        /(\d+)\s*(?:min|minutes?|m)\b/gi,
        /(\d+)\s*(?:h|heures?|hours?)\b/gi,
        /(\d+)\s*(?:hr|hre)\b/gi
    ];
    
    for (const pattern of durationPatterns) {
        const match = pattern.exec(text);
        if (match) {
            const value = parseInt(match[1]);
            if (match[0].includes('h') || match[0].includes('heure')) {
                duration = value * 60;
            } else {
                duration = value;
            }
            break;
        }
    }

    // Détection des appels courts vs longs
    const isAppel = /(appel|call|téléphone|zoom|teams|skype)/i.test(lower);
    if (isAppel && duration <= 15) {
        // Appel court = rappel normal
        return { isMeeting: false, duration, priority: 3, duplicates: [] };
    }

    const priority = /(urgent|important|deadline|asap|délai)/i.test(lower) ? 5 : 3;

    // Détection des doublons améliorée
    const existing = await Rappel.find({ user: userId });
    const duplicates = existing.filter(rappel => {
        const similarity = calculateSimilarity(text, rappel.text);
        return similarity > 0.6; // 60% de similarité
    });

    return { 
        isMeeting: isMeeting || (isAppel && duration > 15), 
        duration, 
        priority, 
        duplicates 
    };
};

// Fonction de similarité améliorée
function calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
}