const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../services/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        
        // --- TIPO 1: COMANDOS DE BARRA (/unban, /warn...) ---
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const msg = { content: '🤯 Erro interno no comando.', ephemeral: true };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
                else await interaction.reply(msg);
            }
            return;
        }

        // --- TIPO 2: BOTÕES DO TRIBUNAL ---
        if (interaction.isButton()) {
            // Verifica se quem clicou é da Staff (Ban Members)
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: '🚫 Sai daí, curioso! Só a Staff pode votar.', ephemeral: true });
            }

            const [acao, idAlvo] = interaction.customId.split('_'); // Separa 'absolver' de '123456'

            // --- OPÇÃO A: ABSOLVER (DESBANIR) ---
            if (acao === 'absolver') {
                try {
                    // Executa o Unban Real
                    await interaction.guild.members.unban(idAlvo, `Aprovado no Tribunal por ${interaction.user.tag}`);
                    
                    // Edita o cartão para VERDE (Caso Encerrado)
                    const embedAbsolvido = new EmbedBuilder(interaction.message.embeds[0])
                        .setColor(0x00FF00) // Verde
                        .setTitle('⚖️ Veredito: DESBANIDO 🕊️')
                        .addFields({ name: '✅ Aprovado por', value: interaction.user.tag });

                    // Remove os botões e atualiza
                    await interaction.update({ embeds: [embedAbsolvido], components: [] });
                    
                    // Gera o LOG OFICIAL
                    logEvento(client, interaction.guild, 'Tribunal', '🕊️ Desbanimento Aprovado', 
                        `O usuário ${idAlvo} foi perdoado após votação.`, 
                        [{ name: 'Juiz Responsável', value: interaction.user.tag }], 
                        0x00FF00
                    );

                } catch (e) {
                    interaction.reply({ content: '❌ Erro: O usuário já foi desbanido ou o ID sumiu.', ephemeral: true });
                }
            } 
            
            // --- OPÇÃO B: MANTER BAN (RECUSAR) ---
            else if (acao === 'manter') {
                // Edita o cartão para VERMELHO (Pedido Negado)
                const embedNegado = new EmbedBuilder(interaction.message.embeds[0])
                    .setColor(0xFF0000) // Vermelho
                    .setTitle('⚖️ Veredito: PEDIDO NEGADO 🔨')
                    .addFields({ name: '🚫 Recusado por', value: interaction.user.tag });

                await interaction.update({ embeds: [embedNegado], components: [] });

                // Log (Opcional, mas bom pra saber quem negou)
                logEvento(client, interaction.guild, 'Tribunal', '🔨 Recurso Negado', 
                    `O pedido de unban do usuário ${idAlvo} foi rejeitado.`, 
                    [{ name: 'Juiz Responsável', value: interaction.user.tag }], 
                    0xFF0000
                );
            }
        }
    },
};