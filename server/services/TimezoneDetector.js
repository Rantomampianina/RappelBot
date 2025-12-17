const axios = require('axios');
const moment = require('moment-timezone');
const UserPrefs = require('../models/UserPrefs');

class TimezoneDetector {
    constructor() {
        this.sources = [
            { name: 'browser', priority: 1, method: this.detectFromBrowser.bind(this) },
            { name: 'ip_api', priority: 2, method: this.detectFromIP.bind(this) },
            { name: 'discord_activity', priority: 3, method: this.detectFromActivity.bind(this) },
            { name: 'discord_locale', priority: 4, method: this.detectFromLocale.bind(this) }
        ];
    }

    /**
     * Détection principale - Essaye toutes les sources
     */
    async detectTimezone(userId, context = {}) {
        try {
            const userPrefs = await UserPrefs.findOne({ userId });
            const results = [];
            
            // Essayer chaque source
            for (const source of this.sources) {
                try {
                    const result = await source.method(userId, context, userPrefs);
                    if (result && result.timezone) {
                        results.push({
                            source: source.name,
                            timezone: result.timezone,
                            confidence: result.confidence || 0.5,
                            metadata: result.metadata || {}
                        });
                    }
                } catch (error) {
                    console.log(`[Timezone] Source ${source.name} échouée:`, error.message);
                }
            }
            
            // Calculer le meilleur résultat
            const bestResult = this.calculateBestResult(results, userPrefs);
            
            // Mettre à jour la base de données
            await this.updateUserPrefs(userId, bestResult, results);
            
            return bestResult;
            
        } catch (error) {
            console.error('[Timezone] Erreur détection:', error);
            return { timezone: 'UTC', confidence: 0, source: 'fallback' };
        }
    }

    /**
     * SOURCE 1: Détection navigateur (via API)
     */
    async detectFromBrowser(userId, context, userPrefs) {
        // Cette méthode est appelée depuis le frontend React
        // Le frontend envoie le fuseau détecté par le navigateur
        if (context.browserTimezone) {
            return {
                timezone: context.browserTimezone,
                confidence: 0.95, // Très fiable
                metadata: {
                    userAgent: context.userAgent,
                    languages: context.languages,
                    platform: context.platform
                }
            };
        }
        return null;
    }

    /**
     * SOURCE 2: API IP Geolocation (ipapi.co - gratuit)
     */
    async detectFromIP(userId, context, userPrefs) {
        try {
            // Récupérer l'IP si disponible
            const ip = context.ipAddress || userPrefs?.ipAddress;
            if (!ip || ip === '127.0.0.1') return null;
            
            // Utiliser ipapi.co (1000 requêtes/mois gratuit)
            const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
                timeout: 5000
            });
            
