const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { InteractionResponseType, MessageFlags } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = path.resolve(__dirname, '../ip.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel-set')
        .setDescription('Définit ce salon comme canal de réception des messages du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // autorisé aux admins

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;

        let config = {};
        if (fs.existsSync(CONFIG_PATH)) {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        }

        config[guildId] = channelId;
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));


        await interaction.reply({
            content: '✅ Ce salon est défini.',
            flags: 1 << 6 // équivalent à `MessageFlags.Ephemeral`
        });

    }
};

