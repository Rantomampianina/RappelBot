const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GoogleCalendarService = require('../utils/google');

async function handleGoogleButton(interaction) {
    const { customId } = interaction;
    
    // ✅ CORRECTION : flags au lieu de ephemeral
    await interaction.deferReply({ flags: 64 });

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

        // Vérifier si l'utilisateur a déjà un token
        const Config = require('../models/Config');
        const config = await Config.findOne({ 
            guildId: interaction.guildId 
        });

        if (!config?.googleTokens) {
            const embed = new EmbedBuilder()
                .setTitle('🔐 Authentification Requise')
                .setDescription('Connectez-vous à Google Calendar pour créer des événements.')
                .setColor(0xFFA500);
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Connecter Google Calendar')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://votre-bot.onrender.com/auth?userId=${interaction.user.id}&guildId=${interaction.guildId}`),
                    new ButtonBuilder()
                        .setLabel('❌ Fermer')
                        .setCustomId('google_close')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            return await interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            });
        }

        // Créer un rappel temporaire
        const now = new Date();
        const rappel = {
            text: rappelText.replace(/\*\*/g, ''),
            date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
            time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            duration: 60,
            userId: interaction.user.id
        };

        try {
            // Essayer de créer directement via API
            const event = await GoogleCalendarService.createEvent(
                config.googleTokens,
                rappel
            );
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Événement créé !')
                .setDescription(`**${rappel.text}**\n📅 Ajouté à votre Google Calendar`)
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Lien', value: `[Ouvrir dans Google Calendar](${event.htmlLink})`, inline: true },
                    { name: 'Heure', value: `${rappel.time}`, inline: true }
                );
            
            await interaction.editReply({ 
                embeds: [embed] 
            });
            
        } catch (error) {
            console.error('Erreur création event API:', error);
            
            // Fallback: générer le lien manuel
            const googleUrl = GoogleCalendarService.generateQuickEventURL(rappel);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📅 Créer sur Google Calendar')
                        .setStyle(ButtonStyle.Link)
                        .setURL(googleUrl),
                    new ButtonBuilder()
                        .setLabel('🔄 Reconnecter')
                        .setCustomId('google_reconnect')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.editReply({
                content: `📅 **Google Calendar**\nCliquez pour créer votre événement :\n**${rappel.text}**\n\n⚠️ *Pour une intégration automatique, reconnectez-vous.*`,
                components: [row]
            });
        }

    } catch (error) {
        console.error('Erreur création Google event:', error);
        await interaction.editReply({ 
            content: '❌ Erreur création événement Google',
            flags: 64 
        });
    }
}

async function handleGoogleClose(interaction) {
    await interaction.deferUpdate();
    await interaction.message.delete().catch(() => {});
}

// Nouvelle fonction pour reconnecter
async function handleGoogleReconnect(interaction) {
    await interaction.deferReply({ flags: 64 });
    
    const Config = require('../models/Config');
    
    // Supprimer les anciens tokens
    await Config.findOneAndUpdate(
        { guildId: interaction.guildId },
        { $unset: { googleTokens: 1 } }
    );
    
    const embed = new EmbedBuilder()
        .setTitle('🔄 Réauthentification')
        .setDescription('Vos tokens ont été réinitialisés. Utilisez la commande `/auth start` pour vous reconnecter.')
        .setColor(0x00FFFF);
    
    await interaction.editReply({ 
        embeds: [embed] 
    });
}

module.exports = {
    handleGoogleButton,
    handleCreateGoogleEvent,
    handleGoogleClose,
    handleGoogleReconnect
};