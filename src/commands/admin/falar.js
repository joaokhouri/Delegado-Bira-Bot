const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('falar')
        .setDescription('Faz o Bira falar algo no chat (Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Cria um Modal (Janela Pop-up) para digitar o texto
        const modal = new ModalBuilder()
            .setCustomId('modal_falar')
            .setTitle('O que o Bira vai falar?');

        const input = new TextInputBuilder()
            .setCustomId('texto_falar')
            .setLabel('Mensagem')
            .setStyle(TextInputStyle.Paragraph) // Caixa de texto grande
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};