            if (response.data.timezone) {
                return {
                    timezone: response.data.timezone,
                    confidence: 0.85,
                    metadata: {
                        country: response.data.country_name,
                        city: response.data.city,
                        region: response.data.region,
                        org: response.data.org
                    }
                };
            }
        } catch (error) {
            // Silencieux - fallback sur d'autres méthodes
        }
        return null;
    }

    /**
     * SOURCE 3: Analyse d'activité Discord
     */
    async detectFromActivity(userId, context, userPrefs) {
        try {
            // Récupérer les messages de l'utilisateur (stockés dans la DB)
            const Message = require('../models/Message'); // À créer si nécessaire
            const messages = await Message.find({ userId })
                .sort({ timestamp: -1 })
                .limit(500);
            
            if (messages.length < 20) return null; // Pas assez de données
            
            // Analyser les heures d'activité
            const hourCounts = Array(24).fill(0);
            messages.forEach(msg => {
                const hour = new Date(msg.timestamp).getUTCHours();
                hourCounts[hour]++;
            });
            
            // Trouver l'heure de pointe
            const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
            
            // Déduire le fuseau
            const timezone = this.inferTimezoneFromPeakHour(peakHour, messages.length);
            
            return {
                timezone,
                confidence: Math.min(0.7, messages.length / 200), // Plus de données = plus fiable
                metadata: {
                    peakHourUTC: peakHour,
                    messageCount: messages.length,
                    activitySpread: this.calculateActivitySpread(hourCounts)
                }
            };
            
        } catch (error) {
            return null;
        }
    }

    /**
     * SOURCE 4: Locale Discord
     */
    async detectFromLocale(userId, context, userPrefs) {
        const locale = context.discordLocale || userPrefs?.discordLocale;
        if (!locale) return null;
        
        const localeMap = {
            // Europe
            'fr': 'Europe/Paris', 'en-GB': 'Europe/London', 'de': 'Europe/Berlin',
            'es': 'Europe/Madrid', 'it': 'Europe/Rome', 'nl': 'Europe/Amsterdam',
            'pl': 'Europe/Warsaw', 'ru': 'Europe/Moscow', 'pt': 'Europe/Lisbon',
            
            // Amériques
            'en-US': 'America/New_York', 'es-419': 'America/Mexico_City',
            'pt-BR': 'America/Sao_Paulo', 'en-CA': 'America/Toronto',
            
            // Asie
            'ja': 'Asia/Tokyo', 'ko': 'Asia/Seoul', 'zh-CN': 'Asia/Shanghai',
            'zh-TW': 'Asia/Taipei', 'hi': 'Asia/Kolkata', 'ar': 'Asia/Riyadh',
            'th': 'Asia/Bangkok', 'vi': 'Asia/Ho_Chi_Minh',
            
            // Océanie
            'en-AU': 'Australia/Sydney', 'en-NZ': 'Pacific/Auckland',
            
            // Afrique
            'mg': 'Indian/Antananarivo', // Malagasy - Madagascar
            'ar-DZ': 'Africa/Algiers', 'sw': 'Africa/Nairobi',
            'am': 'Africa/Addis_Ababa', 'yo': 'Africa/Lagos'
        };
        
        const timezone = localeMap[locale] || this.guessFromLanguageCode(locale);
        
        return {
            timezone,
            confidence: 0.6,
            metadata: { locale }
        };
    }

    /**
     * Calculer le meilleur résultat parmi toutes les sources
     */
    calculateBestResult(results, userPrefs) {
        if (results.length === 0) {
            return { timezone: 'UTC', confidence: 0, source: 'fallback' };
        }
        
        // 1. Regrouper par fuseau
        const timezoneGroups = {};
        results.forEach(result => {
            if (!timezoneGroups[result.timezone]) {
                timezoneGroups[result.timezone] = [];
            }
            timezoneGroups[result.timezone].push(result);
        });
        
        // 2. Pour chaque fuseau, calculer un score agrégé
        const scoredTimezones = Object.entries(timezoneGroups).map(([tz, sources]) => {
            // Score = moyenne pondérée des confiances
            const totalConfidence = sources.reduce((sum, s) => sum + s.confidence, 0);
            const avgConfidence = totalConfidence / sources.length;
            
            // Bonus pour consensus multiple
            const consensusBonus = sources.length > 1 ? 0.1 : 0;
            
            return {
                timezone: tz,
                confidence: Math.min(1, avgConfidence + consensusBonus),
                sourceCount: sources.length,
                sources: sources.map(s => s.source)
            };
        });
        
        // 3. Trier par score décroissant
        scoredTimezones.sort((a, b) => b.confidence - a.confidence);
        
        // 4. Retourner le meilleur
        const best = scoredTimezones[0];
        return {
            timezone: best.timezone,
            confidence: best.confidence,
            source: best.sources.join('+'),
            sourceCount: best.sourceCount
        };
    }

    /**
     * Mettre à jour les préférences utilisateur
     */
    async updateUserPrefs(userId, bestResult, allResults) {
        const updateData = {
            timezone: bestResult.timezone,
            timezoneConfidence: bestResult.confidence,
            timezoneSources: allResults.map(r => ({
                source: r.source,
                timezone: r.timezone,
                confidence: r.confidence,
                detectedAt: new Date(),
                metadata: r.metadata
            })),
            updatedAt: new Date(),
            $push: {
                detectionHistory: {
                    method: bestResult.source,
                    result: bestResult.timezone,
                    confidence: bestResult.confidence,
                    timestamp: new Date()
                }
            }
        };
        
        await UserPrefs.findOneAndUpdate(
            { userId },
            updateData,
            { upsert: true, new: true }
        );
    }

    /**
     * Méthodes utilitaires
     */
    inferTimezoneFromPeakHour(peakHourUTC, sampleSize) {
        // Mapping avancé heure UTC -> fuseau probable
        const hourMap = [
            'Europe/London',      // 0h
            'Europe/Paris',       // 1h
            'Europe/Helsinki',    // 2h
            'Europe/Moscow',      // 3h
            'Asia/Dubai',         // 4h
            'Asia/Karachi',       // 5h
            'Asia/Dhaka',         // 6h
            'Asia/Bangkok',       // 7h
            'Asia/Shanghai',      // 8h
            'Asia/Tokyo',         // 9h
            'Australia/Sydney',   // 10h
            'Pacific/Guam',       // 11h
            'Pacific/Auckland',   // 12h
            'Pacific/Fiji',       // 13h
            'Pacific/Honolulu',   // 14h
            'America/Anchorage',  // 15h
            'America/Los_Angeles',// 16h
            'America/Denver',     // 17h
            'America/Chicago',    // 18h
            'America/New_York',   // 19h
            'America/Halifax',    // 20h
            'America/Argentina',  // 21h
            'America/Sao_Paulo',  // 22h
            'Atlantic/Azores'     // 23h
        ];
        
        return hourMap[peakHourUTC] || 'UTC';
    }
    
    calculateActivitySpread(hourCounts) {
        const total = hourCounts.reduce((a, b) => a + b, 0);
        if (total === 0) return 0;
        const mean = total / 24;
        const variance = hourCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 24;
        return Math.sqrt(variance) / mean; // Coefficient de variation
    }
    
    guessFromLanguageCode(locale) {
        const langCode = locale.split('-')[0];
        const langMap = {
            'en': 'America/New_York', 'es': 'America/Mexico_City',
            'fr': 'Europe/Paris', 'de': 'Europe/Berlin',
            'pt': 'America/Sao_Paulo', 'ru': 'Europe/Moscow',
            'ja': 'Asia/Tokyo', 'zh': 'Asia/Shanghai',
            'ar': 'Asia/Riyadh', 'hi': 'Asia/Kolkata'
        };
        return langMap[langCode] || 'UTC';
    }
}

async function validateTimezoneAccuracy(userId) {
    const userPrefs = await UserPrefs.findOne({ userId });
    if (!userPrefs || userPrefs.timezoneConfidence > 0.8) return;
    
    // Si confiance faible, redétecter
    const newDetection = await this.detectTimezone(userId, {});
    
    // Si nouveau résultat différent avec haute confiance, mettre à jour
    if (newDetection.confidence > userPrefs.timezoneConfidence + 0.2) {
        console.log(`[Timezone] Mise à jour fuseau pour ${userId}: ${userPrefs.timezone} -> ${newDetection.timezone}`);
        await this.updateUserPrefs(userId, newDetection, []);
    }
}

module.exports = new TimezoneDetector();