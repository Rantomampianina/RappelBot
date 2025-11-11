const { google } = require('googleapis');
const Config = require('../models/Config');

class GoogleCalendarService {
    constructor() {
        console.log('🔧 Initialisation Google Service...');
        console.log('🔑 Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Défini' : '✗ Manquant');
        console.log('🔑 Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Défini' : '✗ Manquant');
        console.log('🔗 Redirect URI:', process.env.GOOGLE_REDIRECT_URI);
        
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        
        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }

    generateAuthUrl(guildId) {
        console.log('🌐 Génération URL auth pour guild:', guildId);
        
        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            state: guildId,
            prompt: 'consent'
        });
        
        console.log('🔗 URL Auth générée:', authUrl);
        return authUrl;
    }

    async getTokensFromCode(code) {
        try {
            console.log('🔄 Échange code contre tokens...');
            console.log('📧 Code reçu:', code);
            console.log('🔗 Redirect URI:', process.env.GOOGLE_REDIRECT_URI);
            
            if (!code) {
                throw new Error('Code manquant');
            }
            
            const { tokens } = await this.oauth2Client.getToken(code);
            
            console.log('✅ Tokens obtenus avec succès!');
            console.log('🔑 Access Token:', tokens.access_token ? '✓ Présent' : '✗ Manquant');
            console.log('🔄 Refresh Token:', tokens.refresh_token ? '✓ Présent' : '✗ Manquant');
            
            return tokens;
            
        } catch (error) {
            console.error('❌ ERREUR getTokensFromCode:');
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            
            throw new Error(`Échec authentification Google: ${error.message}`);
        }
    }

    async saveTokens(guildId, tokens) {
        try {
            console.log('💾 Sauvegarde tokens pour guild:', guildId);
            
            await Config.findOneAndUpdate(
                { guildId },
                {
                    useGoogleCalendar: true,
                    googleCredentials: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiryDate: tokens.expiry_date
                    }
                },
                { upsert: true, new: true }
            );
            
            console.log('✅ Tokens sauvegardés avec succès');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde tokens:', error);
            throw error;
        }
    }

    // Configurer l'authentification pour un serveur
    async setAuthForGuild(guildId) {
        try {
            const config = await Config.findOne({ guildId });
            if (!config?.googleCredentials?.accessToken) {
                throw new Error('Google Calendar non configuré pour ce serveur');
            }

            this.oauth2Client.setCredentials({
                access_token: config.googleCredentials.accessToken,
                refresh_token: config.googleCredentials.refreshToken
            });

            // Vérifier si le token a expiré
            if (config.googleCredentials.expiryDate < Date.now()) {
                await this.refreshTokens(guildId);
            }

            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            return true;

        } catch (error) {
            console.error('Erreur configuration auth:', error);
            throw error;
        }
    }

    // Rafraîchir les tokens d'accès
    async refreshTokens(guildId) {
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            await this.saveTokens(guildId, credentials);
            return credentials;
        } catch (error) {
            console.error('Erreur rafraîchissement token:', error);
            // Désactiver Google Calendar en cas d'erreur
            await Config.findOneAndUpdate(
                { guildId },
                { useGoogleCalendar: false }
            );
            throw error;
        }
    }

    // Créer un événement Google Calendar
    async createEvent(guildId, rappel, userInfo) {
        try {
            await this.setAuthForGuild(guildId);

            const { date, time, text, duration = 60 } = rappel;
            
            // Conversion date/heure
            const [day, month, year] = date.split('/').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            const event = {
                summary: text,
                description: `Créé via RappelBot par ${userInfo.username}`,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'Europe/Paris',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'Europe/Paris',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 10 },
                        { method: 'popup', minutes: 30 }
                    ],
                },
            };

            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            return {
                success: true,
                eventId: response.data.id,
                htmlLink: response.data.htmlLink,
                hangoutLink: response.data.hangoutLink
            };

        } catch (error) {
            console.error('Erreur création événement Google:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Générer un lien Google Calendar rapide (sans authentification)
    generateQuickEventURL(rappel) {
        try {
            const { date, time, text, duration = 60 } = rappel;
            
            const [day, month, year] = date.split('/').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            const formatForURL = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: text,
                dates: `${formatForURL(startDateTime)}/${formatForURL(endDateTime)}`,
                details: `Créé via RappelBot`,
                location: 'Online'
            });

            return `https://calendar.google.com/calendar/render?${params.toString()}`;

        } catch (error) {
            console.error('Erreur génération URL Google:', error);
            return 'https://calendar.google.com/calendar';
        }
    }

    // Vérifier la validité des tokens
    async checkTokenValidity(guildId) {
        try {
            await this.setAuthForGuild(guildId);
            // Tester avec une requête simple
            await this.calendar.calendarList.list({ maxResults: 1 });
            return true;
        } catch (error) {
            console.error('Token invalide:', error);
            return false;
        }
    }
}

module.exports = new GoogleCalendarService();