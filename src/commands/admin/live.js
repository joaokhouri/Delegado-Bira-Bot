const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('live')
        .setDescription('Anuncia que a live começou (Comando do Patrão)')
        .addStringOption(option => option.setName('titulo').setDescription('Título da live').setRequired(true))
        .addStringOption(option => option.setName('jogo').setDescription('Qual o jogo/categoria?').setRequired(true))
        .addStringOption(option => option.setName('link').setDescription('Link da Twitch/Youtube').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Opções
        const titulo = interaction.options.getString('titulo');
        const jogo = interaction.options.getString('jogo');
        // Se não colocar link, usa um padrão (troque pelo seu canal)
        const link = interaction.options.getString('link') || 'https://www.twitch.tv/khouri_';

        // Canal onde o aviso será postado (procure por 'divulgacao', 'avisos', 'live-on')
        const canaisPossiveis = ['avisos', 'anuncios', 'divulgacao', 'lives', 'geral'];
        const canalDivulgacao = interaction.guild.channels.cache.find(c => canaisPossiveis.includes(c.name));

        if (!canalDivulgacao) {
            return interaction.reply({ content: '❌ Não achei um canal de `#avisos` ou `#lives` para postar.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x9146FF) // Roxo da Twitch
            .setTitle(`🔴 O PATRÃO TÁ ON!`)
            .setURL(link)
            .setDescription(`**${titulo}**\n\nO portão tá aberto e o show vai começar. Chega mais!`)
            .addFields(
                { name: '🎮 Categoria', value: jogo, inline: true },
                { name: '🔗 Link', value: `[Clique para Assistir](${link})`, inline: true }
            )
            .setImage('https://media.giphy.com/media/L0O3TQpp0WnSXmxV8p/giphy.gif') // GIF "On Air" ou "Live" (pode trocar)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Portaria do Bira • Transmissão Iniciada' })
            .setTimestamp();

        // Envia o aviso mencionando @everyone (Cuidado: use com sabedoria)
        // Se não quiser marcar everyone, tire o content.
        await canalDivulgacao.send({ content: '@everyone 📢 **A LIVE COMEÇOU!**', embeds: [embed] });

        await interaction.reply({ content: `✅ Aviso de live postado em ${canalDivulgacao}!`, flags: MessageFlags.Ephemeral });
    },
};