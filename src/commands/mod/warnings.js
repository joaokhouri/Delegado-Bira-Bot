const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { getWarnings } = require('../../services/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Consulta o histórico de advertências de um membro')
        .addUserOption(option => option.setName('usuario').setDescription('Membro para consultar').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const lista = getWarnings(interaction.guild.id, usuario.id);

        if (!lista || lista.length === 0) {
            return interaction.reply({ content: `✅ A ficha de **${usuario.tag}** está limpa!`, flags: MessageFlags.Ephemeral });
        }

        const historico = lista.map((w, i) => `**${i+1}.** [${w.data}] ${w.motivo} *(por ${w.autor})*`).join('\n');

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`📜 Histórico: ${usuario.tag}`)
            .setDescription(historico)
            .setFooter({ text: `Total de avisos: ${lista.length}` });

        await interaction.reply({ embeds: [embed] });
    },
};