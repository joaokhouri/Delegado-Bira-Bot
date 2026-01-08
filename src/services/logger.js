const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

const NOME_CANAL_LOGS = '⛔┃bira-logs';

async function logEvento(client, guild, tipo, titulo, descricao, campos = [], cor = 0xFFFFFF) {
    if (!guild) return;

    // 1. Busca ou Cria o Canal de Logs
    let canalLogs = guild.channels.cache.find(c => c.name === NOME_CANAL_LOGS);

    if (!canalLogs) {
        try {
            canalLogs = await guild.channels.create({
                name: NOME_CANAL_LOGS,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // Ninguém vê
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } // Bot vê
                    // Admins veem nativamente
                ],
            });
        } catch (erro) {
            console.error('❌ Falha ao criar canal de logs:', erro);
            return;
        }
    }

    // 2. Monta o Relatório
    const embed = new EmbedBuilder()
        .setColor(cor)
        .setTitle(titulo)
        .setDescription(descricao)
        .addFields(campos)
        .setFooter({ text: `Sistema de Logs do Bira • ${tipo}` })
        .setTimestamp();

    // 3. Envia
    canalLogs.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { logEvento };