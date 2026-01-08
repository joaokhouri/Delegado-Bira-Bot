const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { adicionarWarn } = require('../../services/database');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aplica uma advertência formal (Salva na ficha)')
        .addUserOption(option => option.setName('usuario').setDescription('O infrator').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo da bronca').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo');

        // 1. Salva no Banco de Dados
        const warn = adicionarWarn(interaction.guild.id, usuario.id, motivo, interaction.user.tag);

        // 2. Tenta avisar no PV (DM)
        let dmStatus = '✅ Enviada';
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle(`⚠️ Advertência em ${interaction.guild.name}`)
                .setDescription(`Você recebeu um aviso. Fique atento às regras!`)
                .addFields({ name: 'Motivo', value: motivo });
            await usuario.send({ embeds: [dmEmbed] });
        } catch (e) {
            dmStatus = '❌ PV Fechado';
        }

        // 3. Responde no Chat
        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('⚠️ Advertência Aplicada')
            .setDescription(`**${usuario.tag}** foi advertido.`)
            .addFields(
                { name: 'Motivo', value: motivo },
                { name: 'ID', value: warn.id, inline: true },
                { name: 'DM', value: dmStatus, inline: true }
            )
            .setFooter({ text: 'Portaria do Bira • Moderação' });

        await interaction.reply({ embeds: [embed] });

        // 4. Log
        await logEvento(interaction.client, interaction.guild, 'Advertência', '⚠️ Warn Aplicado', 
            `Aplicado por ${interaction.user.tag}`, 
            [{ name: 'Alvo', value: usuario.tag }, { name: 'Motivo', value: motivo }], 
            0xFFFF00
        );
    },
};