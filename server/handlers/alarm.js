const Rappel = require('../models/Rappel');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let client;

// Stocker les alarmes planifiées
const plannedAlarms = new Map();

// Fonction pour obtenir l'heure actuelle dans un fuseau donné
function getNowInTimezone(timezone = 'Europe/Paris') {
    return new Date().toLocaleString('fr-FR', { timeZone: timezone });
}

// Fonction pour calculer le timestamp d'une date/heure dans un fuseau
function calculateAlarmTimestamp(dateStr, timeStr, timezone = 'Europe/Paris') {
    try {
        // Créer une date dans le fuseau de l'utilisateur
        const [day, month, year] = dateStr.split('/').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Créer une string ISO dans le fuseau
        const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        
        // Convertir en Date avec le fuseau
        const dateWithTimezone = new Date(dateString + 'Z'); // 'Z' indique UTC, mais on va l'ajuster
        
        // Obtenir le décalage entre UTC et le fuseau demandé (en minutes)
        const timezoneOffset = getTimezoneOffset(timezone, dateWithTimezone);
        
        // Ajuster pour le fuseau
        const utcTimestamp = dateWithTimezone.getTime() - (timezoneOffset * 60000);
        
        console.log(`🕐 Calcul alarme: ${dateStr} ${timeStr} ${timezone}`);
        console.log(`   -> Date locale: ${dateString}`);
        console.log(`   -> Décalage fuseau: ${timezoneOffset} minutes`);
        console.log(`   -> Timestamp UTC: ${utcTimestamp} (${new Date(utcTimestamp).toISOString()})`);
        
        return utcTimestamp;
    } catch (error) {
        console.error('❌ Erreur calculateAlarmTimestamp:', error);
        return null;
    }
}

// Obtenir le décalage d'un fuseau horaire (en minutes)
function getTimezoneOffset(timezone, date = new Date()) {
    try {
        const formatter = new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        });
        
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find(part => part.type === 'timeZoneName');
        
        if (offsetPart && offsetPart.value) {
            const match = offsetPart.value.match(/UTC([+-]\d{1,2})(?::(\d{2}))?/);
            if (match) {
                const hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;
                return (hours * 60) + (hours < 0 ? -minutes : minutes);
            }
        }
        
        // Fallback pour Europe/Paris
        const now = new Date();
        const jan = new Date(now.getFullYear(), 0, 1);
        const jul = new Date(now.getFullYear(), 6, 1);
        
        // Heure d'été (mars à octobre) : UTC+2, sinon UTC+1
        const isSummerTime = now.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return isSummerTime ? -120 : -60; // En minutes (négatif car Europe est en avance sur UTC)
        
    } catch (error) {
        console.error('❌ Erreur getTimezoneOffset:', error);
        return -60; // Fallback: UTC+1
    }
}

