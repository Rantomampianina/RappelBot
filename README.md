# 🤖 RappelBot v2.0

Bot Discord de **rappels contextuels** - Simple, efficace, sans base de données.

## 🎯 Philosophie

RappelBot v2.0 adopte une approche **contextuelle** basée sur les événements Discord natifs :
- ✅ Pas de dates/heures complexes
- ✅ Déclencheurs contextuels (réactions, mentions, mots-clés, threads)
- ✅ Stockage en mémoire RAM (ultra-rapide)
- ✅ Architecture simplifiée et maintenable

## 📋 Types de rappels supportés

### ⏰ Timer (Temporisé)
Rappel après un délai relatif simple.
```
/rappel type:timer trigger:"dans 30m" message:"Pause café"
/rappel type:timer trigger:"dans 2h" message:"Réunion client"
```

### 👤 Mention
Déclenché quand un utilisateur est mentionné.
```
/rappel type:mention trigger:"@user" message:"Envoyer le document"
```

### 🔑 Mot-clé
Déclenché quand un mot-clé apparaît dans le chat.
```
/rappel type:keyword trigger:"urgent" message:"Traiter en priorité"
```

### 😊 Réaction
Déclenché par une réaction emoji spécifique.
```
/rappel type:reaction trigger:"emoji:✅ #general" message:"Task complétée"
```

### 💬 Thread
Déclenché sur activité dans un thread spécifique.
```
/rappel type:thread trigger:"123456789" message:"Follow-up client"
```

## 🚀 Installation

### Prérequis
- Node.js >= 18.0.0
- Discord Bot Token
- Discord Application ID

### Configuration

1. **Cloner et installer les dépendances**
```bash
cd server
npm install
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env` dans `/server` :
```env
TOKEN=votre_token_discord
CLIENT_ID=votre_client_id
PORT=3000
```

3. **Démarrer le bot**
```bash
npm start
```

## 📡 API Monitoring

Le bot expose une API REST pour le monitoring :

### Endpoints disponibles

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check du service |
| `GET /api/status` | Statut général du bot |
| `GET /api/bot/stats` | Statistiques détaillées |
| `GET /api/bot/guilds` | Liste des serveurs Discord |
| `GET /api/ping` | Test de latence |

### Exemple de réponse `/api/bot/stats`
```json
{
  "status": "online",
  "uptime": 12345,
  "botUptime": 12000,
  "guilds": 5,
  "users": 150,
  "commands": 5,
  "reminders": {
    "total": 25,
    "active": 20,
    "users": 15,
    "guilds": 4,
    "byType": {
      "timer": 10,
      "mention": 5,
      "keyword": 3,
      "reaction": 2,
      "thread": 0
    }
  },
  "memory": {
    "used": 45,
    "total": 100
  }
}
```

## 🎮 Commandes Discord

| Commande | Description |
|----------|-------------|
| `/rappel` | Créer un nouveau rappel contextuel |
| `/liste` | Afficher vos rappels actifs |
| `/supprimer` | Supprimer un rappel par ID |
| `/config` | Voir les statistiques du bot |
| `/test` | Tester le bot |

## 💾 Stockage

**Mode : RAM (In-Memory)**

- Les rappels sont stockés en mémoire vive
- Pas de base de données externe
- Ultra-rapide, latence minimale
- Les données sont perdues au redémarrage

### Export/Import (optionnel futur)

Le système supporte l'export/import JSON pour sauvegardes manuelles :
```javascript
const { exportToJSON, importFromJSON } = require('./store/reminders');

// Export
const data = exportToJSON();
fs.writeFileSync('backup.json', JSON.stringify(data));

// Import
const data = JSON.parse(fs.readFileSync('backup.json'));
importFromJSON(data);
```

## 📊 Dashboard Web

Interface React pour le monitoring (pas de gestion utilisateur).

**Fonctionnalités :**
- 📈 Nombre de serveurs Discord
- ⏱️ Uptime et latence
- 💾 Utilisation mémoire
- 📋 Statistiques des rappels
- 🏠 Liste des serveurs

**Accès :** https://rappelbot.vercel.app

## 🏗️ Architecture

```
server/
├── commands/          # Commandes Discord
│   ├── rappel.js      # Créer rappel
│   ├── liste.js       # Lister rappels
│   ├── supprimer.js   # Supprimer rappel
│   ├── config.js      # Stats/config
│   └── test.js        # Test
├── handlers/
│   ├── events.js      # Event listeners Discord
│   └── interaction.js # Gestion interactions
├── store/
│   └── reminders.js   # Stockage RAM
├── utils/
│   └── context.js     # Parsers contextuels
└── index.js           # Bot + API Express
```

## 🔧 Développement

### Mode développement
```bash
npm run dev
```

### Enregistrer les commandes
```bash
npm run register
```

### Logs
Le bot affiche des logs détaillés dans la console :
- ✅ Succès (vert)
- ❌ Erreurs (rouge)
- 🔔 Rappels déclenchés
- 📊 Monitoring périodique

## 🛡️ Limitations

- **Pas de persistance** : Données perdues au redémarrage
- **RAM limitée** :适合 petits/moyens bots (< 10k rappels)
- **Pas d'historique** : Pas de traçabilité long terme

### Mitigation
- Export JSON périodique automatisé (futur)
- Migration vers Redis si scalabilité nécessaire
- Logs simples pour debug

## 🔮 Roadmap

### v2.1
- [ ] Export JSON automatique périodique
- [ ] Commande `/export` et `/import`
- [ ] Statistiques avancées par serveur

### v2.2
- [ ] Support Redis (optionnel)
- [ ] Webhooks de notification
- [ ] Rappels récurrents avancés

### v3.0
- [ ] Multi-instance avec Redis
- [ ] Dashboard temps réel (WebSocket)
- [ ] Analytics avancés

## 📝 License

MIT © Ranto

## 🤝 Support

Pour toute question ou problème :
1. Vérifier la console pour les logs
2. Tester avec `/config` pour voir l'état du bot
3. Vérifier que le bot a les permissions nécessaires

---

**RappelBot v2.0** - Rappels contextuels Discord simplifiés 🚀
