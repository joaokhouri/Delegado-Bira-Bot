const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banir')
        .setDescription('Bane um usuário permanentemente')
        .addUserOption(option => option.setName('usuario').setDescription('Quem será banido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('O motivo'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo') ?? 'Sem motivo.';

        try {
            await interaction.guild.members.ban(usuario, { reason: motivo });

            const embed = new EmbedBuilder()
                .setColor(0x8B0000)
                .setTitle('🔨 Banimento')
                .setDescription(`**${usuario.tag}** sentiu o peso do martelo.`)
                .addFields({ name: 'Motivo', value: motivo });

            await interaction.reply({ embeds: [embed] });

            await logEvento(interaction.client, interaction.guild, 'Banimento', '🔨 Usuário Banido', 
                `Feito por ${interaction.user.tag}`, 
                [{ name: 'Alvo', value: usuario.tag }, { name: 'Motivo', value: motivo }], 
                0x8B0000
            );
        } catch (error) {
            interaction.reply({ content: '❌ Erro ao banir. Verifique os cargos.', flags: MessageFlags.Ephemeral });
        }
    },
};