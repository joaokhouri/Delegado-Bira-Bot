const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('castigo')
        .setDescription('Aplica um castigo (Timeout/Mute)')
        .addUserOption(option => option.setName('usuario').setDescription('Quem fica de castigo').setRequired(true))
        .addIntegerOption(option => option.setName('minutos').setDescription('Tempo em minutos').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const membro = interaction.options.getMember('usuario');
        const usuario = interaction.options.getUser('usuario');
        const minutos = interaction.options.getInteger('minutos');
        const motivo = interaction.options.getString('motivo') ?? 'Sem motivo.';

        if (!membro.moderatable) return interaction.reply({ content: '❌ Não posso castigar este membro.', flags: MessageFlags.Ephemeral });

        await membro.timeout(minutos * 60 * 1000, motivo);

        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('🤐 Castigo Aplicado')
            .setDescription(`**${usuario.tag}** foi silenciado por **${minutos} minutos**.`)
            .addFields({ name: 'Motivo', value: motivo });

        await interaction.reply({ embeds: [embed] });

        await logEvento(interaction.client, interaction.guild, 'Timeout', '🤐 Castigo', 
            `Feito por ${interaction.user.tag}`, 
            [{ name: 'Alvo', value: usuario.tag }, { name: 'Tempo', value: `${minutos} min` }], 
            0xFFFF00
        );
    },
};