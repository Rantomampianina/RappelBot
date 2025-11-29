#!/bin/bash
echo "🚀 Démarrage automatique de RappelBot..."

# Attendre que Codespaces soit complètement initialisé
sleep 5

# Démarrer le bot
echo "🤖 Lancement du bot Discord..."
npm start &

# Afficher l'URL
echo "✅ RappelBot est maintenant en ligne!"
echo "🌐 Votre URL: https://${CODESPACE_NAME}-3000.app.github.dev"
echo "📊 Health: https://${CODESPACE_NAME}-3000.app.github.dev/health"
echo "🔗 OAuth: https://${CODESPACE_NAME}-3000.app.github.dev/auth"

# Garder le script actif
echo "🔄 Codespace actif - Bot en fonctionnement..."
while true; do
    sleep 300
    echo "💚 Toujours actif - $(date)"
done