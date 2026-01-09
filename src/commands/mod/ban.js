const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../../services/logger'); // <--- Importando Logger

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banir')
        .setDescription('Bane um usuário do servidor (Marreta do Bira)')
        .addUserOption(option => option.setName('usuario').setDescription('Quem vai rodar?').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Por qual motivo?').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo informado';

        const member = interaction.guild.members.cache.get(targetUser.id);
        
        // Proteção hierárquica (se o membro estiver no server)
        if (member && !member.bannable) {
            return interaction.reply({ content: '❌ Não consigo banir esse usuário. Verifique se meu cargo é maior que o dele.', ephemeral: true });
        }

        try {
            // 1. Aplica o Banimento
            await interaction.guild.members.ban(targetUser, { reason: reason });

            // 2. Avisa no chat
            const embed = new EmbedBuilder()
                .setColor(0x8B0000) // Vermelho Sangue
                .setTitle('🚫 CPF CANCELADO')
                .setDescription(`**${targetUser.tag}** foi banido permanentemente.\n\n📝 **Motivo:** ${reason}`)
                .setThumbnail('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif') // GIF do martelo (opcional)
                .setFooter({ text: `Juiz: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // 3. Registra no Log (O X-9)
            logEvento(
                client,
                interaction.guild,
                'Moderação',
                '🚫 Membro Banido',
                `**Infrator:** ${targetUser.tag} (${targetUser.id})\n**Staff:** ${interaction.user.tag}\n**Motivo:** ${reason}`,
                [],
                0x8B0000
            );

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao tentar banir.', ephemeral: true });
        }
    },
};