const Rappel = require('../models/Rappel');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let client;

// Stocker les alarmes planifiées
const plannedAlarms = new Map();

function calculateAlarmTime(dateStr, timeStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

async function triggerAlarm(rappel) {
    try {
        if (!client) {
            console.error('Client Discord non initialisé dans alarm.js');
            return;
        }

        const freshRappel = await Rappel.findById(rappel._id);
        if (!freshRappel || freshRappel.completed) return;

        const channel = await client.channels.fetch(rappel.channelId).catch(() => null);
        if (!channel) {
            console.log(`Channel non trouvé: ${rappel.channelId}`);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🔔 RAPPEL')
            .setDescription(`**${rappel.text}**`)
            .addFields(
                { name: '⏰ Heure', value: `${rappel.date} à ${rappel.time}`, inline: true }
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

        await channel.send({ 
            content: `<@${rappel.user}> 📢 **RAPPEL**`, 
            embeds: [embed], 
            components: [row] 
        });

        if (rappel.repeat === 'aucun') {
            await Rappel.findByIdAndDelete(rappel._id);
        } else {
            await Rappel.findByIdAndUpdate(rappel._id, { completed: true });
        }

    } catch (error) {
        console.error('Erreur triggerAlarm:', error);
    }
}

function planifierRappel(rappel) {
    try {
        const alarmTime = calculateAlarmTime(rappel.date, rappel.time);
        const now = new Date();
        const delay = alarmTime.getTime() - now.getTime();

        if (delay <= 0) {
            console.log(`Rappel "${rappel.text}" est déjà passé`);
            return null;
        }

        // Annuler l'alarme précédente si elle existe
        const existingAlarm = plannedAlarms.get(rappel._id.toString());
        if (existingAlarm) {
            clearTimeout(existingAlarm);
        }

        const timeoutId = setTimeout(async () => {
            await triggerAlarm(rappel);
            plannedAlarms.delete(rappel._id.toString());
        }, delay);

        plannedAlarms.set(rappel._id.toString(), timeoutId);
        return timeoutId;
    } catch (error) {
        console.error('Erreur planifierRappel:', error);
        return null;
    }
}

function setupAlarmChecker(discordClient) {
    client = discordClient;
    
    setInterval(async () => {
        try {
            const now = new Date();
            const today = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
            const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
            
            const missedAlarms = await Rappel.find({ 
                date: today, 
                time: { $lte: currentTime },
                completed: false
            });

            for (const rappel of missedAlarms) {
                const rappelTime = calculateAlarmTime(rappel.date, rappel.time);
                const diffMinutes = (now - rappelTime) / (1000 * 60);
                
                if (diffMinutes <= 10 && diffMinutes > 0) {
                    console.log(`Rattrapage alarme manquée: ${rappel.text}`);
                    await triggerAlarm(rappel);
                }
            }
        } catch (error) {
            console.error('Erreur alarm checker:', error);
        }
    }, 60000);
}

module.exports = {
    planifierRappel,
    triggerAlarm,
    setupAlarmChecker
};