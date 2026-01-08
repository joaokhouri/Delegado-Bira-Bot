const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra a ficha técnica de um usuário (Restrito a Staff)')
        .addUserOption(option => option.setName('usuario').setDescription('De quem?'))
        // Define permissão padrão: Apenas quem pode MODERAR MEMBROS (Mods/Admins)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        // Pega o usuário mencionado OU quem usou o comando
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        // Tenta buscar o membro no servidor para pegar cargos e data de entrada
        let targetMember;
        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (e) {
            return interaction.reply({ content: '❌ Esse usuário não está mais no servidor, só consigo ver o ID dele.', ephemeral: true });
        }

        // Formata as datas para o padrão brasileiro
        const dataConta = targetUser.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        const dataEntrada = targetMember.joinedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

        // Lista de cargos (Remove o @everyone que sempre vem junto)
        const cargos = targetMember.roles.cache
            .filter(r => r.name !== '@everyone')
            .map(r => r)
            .join(' ') || 'Nenhum cargo';

        const embed = new EmbedBuilder()
            .setColor(targetMember.displayHexColor === '#000000' ? '#ffffff' : targetMember.displayHexColor)
            .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL() })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 ID do Usuário', value: targetUser.id, inline: true },
                { name: '🏷️ Apelido', value: targetMember.nickname || 'Nenhum', inline: true },
                { name: '📅 Criou a conta em', value: dataConta, inline: false },
                { name: '📥 Entrou no servidor em', value: dataEntrada, inline: false },
                { name: '💼 Cargos', value: cargos, inline: false }
            )
            .setFooter({ text: 'Portaria do Bira • Ficha Técnica Confidencial' });

        // Resposta Ephemeral (Só você vê)
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};