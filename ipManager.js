const fs = require('fs');
const { decrypt } = require('./crypto-utils');

function loadIpConfig() {
    const allowedChannels = new Map();
    const encryptedIps = new Map();

    const ipJsonPath = './ip.json';

    // Si le fichier existe mais est un dossier → erreur
    if (fs.existsSync(ipJsonPath) && fs.lstatSync(ipJsonPath).isDirectory()) {
        throw new Error("🚫 ERREUR : 'ip.json' est un dossier. Supprime-le manuellement.");
    }

    // Si le fichier n'existe pas → le créer vide
    if (!fs.existsSync(ipJsonPath)) {
        fs.writeFileSync(ipJsonPath, JSON.stringify({ Server: [] }, null, 2), 'utf-8');
        console.log('[BOT] ip.json créé automatiquement.');
    }

    // Lecture et parsing du fichier ip.json
    const data = JSON.parse(fs.readFileSync(ipJsonPath, 'utf-8'));
    for (const entry of data.Server) {
        const serverId = Object.keys(entry).find(k => k !== 'Channel');
        if (serverId && entry.Channel) {
            allowedChannels.set(serverId, entry.Channel);
            encryptedIps.set(serverId, entry[serverId]); // IP chiffrée
        }
    }

    return { allowedChannels, encryptedIps };
}

module.exports = { loadIpConfig };
