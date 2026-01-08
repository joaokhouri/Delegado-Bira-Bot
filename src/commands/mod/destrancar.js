const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destrancar')
        .setDescription('Libera o chat para todos falarem novamente')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

        const embed = new EmbedBuilder().setColor(0x00FF00).setTitle('🔓 Canal Destrancado').setDescription('Podem voltar a falar, o perigo passou.').setFooter({ text: 'Portaria do Bira • Lockdown' });
        await interaction.reply({ embeds: [embed] });

        logEvento(interaction.client, interaction.guild, 'Lockdown Encerrado', '🔓 Canal Aberto', `O canal ${interaction.channel} foi destrancado por ${interaction.user.tag}.`, [], 0x00FF00);
    },
};