const express = require('express');
const GoogleCalendarService = require('../utils/google');
const Config = require('../models/Config');

const router = express.Router();

// Route de callback OAuth
router.get('/oauth/callback', async (req, res) => {
    try {
        const { code, state: guildId } = req.query;
        
        console.log('🔄 Callback OAuth reçu:');
        console.log('📧 Code:', code ? '✓ Présent' : '✗ Manquant');
        console.log('🏠 Guild ID:', guildId);

        if (!code) {
            return res.status(400).send('Code d\'autorisation manquant');
        }

        if (!guildId) {
            return res.status(400).send('State (guildId) manquant');
        }

        // Échanger le code contre des tokens
        const tokens = await GoogleCalendarService.getTokensFromCode(code);
        
        // Sauvegarder les tokens
        await GoogleCalendarService.saveTokens(guildId, tokens);

        console.log('✅ Authentification Google réussie pour guild:', guildId);

        // Page de succès avec code copiable
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentification Réussie - RappelBot</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        text-align: center; 
                        padding: 40px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .container {
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(15px);
                        max-width: 600px;
                        width: 90%;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    .success { 
                        color: #4CAF50; 
                        font-size: 60px; 
                        margin-bottom: 20px;
                    }
                    h1 {
                        margin: 0 0 20px 0;
                        font-size: 28px;
                    }
                    .message { 
                        margin: 15px 0; 
                        line-height: 1.6;
                        font-size: 16px;
                    }
                    .code-container {
                        background: rgba(0,0,0,0.2);
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .code-display {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        background: rgba(0,0,0,0.3);
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 15px;
                    }
                    .code-text {
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        letter-spacing: 1px;
                    }
                    .code-masked {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    .copy-btn {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    .copy-btn:hover {
                        background: #45a049;
                        transform: translateY(-2px);
                    }
                    .copy-btn.copied {
                        background: #2196F3;
                    }
                    .instructions {
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                        text-align: left;
                    }
                    .instructions ol {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .instructions li {
                        margin: 8px 0;
                    }
                    .discord-command {
                        background: rgba(88, 101, 242, 0.3);
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        margin: 5px 0;
                    }
                    .countdown {
                        margin-top: 25px;
                        font-size: 14px;
                        opacity: 0.8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅</div>
                    <h1>Authentification Réussie !</h1>
                    
                    <div class="message">
                        Votre compte Google Calendar a été lié avec succès à RappelBot.
                    </div>

                    <div class="code-container">
                        <h3>📋 Code d'authentification</h3>
                        <div class="code-display">
                            <div class="code-text">
                                <span class="code-masked">${code.substring(0, 15)}...</span>
                            </div>
                            <button class="copy-btn" onclick="copyCode()" id="copyButton">
                                📋 Copier
                            </button>
                        </div>
                        <div style="font-size: 12px; opacity: 0.7;">
                            Code partiellement masqué pour la sécurité
                        </div>
                    </div>

                    <div class="instructions">
                        <h4>📝 Prochaines étapes :</h4>
                        <ol>
                            <li><strong>Copiez le code</strong> ci-dessus (bouton 📋)</li>
                            <li><strong>Retournez sur Discord</strong></li>
                            <li><strong>Utilisez la commande :</strong>
                                <div class="discord-command">/auth code:[VOTRE_CODE]</div>
                            </li>
                            <li><strong>Remplacez</strong> <code>[VOTRE_CODE]</code> par le code copié</li>
                        </ol>
                    </div>

                    <div class="countdown">
                        🔄 Cette page se fermera automatiquement dans <span id="countdown">15</span> secondes...
                    </div>
                </div>

                <script>
                    // Fonction pour copier le code
                    function copyCode() {
                        const code = '${code}';
                        navigator.clipboard.writeText(code).then(() => {
                            const btn = document.getElementById('copyButton');
                            btn.innerHTML = '✅ Copié !';
                            btn.classList.add('copied');
                            setTimeout(() => {
                                btn.innerHTML = '📋 Copier';
                                btn.classList.remove('copied');
                            }, 2000);
                        }).catch(err => {
                            console.error('Erreur copie:', err);
                            alert('Erreur lors de la copie. Copiez manuellement: ' + code);
                        });
                    }

                    // Redirection automatique après 15 secondes
                    let countdown = 15;
                    const countdownElement = document.getElementById('countdown');
                    
                    const timer = setInterval(() => {
                        countdown--;
                        countdownElement.textContent = countdown;
                        
                        if (countdown <= 0) {
                            clearInterval(timer);
                            // Fermer la fenêtre ou rediriger
                            if (window.history.length > 1) {
                                window.close();
                            } else {
                                document.body.innerHTML = '<div class="container"><h2>✅ Authentification terminée</h2><p>Vous pouvez fermer cette fenêtre.</p></div>';
                            }
                        }
                    }, 1000);

                    // Copie automatique au chargement (optionnel)
                    setTimeout(() => {
                        copyCode();
                    }, 500);
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ Erreur callback OAuth:', error);
        
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erreur d'Authentification - RappelBot</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                        color: white;
                    }
                    .container {
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                    }
                    .error { color: #ffdd59; font-size: 48px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">❌</div>
                    <h1>Erreur d'Authentification</h1>
                    <p><strong>${error.message}</strong></p>
                    <p>Veuillez réessayer ou contacter l'administrateur.</p>
                    <p style="margin-top: 20px;">
                        <a href="/" style="color: #ffdd59; text-decoration: none;">
                            ← Retour à l'accueil
                        </a>
                    </p>
                </div>
            </body>
            </html>
        `);
    }
});

// ... reste du code (health, routes, etc.)

// Commande pour entrer manuellement le code
async function handleManualAuth(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // ✅ CORRECTION : GoogleCalendarService avec G majuscule
    const authUrl = GoogleCalendarService.generateAuthUrl(interaction.guildId);

    const embed = new EmbedBuilder()
        .setTitle('🔗 Connexion Google Calendar')
        .setDescription(`**Étapes à suivre :**

1. **Cliquez sur ce lien** pour autoriser l'accès :
   [🔗 Autoriser Google Calendar](${authUrl})

2. **Vous serez redirigé vers notre application**
3. **Copiez le code** depuis l'URL (paramètre \`code=...\`)
4. **Utilisez la commande** :
   \`/auth code:VOTRE_CODE\``)
        .setColor(0x4285F4)
        .setFooter({ text: 'Le code expire après 10 minutes' });

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    handleOAuthCode,
    handleManualAuth
};