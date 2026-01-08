const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,

    async execute(member) {
        // =======================================================
        // 1. DETECÇÃO AUTOMÁTICA DO CANAL
        // =======================================================
        // Procura canais com nomes comuns de saída
        const canaisPossiveis = ['saidas', 'despedida', 'tchau', 'boas-vindas', 'recepcao'];
        const goodbyeChannel = member.guild.channels.cache.find(ch => canaisPossiveis.includes(ch.name));

        if (!goodbyeChannel) return;

        // Espera 2 segundos para o Discord atualizar o Audit Log
        // (Isso é crucial, se for rápido demais o log de ban não aparece)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // =======================================================
        // 2. INVESTIGAÇÃO (SAIU, KICK OU BAN?)
        // =======================================================
        let departureType = 'self'; // Começamos assumindo que a saída foi voluntária
        let moderator = null;
        let auditReason = 'Não especificado';

        try {
            // Busca os últimos 5 registros de auditoria
            const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 5 });

            // Procura um Log de KICK recente (últimos 5 segundos) para esse usuário
            const kickLog = fetchedLogs.entries.find(
                (entry) =>
                    entry.action === AuditLogEvent.MemberKick &&
                    entry.target.id === member.id &&
                    Date.now() - entry.createdTimestamp < 5000
            );

            // Procura um Log de BAN recente
            const banLog = fetchedLogs.entries.find(
                (entry) =>
                    entry.action === AuditLogEvent.MemberBanAdd &&
                    entry.target.id === member.id &&
                    Date.now() - entry.createdTimestamp < 5000
            );

            // Prioridade: Ban > Kick > Saiu Sozinho
            if (banLog) {
                departureType = 'ban';
                moderator = banLog.executor;
                auditReason = banLog.reason || auditReason;
            } else if (kickLog) {
                departureType = 'kick';
                moderator = kickLog.executor;
                auditReason = kickLog.reason || auditReason;
            }

        } catch (error) {
            console.error('[Goodbye] Erro ao tentar buscar o registro de auditoria (Falta permissão?):', error);
        }

        // =======================================================
        // 3. FRASES DO BIRA (PERSONALIZADAS)
        // =======================================================
        const responses = {
            self: {
                color: '#FFA500', // Laranja
                title: 'ALGUEM PICOU A MULA E SAIU',
                status: [
                    'Até logo, até mais ver, bon voyage, arrivederci, até mais, adeus, boa viagem, vá em paz, que a porta bata onde o sol não bate... digo, até a próxima!',
                    'Anotado na prancheta: o indivíduo pediu as contas. A guarita sentirá sua falta... ou não.',
                    'Menos um pra eu ficar de olho. Bom, o portão tá aberto, né? Passar bem.',
                    'Ué, já vai? Nem se despediu do Bira? Fica aí o registro da baixa.',
                    'Seguiu seu rumo. Que encontre pastos mais verdes (ou não).',
                ],
            },
            kick: {
                color: '#FF4500', // Laranja-avermelhado
                title: 'BAIXA POR MAU COMPORTAMENTO',
                status: 'Foi **convidado(a) a se retirar** da área. O Bira abriu o portão na marra.',
            },
            ban: {
                color: '#FF0000', // Vermelho
                title: 'CPF CANCELADO NO TERREIRO',
                status: 'Foi **permanentemente banido(a)**. Esse não pisa mais aqui.',
            },
        };

        const responseData = responses[departureType];

        // Sorteia uma frase se for lista, ou pega a string direta
        const statusText = Array.isArray(responseData.status)
            ? responseData.status[Math.floor(Math.random() * responseData.status.length)]
            : responseData.status;

        // =======================================================
        // 4. MONTAGEM DO EMBED
        // =======================================================
        const goodbyeEmbed = new EmbedBuilder()
            .setColor(responseData.color)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setTitle(responseData.title)
            .setDescription(`${member.user} não faz mais parte da rapaziada.`)
            .addFields({ name: 'Status', value: statusText })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `ID do Usuário: ${member.id}` });

        // Se foi Kick ou Ban, adiciona quem fez e o motivo
        if (moderator) {
            goodbyeEmbed.addFields(
                { name: 'Ação por', value: `${moderator.tag}`, inline: true },
                { name: 'Motivo Registrado', value: `*${auditReason}*`, inline: true }
            );
        }

        await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
    },
};