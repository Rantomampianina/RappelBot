const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aide')
        .setDescription('Afficher toutes les commandes disponibles'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const embed = new EmbedBuilder()
                .setTitle('📚 Liste des commandes RappelBot')
                .setDescription('Voici toutes les commandes disponibles pour gérer vos rappels contextuels.')
                .setColor(0x5865F2)
                .addFields(
                    {
                        name: '🔔 /rappel',
                        value: '**Créer un rappel contextuel**\n' +
                            '• **Type:** Timer, Mention, Mot-clé, Réaction, Thread\n' +
                            '• **Exemples:**\n' +
                            '  - Timer: `dans 30m` | `dans 2h` | `dans 1j`\n' +
                            '  - Mention: `@utilisateur`\n' +
                            '  - Mot-clé: `"urgent"` | `keyword:"deadline"`\n' +
                            '  - Réaction: `emoji:✅ #canal`\n' +
                            '  - Thread: `ID du thread`',
                        inline: false
                    },
                    {
                        name: '📋 /liste',
                        value: '**Afficher vos rappels actifs**\n' +
                            'Liste tous vos rappels en cours avec leurs déclencheurs et IDs.',
                        inline: false
                    },
                    {
                        name: '🗑️ /supprimer',
                        value: '**Supprimer un rappel**\n' +
                            'Utilisez l\'ID du rappel obtenu avec `/liste` pour le supprimer.\n' +
                            'Exemple: `/supprimer id:rem_123456789_abc`',
                        inline: false
                    },
                    {
                        name: '⚙️ /config',
                        value: '**Voir la configuration et les statistiques**\n' +
                            'Affiche les stats du bot, le nombre de rappels par type, la mémoire utilisée, etc.',
                        inline: false
                    },
                    {
                        name: '❓ /aide',
                        value: '**Afficher cette aide**\n' +
                            'Affiche la liste de toutes les commandes disponibles.',
                        inline: false
                    }
                )
                .addFields({
                    name: '💡 Astuce',
                    value: 'Les rappels sont stockés en mémoire (RAM) et fonctionnent en temps réel. ' +
                        'Créez des rappels pour ne jamais manquer un événement important !',
                    inline: false
                })
                .setFooter({ text: 'RappelBot v2.0 - Rappels contextuels' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erreur commande aide:', error);
            await interaction.editReply('❌ Erreur lors de l\'affichage de l\'aide');
        }
    }
};
