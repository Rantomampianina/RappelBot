const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const analyze = require('../utils/IA');
const Rappel = require('../models/Rappel');
const Config = require('../models/Config');
// Correction de l'import
const { planifierRappel } = require('../handlers/alarm');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rappel')
        .setDescription('Ajoute un rappel intelligent')
        .addStringOption(o => o.setName('texte').setDescription('Texte du rappel').setRequired(true))
        .addStringOption(o => o.setName('heure').setDescription('Heure (HH:MM)').setRequired(true))
        .addStringOption(o => o.setName('date').setDescription('Date (JJ/MM/AAAA)').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        
        const texte = interaction.options.getString('texte');
        let date = interaction.options.getString('date');
        const time = interaction.options.getString('heure');
        const userId = interaction.user.id;
        const guildId = interaction.guildId || 'dm';

        // Validation de l'heure
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            return interaction.editReply('❌ Format d\'heure invalide. Utilisez HH:MM (ex: 14:30)');
        }

        // Date par défaut = aujourd'hui
        if (!date) {
            const today = new Date();
            date = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
        }

        // Validation de la date
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
            return interaction.editReply('❌ Format de date invalide. Utilisez JJ/MM/AAAA');
        }

        try {
            // Analyse IA
            const { isMeeting, duration, duplicates } = await analyze(texte, userId);
            
            console.log('Analyse IA:', { isMeeting, duration, duplicates: duplicates.length });

            if (duplicates.length > 0) {
                return interaction.editReply({
                    content: `⚠️ **Doublon détecté !**\nUn rappel similaire existe déjà : "${duplicates[0].text}"`,
                    ephemeral: true
                });
            }

            // Cas réunion avec Google Calendar
            if (isMeeting && duration > 15) {
                const config = await Config.findOne({ guildId });
                if (config?.useGoogleCalendar) {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`create_google_${Date.now()}`)
                            .setLabel('📅 Créer sur Google Calendar')
                            .setStyle(ButtonStyle.Success)
                    );
                    return interaction.editReply({ 
                        content: `📅 **Réunion détectée**\n**${texte}**\n⏰ ${date} à ${time} (${duration}min)`,
                        components: [row] 
                    });
                }
            }

            // Création du rappel normal
                const rappel = new Rappel({ 
                    user: userId, 
                    text: texte, 
                    date, 
                    time, 
                    duration,
                    channelId: interaction.channelId,
                    completed: false,
                    timezone: 'Europe/Paris' // Ajout du fuseau
                });

            await rappel.save();
            
            // Planifier l'alarme
            planifierRappel(rappel);

            const typeLabel = isMeeting ? 'Réunion' : 'Rappel';
            await interaction.editReply(`✅ **${typeLabel} créé**\n**${texte}**\n⏰ ${date} à ${time}`);

        } catch (error) {
            console.error('Erreur création rappel:', error);
            await interaction.editReply('❌ Erreur lors de la création du rappel');
        }
    }
};