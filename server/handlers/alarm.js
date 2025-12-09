const Rappel = require('../models/Rappel');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');

let client;

// Stocker les alarmes planifiées
const plannedAlarms = new Map();

// Fuseau horaire par défaut (Europe/Paris)
const DEFAULT_TIMEZONE = 'Europe/Paris';

function calculateAlarmTime(dateStr, timeStr, timezone = DEFAULT_TIMEZONE) {
    try {
        // Créer une date dans le fuseau de l'utilisateur
        const dateTimeStr = `${dateStr} ${timeStr}`;
        const m = moment.tz(dateTimeStr, 'DD/MM/YYYY HH:mm', timezone);
        
        if (!m.isValid()) {
            console.error(`Date/heure invalide: ${dateStr} ${timeStr} (timezone: ${timezone})`);
            return null;
        }
        
        // Convertir en UTC pour le stockage
        const utcDate = m.utc().toDate();
        console.log(`🕐 Calcul alarme: ${dateStr} ${timeStr} ${timezone} -> UTC: ${utcDate.toISOString()}`);
        
        return utcDate;
    } catch (error) {
        console.error('Erreur calculateAlarmTime:', error);
        return null;
    }
}

async function triggerAlarm(rappel) {
    try {
        if (!client) {
            console.error('❌ Client Discord non initialisé dans alarm.js');
            return;
        }

        const freshRappel = await Rappel.findById(rappel._id);
        if (!freshRappel) {
            console.log(`❌ Rappel ${rappel._id} supprimé, annulation`);
            return;
        }
        
        if (freshRappel.completed) {
            console.log(`✅ Rappel ${rappel._id} déjà complété, annulation`);
            return;
        }

        const channel = await client.channels.fetch(rappel.channelId).catch(() => null);
        if (!channel) {
            console.log(`❌ Channel non trouvé: ${rappel.channelId}`);
            return;
        }

        // Convertir l'heure UTC stockée en heure locale pour l'affichage
        const alarmTimeUTC = calculateAlarmTime(rappel.date, rappel.time, DEFAULT_TIMEZONE);
        const localTime = moment(alarmTimeUTC).tz(DEFAULT_TIMEZONE).format('HH:mm');
        
        console.log(`🔔 Déclenchement alarme: ${rappel.text} (${rappel.date} ${localTime})`);

        const embed = new EmbedBuilder()
            .setTitle('🔔 RAPPEL')
            .setDescription(`**${rappel.text}**`)
            .addFields(
                { name: '⏰ Heure prévue', value: `${rappel.date} à ${localTime}`, inline: true },
                { name: '📍 Canal', value: `<#${rappel.channelId}>`, inline: true }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`complete_${rappel._id}`)
                .setLabel('✅ Fait')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`snooze_${rappel._id}`)
                .setLabel('⏸️ Rappeler dans 5min')
                .setStyle(ButtonStyle.Secondary)
        );

        // Essayer d'envoyer une notification dans le canal ET en DM
        try {
            await channel.send({ 
                content: `<@${rappel.user}> 📢 **RAPPEL**`, 
                embeds: [embed], 
                components: [row] 
            });
            console.log(`✅ Notification envoyée dans le canal ${channel.name}`);
        } catch (channelError) {
            console.error(`❌ Erreur envoi canal: ${channelError.message}`);
            
            // Fallback: envoyer en DM
            try {
                const user = await client.users.fetch(rappel.user);
                await user.send({ 
                    content: `📢 **RAPPEL** (impossible d'envoyer dans <#${rappel.channelId}>)`, 
                    embeds: [embed] 
                });
                console.log(`✅ Notification envoyée en DM à ${user.tag}`);
            } catch (dmError) {
                console.error(`❌ Erreur envoi DM: ${dmError.message}`);
            }
        }

        // Gérer les répétitions
        if (rappel.repeat === 'aucun') {
            await Rappel.findByIdAndDelete(rappel._id);
            console.log(`🗑️ Rappel unique supprimé: ${rappel.text}`);
        } else if (rappel.repeat === 'quotidien') {
            // Replanifier pour le lendemain
            const tomorrow = moment().tz(DEFAULT_TIMEZONE).add(1, 'days');
            const newDate = tomorrow.format('DD/MM/YYYY');
            
            await Rappel.findByIdAndUpdate(rappel._id, {
                date: newDate,
                completed: false
            });
            
            // Replanifier l'alarme
            const updatedRappel = await Rappel.findById(rappel._id);
            planifierRappel(updatedRappel);
            console.log(`🔄 Rappel quotidien replanifié pour: ${newDate}`);
            
        } else if (rappel.repeat === 'hebdomadaire') {
            // Replanifier pour la semaine prochaine
            const nextWeek = moment().tz(DEFAULT_TIMEZONE).add(7, 'days');
            const newDate = nextWeek.format('DD/MM/YYYY');
            
            await Rappel.findByIdAndUpdate(rappel._id, {
                date: newDate,
                completed: false
            });
            
            // Replanifier l'alarme
            const updatedRappel = await Rappel.findById(rappel._id);
            planifierRappel(updatedRappel);
            console.log(`🔄 Rappel hebdomadaire replanifié pour: ${newDate}`);
            
        } else {
            // Marquer comme complété pour les autres types
            await Rappel.findByIdAndUpdate(rappel._id, { completed: true });
            console.log(`✅ Rappel marqué comme complété: ${rappel.text}`);
        }

        // Nettoyer l'alarme planifiée
        plannedAlarms.delete(rappel._id.toString());

    } catch (error) {
        console.error('❌ Erreur triggerAlarm:', error);
    }
}

