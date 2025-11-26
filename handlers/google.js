const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GoogleCalendarService = require('../utils/google');

async function handleGoogleButton(interaction) {
    const { customId } = interaction;
    
    await interaction.deferReply({ ephemeral: true });

    try {
        if (customId.startsWith('create_google_')) {
            await handleCreateGoogleEvent(interaction);
            return;
        }

        await interaction.editReply('✅ Action Google traitée');
        
    } catch (error) {
        console.error('Erreur handler Google:', error);
        await interaction.editReply('❌ Erreur lors du traitement Google');
    }
}

async function handleCreateGoogleEvent(interaction) {
    try {
        const message = interaction.message;
        let rappelText = '';
        
        // Extraire le texte du rappel
        if (message.embeds.length > 0) {
            rappelText = message.embeds[0].description || '';
        } else {
            const textMatch = message.content.match(/\*\*(.*?)\*\*/);
            if (textMatch) rappelText = textMatch[1];
        }

        if (!rappelText) {
            rappelText = 'Rappel important';
        }

        // Créer un rappel temporaire
        const now = new Date();
        const rappel = {
            text: rappelText.replace(/\*\*/g, ''),
            date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
            time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            duration: 60
        };

        // Générer le lien Google
        const googleUrl = GoogleCalendarService.generateQuickEventURL(rappel);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📅 Créer sur Google Calendar')
                    .setStyle(ButtonStyle.Link)
                    .setURL(googleUrl)
            );

        await interaction.editReply({
            content: `📅 **Google Calendar**\nCliquez pour créer votre événement :\n**${rappel.text}**`,
            components: [row]
        });

    } catch (error) {
        console.error('Erreur création Google event:', error);
        await interaction.editReply('❌ Erreur création événement Google');
    }
}

async function handleGoogleClose(interaction) {
    await interaction.deferUpdate();
    await interaction.deleteReply();
}

module.exports = {
    handleGoogleButton,
    handleCreateGoogleEvent,
    handleGoogleClose
};