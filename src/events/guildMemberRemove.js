const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        // Ignora se o bot estiver saindo (pra não bugar)
        if (member.id === client.user.id) return;

        // Procura o canal de saída (saiu-fora, saida, despedida)
        const channel = member.guild.channels.cache.find(ch => 
            ['saiu-fora', 'saida', 'despedidas', 'tchau'].includes(ch.name)
        );

        if (!channel) return;

        // --- INVESTIGAÇÃO CSI ---
        // Vamos olhar os logs de auditoria pra ver se teve Kick ou Ban recente (últimos 5 seg)
        let razaoSaida = 'saiu por conta própria.';
        let corEmbed = 0xFFA500; // Laranja (Padrão)
        let titulo = '👋 Bateu o sino';
        let executor = null;

        try {
            // Busca o último Kick
            const fetchedKickLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberKick,
            });
            const kickLog = fetchedKickLogs.entries.first();

            // Busca o último Ban
            const fetchedBanLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            const banLog = fetchedBanLogs.entries.first();

            const now = Date.now();

            // Verifica se foi BANIDO (Se o log de ban for muito recente e bater o ID)
            if (banLog && banLog.target.id === member.id && (now - banLog.createdTimestamp < 5000)) {
                razaoSaida = 'foi BANIDO pelo síndico.';
                corEmbed = 0xFF0000; // Vermelho
                titulo = '🚫 CPF Cancelado';
                executor = banLog.executor;
            } 
            // Verifica se foi EXPULSO (Kick)
            else if (kickLog && kickLog.target.id === member.id && (now - kickLog.createdTimestamp < 5000)) {
                razaoSaida = 'foi EXPULSO da portaria.';
                corEmbed = 0xE67E22; // Laranja Escuro
                titulo = '👢 Convite pra Sair';
                executor = kickLog.executor;
            }

        } catch (error) {
            console.error('Erro ao verificar logs de auditoria:', error);
        }

        // --- Monta a mensagem ---
        const embed = new EmbedBuilder()
            .setColor(corEmbed)
            .setAuthor({ name: titulo, iconURL: member.user.displayAvatarURL() })
            .setDescription(`**${member.user.tag}** ${razaoSaida}`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp();

        // Se tivermos o culpado (quem baniu/kickou), adicionamos no embed
        if (executor) {
            embed.addFields({ name: 'Responsável pela ação:', value: executor.tag });
        } else {
            embed.addFields({ name: 'Situação:', value: 'Saiu voluntariamente (ou pediu as contas).' });
        }

        channel.send({ embeds: [embed] });
    },
};