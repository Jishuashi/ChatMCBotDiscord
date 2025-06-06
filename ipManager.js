const fs = require('fs');
const { decrypt } = require('./crypto-utils');

function loadIpConfig() {
    const allowedChannels = new Map();
    const encryptedIps = new Map();

    if (fs.existsSync('./ip.json')) {
        const data = JSON.parse(fs.readFileSync('./ip.json', 'utf-8'));
        for (const entry of data.Server) {
            const serverId = Object.keys(entry).find(k => k !== 'Channel');
            if (serverId && entry.Channel) {
                allowedChannels.set(serverId, entry.Channel);
                encryptedIps.set(serverId, entry[serverId]); // IP chiffrée
            }
        }
    }

    return { allowedChannels, encryptedIps };
}

module.exports = { loadIpConfig };
