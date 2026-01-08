const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trancar')
        .setDescription('Bloqueia o chat para ninguém falar (Lockdown)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

        const embed = new EmbedBuilder().setColor(0xFF0000).setTitle('🔒 Canal Trancado').setDescription('Silêncio no tribunal! O Bira trancou a sala.').setFooter({ text: 'Portaria do Bira • Lockdown' });
        await interaction.reply({ embeds: [embed] });

        logEvento(interaction.client, interaction.guild, 'Lockdown', '🔒 Canal Trancado', `O canal ${interaction.channel} foi trancado por ${interaction.user.tag}.`, [], 0xFF0000);
    },
};