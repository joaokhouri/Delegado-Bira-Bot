const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('Envia uma ideia para votação no canal de sugestões')
        .addStringOption(option => 
            option.setName('conteudo')
                .setDescription('Qual é a sua ideia brilhante?')
                .setRequired(true)
        ),

    async execute(interaction) {
        const conteudo = interaction.options.getString('conteudo');
        const autor = interaction.user;

        // 1. Procura o canal de sugestões
        // O canal DEVE se chamar 'sugestoes' (ou contenha essa palavra)
        const canalSugestoes = interaction.guild.channels.cache.find(c => c.name.includes('sugestões'));

        if (!canalSugestoes) {
            return interaction.reply({ 
                content: '❌ Não encontrei o canal de `#sugestoes`. Avise a administração!', 
                ephemeral: true 
            });
        }

        // 2. Monta o Embed
        const embed = new EmbedBuilder()
            .setColor(0xFFA500) // Laranja
            .setTitle('💡 Nova Sugestão')
            .setThumbnail(autor.displayAvatarURL())
            .setDescription(conteudo)
            .addFields(
                { name: '👤 Sugerido por', value: `${autor}`, inline: true },
                { name: '📊 Status', value: 'Em votação', inline: true }
            )
            .setFooter({ text: 'Portaria do Bira • Vote com as reações abaixo' })
            .setTimestamp();

        // 3. Envia e Reage
        try {
            const mensagem = await canalSugestoes.send({ embeds: [embed] });
            await mensagem.react('👍');
            await mensagem.react('👎');

            await interaction.reply({ 
                content: `✅ Sua sugestão foi enviada para o ${canalSugestoes}!`, 
                ephemeral: true 
            });
        } catch (erro) {
            console.error(erro);
            await interaction.reply({ 
                content: '❌ Erro ao enviar sugestão. Verifique se tenho permissão de ver e escrever naquele canal.', 
                flags: MessageFlags.Ephemeral
            });
        }
    },
};