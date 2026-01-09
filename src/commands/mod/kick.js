const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um membro do servidor')
        .addUserOption(option => option.setName('usuario').setDescription('Quem será expulso').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('O motivo'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const membro = interaction.options.getMember('usuario');
        const usuario = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo') ?? 'Sem motivo.';

        if (!membro) return interaction.reply({ content: 'Membro não encontrado.', flags: MessageFlags.Ephemeral });
        if (!membro.kickable) return interaction.reply({ content: '❌ Não posso expulsar esse membro (Cargo superior ao meu).', flags: MessageFlags.Ephemeral });

        await membro.kick(motivo);

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🥾 Expulsão')
            .setDescription(`**${usuario.tag}** foi convidado a se retirar.`)
            .addFields({ name: 'Motivo', value: motivo });

        await interaction.reply({ embeds: [embed] });

        await logEvento(interaction.client, interaction.guild, 'Expulsão', '🥾 Membro Kickado', 
            `Feito por ${interaction.user.tag}`, 
            [{ name: 'Alvo', value: usuario.tag }, { name: 'Motivo', value: motivo }], 
            0xFFA500
        );
    },
};