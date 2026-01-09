const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
// Importamos o sistema de logs aqui
const { logEvento } = require('../../services/logger'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('expulsar')
        .setDescription('Expulsa um membro do servidor (Kick)')
        .addUserOption(option => option.setName('usuario').setDescription('Quem vai rodar?').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Por qual motivo?').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo informado';
        
        // Tenta pegar o membro dentro do servidor
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({ content: '❌ Usuário não encontrado no servidor.', ephemeral: true });
        }
        
        // Proteção: Bira não pode chutar quem tem cargo maior que ele
        if (!member.kickable) {
            return interaction.reply({ content: '❌ Não consigo expulsar esse usuário. Verifique se o meu cargo está acima do dele!', ephemeral: true });
        }

        try {
            // 1. Executa a Expulsão
            await member.kick(reason);

            // 2. Manda a confirmação no chat onde o comando foi usado
            const embed = new EmbedBuilder()
                .setColor(0xE67E22) // Laranja escuro (Cor de alerta)
                .setTitle('👢 PORTA DA RUA É SERVENTIA DA CASA')
                .setDescription(`**${targetUser.tag}** foi convidado a se retirar.\n\n📝 **Motivo:** ${reason}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Autoridade: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // 3. REGISTRA NO CANAL DE LOGS (A parte que faltava!)
            // O logger vai procurar canais como 'logs-do-bira', 'logs', etc.
            logEvento(
                client,
                interaction.guild,
                'Moderação',           // Categoria
                '👢 Membro Expulso',   // Título do Log
                `**Infrator:** ${targetUser.tag} (${targetUser.id})\n**Staff:** ${interaction.user.tag}\n**Motivo:** ${reason}`, // Descrição
                [],                    // Campos extras (vazio)
                0xE67E22               // Cor Laranja
            );

        } catch (error) {
            console.error('Erro ao expulsar:', error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar expulsar.', ephemeral: true });
        }
    },
};