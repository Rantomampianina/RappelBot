// client/src/utils/timezoneDetection.js
// Fichier utilitaire PUR JavaScript - PAS de React hooks ici !

/**
 * Détecte le fuseau horaire du navigateur et l'envoie au backend
 * @param {string} userId - ID Discord de l'utilisateur
 * @returns {Promise<{timezone: string, confidence: number, success: boolean}>}
 */
export async function detectAndSendTimezone(userId) {
    try {
        console.log('🌍 Détection fuseau horaire pour:', userId);
        
        // Vérifier si on est dans un navigateur
        if (typeof window === 'undefined' || !navigator) {
            console.warn('⚠️ Pas dans un navigateur, retour UTC');
            return { 
                timezone: 'UTC', 
                confidence: 0, 
                success: false,
                reason: 'not_browser'
            };
        }

        // Détecter les informations du navigateur
        const browserData = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userAgent: navigator.userAgent,
            languages: Array.isArray(navigator.languages) ? navigator.languages : [],
            platform: navigator.platform,
            screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            timestamp: new Date().toISOString()
        };

        console.log('📊 Données navigateur:', {
            timezone: browserData.timezone,
            languages: browserData.languages,
            platform: browserData.platform
        });

        // URL de l'API (à adapter selon votre environnement)
        const API_URL = import.meta.env.VITE_API_URL || 'https://rappelbot.onrender.com';
        
        // Envoyer au backend
        const response = await fetch(`${API_URL}/api/detect-timezone`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                userId, 
                browserData,
                source: 'browser_autodetect'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        console.log('✅ Réponse backend:', {
            timezone: data.timezone,
            confidence: data.confidence,
            source: data.source
        });
        
        return {
            timezone: data.timezone || 'UTC',
            confidence: data.confidence || 0,
            success: true,
            source: data.source,
            serverTime: data.serverTime
        };
        
    } catch (error) {
        console.error('❌ Erreur détection fuseau:', error);
        return { 
            timezone: 'UTC', 
            confidence: 0, 
            success: false,
            error: error.message
        };
    }
}

/**
 * Détecte le fuseau horaire local SANS envoyer au backend
 * @returns {string} - Fuseau horaire IANA (ex: 'Europe/Paris')
 */
export function detectLocalTimezone() {
    try {
        if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
            return 'UTC';
        }
        
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Vérifier que c'est un fuseau valide
        if (!timezone || timezone.includes('Etc/') || timezone === 'UTC') {
            // Essayer avec la date locale
            const offset = -new Date().getTimezoneOffset() / 60;
            return `Etc/GMT${offset >= 0 ? '-' : '+'}${Math.abs(offset)}`;
        }
        
        return timezone;
    } catch (error) {
        console.error('Erreur détection fuseau local:', error);
        return 'UTC';
    }
}

/**
 * Obtenir l'heure locale formatée
 * @param {Date} date - Date à formater (par défaut maintenant)
 * @param {string} timezone - Fuseau horaire (optionnel)
 * @returns {string} - Heure formatée HH:MM
 */
export function formatLocalTime(date = new Date(), timezone = null) {
    try {
        const options = {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone || undefined
        };
        
        return date.toLocaleTimeString('fr-FR', options);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        // Fallback simple
        const d = new Date(date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
}

/**
 * Obtenir le décalage UTC en minutes
 * @returns {number} - Décalage en minutes (ex: -60 pour UTC+1)
 */
export function getUTCOffset() {
    return new Date().getTimezoneOffset();
}

/**
 * Convertir un décalage en minutes vers un nom de fuseau approximatif
 * @param {number} offsetMinutes - Décalage en minutes
 * @returns {string} - Nom de fuseau approximatif
 */
export function offsetToTimezone(offsetMinutes) {
    const offsetHours = -offsetMinutes / 60; // Inverser le signe
    
    // Mapping des décalages communs
    const offsetMap = {
        '-12': 'Pacific/Midway',
        '-11': 'Pacific/Pago_Pago',
        '-10': 'Pacific/Honolulu',
        '-9': 'America/Anchorage',
        '-8': 'America/Los_Angeles',
        '-7': 'America/Denver',
        '-6': 'America/Chicago',
        '-5': 'America/New_York',
        '-4': 'America/Halifax',
        '-3': 'America/Argentina/Buenos_Aires',
        '-2': 'America/Noronha',
        '-1': 'Atlantic/Azores',
        '0': 'UTC',
        '1': 'Europe/Paris',
        '2': 'Europe/Helsinki',
        '3': 'Europe/Moscow',
        '4': 'Asia/Dubai',
        '5': 'Asia/Karachi',
        '5.5': 'Asia/Kolkata',
        '6': 'Asia/Dhaka',
        '7': 'Asia/Bangkok',
        '8': 'Asia/Shanghai',
        '9': 'Asia/Tokyo',
        '10': 'Australia/Sydney',
        '11': 'Pacific/Guadalcanal',
        '12': 'Pacific/Auckland',
        '13': 'Pacific/Tongatapu'
    };
    
    // Arrondir à l'heure ou demi-heure la plus proche
    const roundedOffset = Math.round(offsetHours * 2) / 2;
    return offsetMap[roundedOffset.toString()] || 'UTC';
}

/**
 * Liste des fuseaux horaires courants pour l'autocomplétion
 */
export const COMMON_TIMEZONES = [
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Mexico_City',
    'America/New_York',
    'America/Sao_Paulo',
    'America/Toronto',
    'Asia/Bangkok',
    'Asia/Dubai',
    'Asia/Hong_Kong',
    'Asia/Jakarta',
    'Asia/Kolkata',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Taipei',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/Amsterdam',
    'Europe/Berlin',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Moscow',
    'Europe/Paris',
    'Europe/Rome',
    'Indian/Antananarivo',  // Madagascar
    'Pacific/Auckland',
    'UTC'
];

/**
 * Valider si un fuseau horaire est valide
 * @param {string} timezone - Nom du fuseau à valider
 * @returns {boolean}
 */
export function isValidTimezone(timezone) {
    try {
        if (!timezone || typeof timezone !== 'string') return false;
        
        // Tester en créant une date avec ce fuseau
        const testDate = new Date().toLocaleString('en-US', { timeZone: timezone });
        return testDate !== 'Invalid Date' && !testDate.includes('Invalid');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return false;
    }
}

// Version ES module pour Vite
export default {
    detectAndSendTimezone,
    detectLocalTimezone,
    formatLocalTime,
    getUTCOffset,
    offsetToTimezone,
    COMMON_TIMEZONES,
    isValidTimezone
};