function planifierRappel(rappel) {
    try {
        const alarmTimeUTC = calculateAlarmTime(rappel.date, rappel.time, DEFAULT_TIMEZONE);
        
        if (!alarmTimeUTC) {
            console.error(`❌ Impossible de calculer l'heure pour: ${rappel.date} ${rappel.time}`);
            return null;
        }

        const nowUTC = new Date();
        const delay = alarmTimeUTC.getTime() - nowUTC.getTime();

        if (delay <= 0) {
            console.log(`⚠️ Rappel "${rappel.text}" est déjà passé (${rappel.date} ${rappel.time})`);
            
            // Si c'est un rappel récurrent, le replanifier pour la prochaine occurrence
            if (rappel.repeat && rappel.repeat !== 'aucun') {
                console.log(`🔄 Tentative de replanification pour le prochain cycle...`);
                // Cette logique sera gérée par triggerAlarm
                return null;
            }
            
            // Sinon, marquer comme complété
            if (!rappel.completed) {
                Rappel.findByIdAndUpdate(rappel._id, { completed: true })
                    .then(() => console.log(`✅ Rappel passé marqué comme complété: ${rappel.text}`))
                    .catch(err => console.error('❌ Erreur marquage rappel:', err));
            }
            return null;
        }

        // Annuler l'alarme précédente si elle existe
        const existingAlarm = plannedAlarms.get(rappel._id.toString());
        if (existingAlarm) {
            clearTimeout(existingAlarm);
            console.log(`♻️ Alarme précédente annulée pour: ${rappel.text}`);
        }

        const timeoutId = setTimeout(async () => {
            console.log(`⏰ Déclenchement programmé pour: ${rappel.text}`);
            await triggerAlarm(rappel);
            plannedAlarms.delete(rappel._id.toString());
        }, delay);

        plannedAlarms.set(rappel._id.toString(), timeoutId);
        
        const minutes = Math.floor(delay / 60000);
        const heures = Math.floor(minutes / 60);
        const minsRestantes = minutes % 60;
        
        console.log(`✅ Alarme planifiée: "${rappel.text}" pour ${rappel.date} ${rappel.time} (dans ${heures}h${minsRestantes}m)`);
        
        return timeoutId;
    } catch (error) {
        console.error('❌ Erreur planifierRappel:', error);
        return null;
    }
}

function setupAlarmChecker(discordClient) {
    client = discordClient;
    
    console.log('🔍 Initialisation du vérificateur d\'alarmes...');
    
    // Vérifier les alarmes manquées toutes les minutes
    setInterval(async () => {
        try {
            const now = moment().tz(DEFAULT_TIMEZONE);
            const nowDate = now.format('DD/MM/YYYY');
            const nowTime = now.format('HH:mm');
            
            // Chercher les rappels non complétés dont la date/heure est passée
            // (jusqu'à 7 jours en arrière pour rattraper)
            const sevenDaysAgo = now.clone().subtract(7, 'days').format('DD/MM/YYYY');
            
            const missedAlarms = await Rappel.find({ 
                completed: false,
                $or: [
                    { 
                        date: { $lt: nowDate },
                        time: { $exists: true }
                    },
                    { 
                        date: nowDate,
                        time: { $lte: nowTime }
                    }
                ],
                date: { $gte: sevenDaysAgo } // Limiter à 7 jours en arrière
            });

            if (missedAlarms.length > 0) {
                console.log(`🔍 ${missedAlarms.length} alarme(s) manquée(s) détectée(s)`);
            }

            for (const rappel of missedAlarms) {
                const alarmTime = calculateAlarmTime(rappel.date, rappel.time, DEFAULT_TIMEZONE);
                if (!alarmTime) continue;
                
                const diffMinutes = (now.valueOf() - alarmTime.getTime()) / (1000 * 60);
                
                // Rattraper les alarmes manquées de moins de 60 minutes
                if (diffMinutes <= 60 && diffMinutes > 0) {
                    console.log(`🔄 Rattrapage alarme manquée (${diffMinutes.toFixed(1)} min): ${rappel.text}`);
                    
                    // Vérifier si une alarme est déjà planifiée pour ce rappel
                    if (!plannedAlarms.has(rappel._id.toString())) {
                        await triggerAlarm(rappel);
                    }
                } else if (diffMinutes > 60) {
                    // Si trop ancien, marquer comme complété
                    console.log(`⏳ Alarme trop ancienne (${diffMinutes.toFixed(1)} min), marquage comme complété: ${rappel.text}`);
                    await Rappel.findByIdAndUpdate(rappel._id, { completed: true });
                }
            }
        } catch (error) {
            console.error('❌ Erreur alarm checker:', error);
        }
    }, 60000); // Toutes les minutes
    
    console.log('✅ Vérificateur d\'alarmes activé');
}

// Fonction pour replanifier toutes les alarmes au redémarrage
async function replanifierToutesAlarmes() {
    try {
        console.log('🔄 Replanification de toutes les alarmes...');
        
        const rappels = await Rappel.find({ completed: false });
        console.log(`📋 ${rappels.length} rappels non complétés à replanifier`);
        
        let planifies = 0;
        let erreurs = 0;
        
        for (const rappel of rappels) {
            try {
                const result = planifierRappel(rappel);
                if (result) planifies++;
            } catch (error) {
                console.error(`❌ Erreur replanification ${rappel._id}:`, error.message);
                erreurs++;
            }
        }
        
        console.log(`✅ Replanification terminée: ${planifies} OK, ${erreurs} erreurs`);
        
    } catch (error) {
        console.error('❌ Erreur replanifierToutesAlarmes:', error);
    }
}

module.exports = {
    planifierRappel,
    triggerAlarm,
    setupAlarmChecker,
    replanifierToutesAlarmes,
    plannedAlarms // Pour debug
};