// Obtenir l'heure actuelle dans un fuseau
function getCurrentTimeInTimezone(timezone = 'Europe/Paris') {
    try {
        const now = new Date();
        return now.toLocaleTimeString('fr-FR', { 
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('❌ Erreur getCurrentTimeInTimezone:', error);
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
}

// Obtenir la date actuelle dans un fuseau
function getCurrentDateInTimezone(timezone = 'Europe/Paris') {
    try {
        const now = new Date();
        return now.toLocaleDateString('fr-FR', { 
            timeZone: timezone,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    } catch (error) {
        console.error('❌ Erreur getCurrentDateInTimezone:', error);
        const now = new Date();
        return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    }
}

async function triggerAlarm(rappel) {
    try {
        if (!client) {
            console.error('❌ Client Discord non initialisé dans alarm.js');
            return;
        }

        const freshRappel = await Rappel.findById(rappel._id);
        if (!freshRappel || freshRappel.completed) {
            console.log(`✅ Rappel ${rappel._id} déjà traité, annulation`);
            return;
        }

        const channel = await client.channels.fetch(rappel.channelId).catch(() => null);
        const user = await client.users.fetch(rappel.user).catch(() => null);
        
        if (!channel && !user) {
            console.log(`❌ Canal et utilisateur non trouvés pour rappel ${rappel._id}`);
            return;
        }

        console.log(`🔔 Déclenchement alarme: "${rappel.text}" pour ${rappel.user}`);

        const embed = new EmbedBuilder()
            .setTitle('🔔 RAPPEL')
            .setDescription(`**${rappel.text}**`)
            .addFields(
                { name: '⏰ Heure prévue', value: `${rappel.date} à ${rappel.time}`, inline: true },
                { name: '📍 Canal', value: rappel.channelId ? `<#${rappel.channelId}>` : 'DM', inline: true }
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

        // Essayer d'envoyer dans le canal
        if (channel) {
            try {
                await channel.send({ 
                    content: `<@${rappel.user}> 📢 **RAPPEL**`, 
                    embeds: [embed], 
                    components: [row] 
                });
                console.log(`✅ Notification envoyée dans le canal ${channel.name}`);
            } catch (channelError) {
                console.error(`❌ Erreur envoi canal: ${channelError.message}`);
            }
        }

        // Toujours essayer d'envoyer en DM
        if (user) {
            try {
                await user.send({ 
                    content: `📢 **RAPPEL**`, 
                    embeds: [embed],
                    components: channel ? [] : [row] // Pas de boutons si déjà envoyés dans le canal
                });
                console.log(`✅ Notification envoyée en DM à ${user.tag}`);
            } catch (dmError) {
                console.error(`❌ Erreur envoi DM: ${dmError.message}`);
            }
        }

        // Gérer les répétitions
        const timezone = rappel.timezone || 'Europe/Paris';
        
        if (rappel.repeat === 'aucun') {
            await Rappel.findByIdAndDelete(rappel._id);
            console.log(`🗑️ Rappel unique supprimé: ${rappel.text}`);
        } else if (rappel.repeat === 'quotidien') {
            // Calculer la date de demain dans le fuseau de l'utilisateur
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const newDate = tomorrow.toLocaleDateString('fr-FR', { 
                timeZone: timezone,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '/');
            
            await Rappel.findByIdAndUpdate(rappel._id, {
                date: newDate,
                completed: false
            });
            
            // Replanifier l'alarme
            const updatedRappel = await Rappel.findById(rappel._id);
            planifierRappel(updatedRappel);
            console.log(`🔄 Rappel quotidien replanifié pour: ${newDate}`);
            
        } else if (rappel.repeat === 'hebdomadaire') {
            // Calculer la date de la semaine prochaine
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const newDate = nextWeek.toLocaleDateString('fr-FR', { 
                timeZone: timezone,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '/');
            
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
        const timezone = rappel.timezone || 'Europe/Paris';
        const alarmTimestamp = calculateAlarmTimestamp(rappel.date, rappel.time, timezone);
        
        if (!alarmTimestamp) {
            console.error(`❌ Impossible de calculer l'heure pour: ${rappel.date} ${rappel.time} (fuseau: ${timezone})`);
            return null;
        }

        const nowUTC = Date.now();
        const delay = alarmTimestamp - nowUTC;

        console.log(`[DEBUG] Heure actuelle UTC: ${new Date(nowUTC).toISOString()}`);
        console.log(`[DEBUG] Heure alarme UTC: ${new Date(alarmTimestamp).toISOString()}`);
        console.log(`[DEBUG] Délai calculé: ${delay}ms (${Math.round(delay/1000)} secondes)`);

        if (delay <= 0) {
            console.log(`⚠️ Rappel "${rappel.text}" est déjà passé (${rappel.date} ${rappel.time} ${timezone})`);
            
            // Vérifier si passé depuis moins de 5 minutes
            if (delay > -300000) { // -5 minutes en ms
                console.log(`🔄 Déclenchement immédiat (dépassé de ${Math.round(-delay/1000)}s)`);
                setTimeout(() => triggerAlarm(rappel), 100);
            } else {
                console.log(`⏰ Trop tard (dépassé de ${Math.round(-delay/60000)} minutes), marquage comme complété`);
                if (!rappel.completed) {
                    Rappel.findByIdAndUpdate(rappel._id, { completed: true })
                        .catch(err => console.error('❌ Erreur marquage rappel:', err));
                }
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
        
        console.log(`✅ Alarme planifiée: "${rappel.text}" pour ${rappel.date} ${rappel.time} ${timezone} (dans ${heures}h${minsRestantes}m)`);
        
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
            const rappels = await Rappel.find({ completed: false });
            
            if (rappels.length === 0) return;
            
            console.log(`🔍 Vérification de ${rappels.length} rappels non complétés...`);
            
            for (const rappel of rappels) {
                const timezone = rappel.timezone || 'Europe/Paris';
                const alarmTimestamp = calculateAlarmTimestamp(rappel.date, rappel.time, timezone);
                
                if (!alarmTimestamp) continue;
                
                const nowUTC = Date.now();
                const diffMinutes = (nowUTC - alarmTimestamp) / (1000 * 60);
                
                // Si l'alarme est passée de moins de 60 minutes et pas déjà planifiée
                if (diffMinutes > 0 && diffMinutes <= 60 && !plannedAlarms.has(rappel._id.toString())) {
                    console.log(`🔄 Rattrapage alarme manquée (${diffMinutes.toFixed(1)} min): ${rappel.text}`);
                    await triggerAlarm(rappel);
                }
                
                // Si trop ancien (plus de 24h), marquer comme complété
                if (diffMinutes > 1440) { // 24h
                    console.log(`⏳ Alarme trop ancienne (${Math.round(diffMinutes/60)}h), marquage comme complété: ${rappel.text}`);
                    await Rappel.findByIdAndUpdate(rappel._id, { completed: true });
                }
            }
        } catch (error) {
            console.error('❌ Erreur alarm checker:', error);
        }
    }, 30000); // Toutes les 30 secondes
    
    console.log('✅ Vérificateur d\'alarmes activé (vérification toutes les 30s)');
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

// Fonction de debug pour vérifier les fuseaux
function debugTimezone() {
    console.log('🌍 Debug fuseaux horaires:');
    console.log(`   Heure serveur (UTC): ${new Date().toISOString()}`);
    console.log(`   Heure Europe/Paris: ${getCurrentDateInTimezone('Europe/Paris')} ${getCurrentTimeInTimezone('Europe/Paris')}`);
    console.log(`   Décalage Europe/Paris: ${getTimezoneOffset('Europe/Paris')} minutes`);
}

module.exports = {
    planifierRappel,
    triggerAlarm,
    setupAlarmChecker,
    replanifierToutesAlarmes,
    plannedAlarms,
    debugTimezone,
    getCurrentTimeInTimezone,
    getCurrentDateInTimezone
};