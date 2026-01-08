const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Abre um pedido de desbanimento (Vai para votação no Tribunal)')
        .addStringOption(option => option.setName('id').setDescription('ID do usuário banido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Por que ele merece voltar?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const idAlvo = interaction.options.getString('id');
        const motivoAppeal = interaction.options.getString('motivo');

        await interaction.deferReply({ ephemeral: true });

        // 1. Verifica se o usuário está realmente banido
        let banInfo;
        try {
            banInfo = await interaction.guild.bans.fetch(idAlvo);
        } catch (e) {
            return interaction.editReply('❌ Esse ID não consta na lista de banidos ou é inválido.');
        }

        // 2. Busca o canal do tribunal
        // O canal DEVE ter "tribunal" no nome (ex: ⚖️┃tribunal)
        const canalTribunal = interaction.guild.channels.cache.find(c => c.name.includes('tribunal'));
        
        if (!canalTribunal) {
            return interaction.editReply('❌ Não achei o canal do tribunal. Crie um canal com "tribunal" no nome primeiro!');
        }

        // 3. Monta os Botões de Decisão
        const botoes = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`absolver_${idAlvo}`) // O ID vai escondido no botão
                    .setLabel('Aprovar Desbanimento')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🕊️'),
                new ButtonBuilder()
                    .setCustomId(`manter_${idAlvo}`)
                    .setLabel('Recusar Pedido')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔨')
            );

        // 4. Cria o Processo Público
        const embedProcesso = new EmbedBuilder()
            .setColor(0x5865F2) // Azul Discord
            .setTitle('⚖️ Pedido de Desbanimento')
            .setThumbnail(banInfo.user.displayAvatarURL() || null)
            .setDescription(`O Staff **${interaction.user.tag}** sugeriu desbanir este usuário.`)
            .addFields(
                { name: '👤 Réu', value: `${banInfo.user.tag} (ID: ${banInfo.user.id})`, inline: true },
                { name: '📜 Banido por', value: banInfo.reason || 'Motivo desconhecido', inline: true },
                { name: '🛡️ Justificativa para Voltar', value: motivoAppeal }
            )
            .setFooter({ text: 'Portaria do Bira • Análise da Staff' })
            .setTimestamp();

        // 5. Envia para o canal público da Staff
        await canalTribunal.send({ content: '@here 👨‍⚖️ Atenção Staff! Novo pedido de revisão.', embeds: [embedProcesso], components: [botoes] });

        await interaction.editReply(`✅ Processo nº ${idAlvo} aberto com sucesso no canal ${canalTribunal}!`);
    },
};