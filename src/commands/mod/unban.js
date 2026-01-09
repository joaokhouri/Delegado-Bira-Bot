const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Inicia uma sessão do Tribunal para desbanir alguém')
        .addStringOption(option => option.setName('id').setDescription('O ID do usuário banido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Por que ele merece perdão?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, client) {
        const userId = interaction.options.getString('id');
        const motivo = interaction.options.getString('motivo');

        // 1. Verificar se o cara está realmente banido antes de abrir o tribunal
        try {
            await interaction.guild.bans.fetch(userId);
        } catch (error) {
            return interaction.reply({ content: '❌ Esse ID não consta na lista de banidos (ou é inválido).', ephemeral: true });
        }

        // 2. Monta a "Ficha do Réu" (O Embed do Tribunal)
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F) // Dourado (Cor da Justiça)
            .setTitle('⚖️ SESSÃO DO TRIBUNAL INICIADA')
            .setDescription(`O Excelentíssimo **${interaction.user.tag}** convocou uma audiência de revisão de pena.`)
            .addFields(
                { name: '👤 Réu (ID)', value: userId, inline: true },
                { name: '🛡️ Advogado', value: interaction.user.tag, inline: true },
                { name: '📝 Alegação da Defesa', value: motivo }
            )
            .setThumbnail('https://media.giphy.com/media/l0HlO3BJ8LAL5j1vx6/giphy.gif') // Martelo do Juiz
            .setFooter({ text: 'A decisão da Staff é soberana.' })
            .setTimestamp();

        // 3. Cria os Botões de Veredito
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`absolver_${userId}`) // Passa o ID pro interactionCreate desbanir
                    .setLabel('ABSOLVER (Unban)')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🕊️'),
                
                new ButtonBuilder()
                    .setCustomId(`manter_${userId}`) // Apenas cancela o embed
                    .setLabel('MANTER PENA')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        // Envia o processo para o chat
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};