# ChatMCBotDiscord

Un bot Discord connecté à un serveur Minecraft (PaperMC) via HTTP, permettant d’échanger des messages entre le chat Minecraft et un salon Discord.

## 🔧 Fonctionnalités

- 🔁 Synchro bidirectionnelle du chat :
  - Depuis Minecraft vers Discord
  - Depuis Discord vers Minecraft
- 🔐 IP chiffrées dans `ip.json` (AES-256-CBC)
- ⚙️ Configuration par `.env` et fichiers JSON/YAML
- 🔗 Plugin Minecraft PaperMC compatible LuckPerms

## 📁 Structure

├── index.js # Fichier principal du bot Discord
├── cryptoUtils.js # Fonctions encrypt/decrypt AES
├── ipManager.js # Gestion des IP et channels liés
├── sendRequestToServer.js # Envoi des messages au plugin Minecraft
├── .env # Variables sensibles (token bot, clé AES)
├── ip.json # IP chiffrées et mapping serveur/channel
└── plugin/ChatDiscord/ # Plugin PaperMC Java


## 🛠️ Installation

### 1. Préparer le bot Discord

- Crée un bot sur [Discord Developer Portal](https://discord.com/developers/applications)
- Active les intents : `MESSAGE CONTENT`, `GUILD MESSAGES`
- Copie le token dans un fichier `.env` :

```env
DISCORD_TOKEN=ton_token
AES_KEY=ta_cle_base64
AES_IV=ton_iv_base64
```

###🔌 Fonctionnement
Le plugin ChatDiscord écoute sur le port 4001 pour recevoir les messages de Discord, et envoie les messages Minecraft vers l’URL définie dans config.yml.
[github](https://github.com/Jishuashi/DiscordChat)

##🧾 Exemple de config.yml côté plugin :
```yaml
Copier
Modifier
server-id: "123456789012345678"
channel-id: "987654321098765432"
target-url: "http://127.0.0.1:4000/mc-endpoint"
```
🤝 Auteurs
🧑‍💻 @Jishuashi


