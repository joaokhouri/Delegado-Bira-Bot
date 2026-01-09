const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        // =======================================================
        // 1. DETECÇÃO AUTOMÁTICA DO CANAL
        // =======================================================
        // O bot procura o primeiro canal que tiver um desses nomes
        const canaisPossiveis = ['boas-vindas'];
        
        const channel = member.guild.channels.cache.find(ch => canaisPossiveis.includes(ch.name));

        // Se não achar nenhum canal compatível, ele cancela e não faz nada
        if (!channel) return;

        // =======================================================
        // 2. FRASES DO BIRA (ESTILO "RECEPCIONISTA")
        // =======================================================

        // Lista de possíveis títulos para o Embed
        const welcomeTitles = [
            `CHEGOU REFORÇO NA ÁREA!`,
            `ABRE O PORTÃO QUE CHEGOU GENTE NOVA!`,
            `MAIS UM PRA QUADRILHA!`,
            `OLHA QUEM TÁ CHEGANDO NO PEDAÇO!`,
        ];

        // Lista de possíveis frases de boas-vindas na descrição
        const welcomeMessages = [
            `O portão tava aberto e o cidadão(ã) resolveu colar. Seja bem-vindo(a)!`,
            `Acabei de checar a identidade na portaria e tá tudo certo. Pode entrar!`,
            `O patrão mandou receber bem, então sinta-se em casa. Pode chegar.`,
            `Mais uma alma pra firma. Fica à vontade, campeão(ã)!`,
            `Trouxe o documento? Brincadeira, aqui é casa da mãe Joana (mentira, tem regras).`,
        ];

        // Sorteia um título e uma mensagem
        const randomTitle = welcomeTitles[Math.floor(Math.random() * welcomeTitles.length)];
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        // =======================================================
        // 3. MONTAGEM DO EMBED
        // =======================================================
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00') // Verde para boas-vindas
            .setTitle(randomTitle)
            .setAuthor({ 
                name: `Recado do Bira da Guarita`, 
                iconURL: member.client.user.displayAvatarURL() 
            })
            .setDescription(randomMessage)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                {
                    name: 'Primeira Parada',
                    value: 'Dá uma lida no canal de `#regras` (ou onde estiverem as leis) pra não levar uma dura depois.',
                },
                {
                    name: 'Total de Membros',
                    value: `Agora somos **${member.guild.memberCount}** na resenha!`,
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Qualquer problema, chama o Bira.' });

        // A mensagem principal menciona o usuário (para ele ver a notificação)
        const mainMessage = {
            content: `E aí, ${member}, tranquilo? Seja bem-vindo(a)!`,
            embeds: [welcomeEmbed],
        };

        // =======================================================
        // 4. ENVIO
        // =======================================================
        try {
            await channel.send(mainMessage);
        } catch (error) {
            console.error('Erro ao enviar a mensagem de boas-vindas:', error);
        }
    },
};