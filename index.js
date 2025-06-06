const { Client, GatewayIntentBits, Collection, Events, messageLink} = require('discord.js');
const fs = require('node:fs');
const { token } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
const http = require('http');
const { encrypt, decrypt } = require('./crypto-utils');
const { loadIpConfig } = require('./ipManager');
const { sendRequestToServer } = require('./sendToPlugin');


client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erreur lors de l’exécution de la commande.', ephemeral: true });
    }
});

let { allowedChannels, encryptedIps } = loadIpConfig();

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const username = message.author.username;
    const serverId = message.guildId;
    const channelId = message.channel.id;

    const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

    if (!allowedChannels.has(serverId)) return;
    if (allowedChannels.get(serverId) !== channelId) return;

    sendRequestToServer(serverId, encryptedIps, {name: `${capitalizedUsername}`, message: message.content });
});

client.login(token);

// ⬇️ Ecoute les messages depuis un processus externe
const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            try {
                const data = JSON.parse(body);
                const guildId = data.serverId;
                const channelId = data.channelId;

                const guild = await client.guilds.fetch(guildId);
                const channel = await guild.channels.fetch(channelId);

                let jsonParsed = { Server: [] };

                if (fs.existsSync('./ip.json')) {
                    const json = fs.readFileSync('./ip.json', 'utf-8');
                    jsonParsed = JSON.parse(json);
                } else {
                    ensureIpJsonExists();
                    const json = fs.readFileSync('./ip.json', 'utf-8');
                    jsonParsed = JSON.parse(json);
                }

                const encryptedIp = encrypt(ip);

                const exists = jsonParsed.Server.some(entry =>
                    entry[guildId] && entry.Channel === channelId
                );

                if (!exists) {
                    jsonParsed.Server.push({
                        [guildId]: encryptedIp,
                        Channel: channelId
                    });

                    fs.writeFileSync('./ip.json', JSON.stringify(jsonParsed, null, 2), 'utf-8');
                }

                if (channel.isTextBased() && data.player !== 'Jishuashi') {
                    const filteredMessage = removeLinks(data.message);

                    if (containsAsciiArt(data.message)) {
                        await channel.send({
                            content: `${data.player} : 🚫 Message bloqué : probable ASCII art`,
                            allowedMentions: { parse: [] }
                        });
                        return;
                    }

                    await channel.send({
                        content: `${data.prefix ? cleanMinecraftPrefix(data.prefix) + ' ' : ''}${data.player} : ${filteredMessage}`,
                        allowedMentions: { parse: [] }
                    });
                    return;
                } else {
                    await channel.send({
                        content: `${data.prefix ? cleanMinecraftPrefix(data.prefix) + ' ' : ''}${data.player} : ${data.message}`,
                        allowedMentions: { parse: [] }
                    });
                    return;
                }

                res.writeHead(200);
                res.end('OK');
            } catch (err) {
                console.error('❌ Erreur JSON :', err.message);
                console.error('❌ Données reçues (malformées ?) :', body);
                res.writeHead(400);
                res.end('Bad Request - JSON invalide');
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});


server.listen(3000, () => {
    console.log('🌐 listener HTTP en écoute sur http://localhost:3000');
});

function removeLinks(message) {
    // Nettoyage des caractères invisibles
    const clean = message.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Expressions floues avec obfuscation volontaire
    const patterns = [
        /h(?:xx|tt)ps?:\/\/\S+/gi,
        /https?\s*[:\[\(]?\s*[\/\\]+\s*\S+/gi,
        /bit\s*(?:\.|\[dot\]|dot)\s*ly\s*[\/\\]?\s*\S+/gi,
        /discord\s*(?:\.|\[dot\]|dot)\s*gg\s*[\/\\]?\s*\S+/gi,
        /\bwww\s*(?:\.|\[dot\]|dot)\s*\S+/gi
    ];

    let result = clean;

    for (const pattern of patterns) {
        result = result.replace(pattern, '[Lien supprimé]');
    }

    return result;
}

function containsAsciiArt(message) {
    // Compte les caractères spéciaux "lourds"
    const count = (message.match(/[\u2580-\u259F\u28FF\u2B1B\u2B1C\u25A0-\u25FF\u2800-\u28FF\u2588⣿⣷⣶⣤⣄]/g) || []).length;
    return count >= 10; // seuil à ajuster
}

function cleanMinecraftPrefix(prefix) {
    if (!prefix) return "";

    // Supprime tous les codes couleurs de Minecraft : & + un caractère
    const cleaned = prefix.replace(/&[0-9a-fk-or]/gi, '');

    // Supprime les doubles crochets éventuels ou espaces inutiles
    return cleaned.trim();
}

function ensureIpJsonExists() {
    const path = './ip.json';

    if (!fs.existsSync(path)) {
        const defaultContent = {
            Server: []
        };

        fs.writeFileSync(path, JSON.stringify(defaultContent, null, 2), 'utf-8');
        console.log('🆕 Fichier ip.json créé.');
    } else {
        console.log('✅ ip.json déjà présent.');
    }
}




