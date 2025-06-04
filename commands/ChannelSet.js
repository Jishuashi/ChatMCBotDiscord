const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel-set')
        .setDescription('Use this channel for the Minecraft Chat'),
    async execute(interaction)   {
        interaction.reply(`Le channel pour le chat minecraft est ${interaction.channel.name}`);

        const id = {"id" : `${interaction.channel.id}`};

        fs.re
    },
};
