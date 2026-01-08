const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { logEvento } = require('../../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Passa a vassoura no chat (Apaga mensagens)')
        .addIntegerOption(option => option.setName('quantidade').setDescription('Número de mensagens (1-100)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const qtd = interaction.options.getInteger('quantidade');

        if (qtd < 1 || qtd > 100) return interaction.reply({ content: '❌ O limite é de 1 a 100 mensagens por vez.', flags: MessageFlags.Ephemeral });

        try {
            const apagadas = await interaction.channel.bulkDelete(qtd, true);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`🧹 **Faxina concluída!** O Bira varreu **${apagadas.size}** mensagens.`);

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

            await logEvento(interaction.client, interaction.guild, 'Limpeza de Chat', '🧹 Faxina', 
                `Realizada por ${interaction.user.tag} no canal ${interaction.channel}.`, 
                [{ name: 'Qtd Apagada', value: `${apagadas.size}` }], 
                0x00FF00
            );

        } catch (error) {
            interaction.reply({ content: '❌ Não consegui apagar mensagens antigas (mais de 14 dias).', flags: MessageFlags.Ephemeral });
        }
    },
};