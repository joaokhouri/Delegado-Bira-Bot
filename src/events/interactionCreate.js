const { Events, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logEvento } = require('../services/logger');
const categoryNames = require('../utils/commandCategories');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        
        // ====================================================
        // 1. COMANDOS DE BARRA (/comando)
        // ====================================================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                const msg = { content: '🤯 Erro interno no comando.', flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
                else await interaction.reply(msg);
            }
        }

        // ====================================================
        // 2. MENUS DE SELEÇÃO (COMANDO /COMANDOS)
        // ====================================================
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ajuda-menu') {
                const selectedCategory = interaction.values[0]; 
                const categoryPath = path.join(__dirname, '../commands', selectedCategory);
                
                try {
                    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
                    const listaComandos = commandFiles.map(file => {
                        const cmd = require(path.join(categoryPath, file));
                        return `**/%s**\n└─ %s`.replace('%s', cmd.data.name).replace('%s', cmd.data.description);
                    }).join('\n\n');

                    const nomeBonito = categoryNames[selectedCategory] || selectedCategory.toUpperCase();

                    const embedAjuda = new EmbedBuilder()
                        .setColor(0x00A8FC)
                        .setTitle(`📂 Categoria: ${nomeBonito}`)
                        .setDescription(listaComandos || 'Nenhum comando encontrado.')
                        .setFooter({ text: 'Portaria do Bira • Manual' });

                    await interaction.update({ embeds: [embedAjuda] });

                } catch (erro) {
                    console.error('Erro no menu ajuda:', erro);
                    await interaction.reply({ content: '❌ Erro ao carregar essa categoria.', flags: MessageFlags.Ephemeral });
                }
            }
        }

        // ====================================================
        // 3. MODAIS (JANELAS DE TEXTO)
        // ====================================================
        else if (interaction.isModalSubmit()) {
            
            // --- COMANDO /FALAR ---
            if (interaction.customId === 'modal_falar') {
                const texto = interaction.fields.getTextInputValue('texto_falar');
                
                // Envia a mensagem no canal onde o comando foi usado
                await interaction.channel.send(texto);
                
                // Responde pro Admin (só ele vê) confirmando
                await interaction.reply({ content: '✅ Mensagem enviada com sucesso!', flags: MessageFlags.Ephemeral });
                
                // Log (Opcional)
                logEvento(client, interaction.guild, 'Comando Admin', '📢 Bira Falou', `Admin ${interaction.user.tag} usou /falar: "${texto}"`, [], 0x00A8FC);
            }
        }

        // ====================================================
        // 4. BOTÕES (VERIFICAÇÃO E TRIBUNAL)
        // ====================================================
        else if (interaction.isButton()) {
            const customId = interaction.customId;

            // --- A. SISTEMA DE VERIFICAÇÃO ---
            if (customId.startsWith('verificar_')) {
                const roleId = customId.split('_')[1]; 
                const role = interaction.guild.roles.cache.get(roleId);

                if (!role) return interaction.reply({ content: '❌ Erro: Cargo não encontrado.', flags: MessageFlags.Ephemeral });
                if (interaction.member.roles.cache.has(roleId)) return interaction.reply({ content: '✅ Já verificado!', flags: MessageFlags.Ephemeral });

                try {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: `🎉 **Acesso Liberado!** Bem-vindo, ${interaction.user}!`, flags: MessageFlags.Ephemeral });
                } catch (erro) {
                    await interaction.reply({ content: '❌ Erro de permissão. O meu cargo (Bot) precisa ser maior que o cargo de Membro.', flags: MessageFlags.Ephemeral });
                }
            }

            // --- B. SISTEMA DE TRIBUNAL (UNBAN) ---
            else if (customId.startsWith('absolver_') || customId.startsWith('manter_')) {
                if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                    return interaction.reply({ content: '🚫 Apenas Staff pode votar.', flags: MessageFlags.Ephemeral });
                }

                const [acao, idAlvo] = customId.split('_');

                if (acao === 'absolver') {
                    try {
                        await interaction.guild.members.unban(idAlvo, `Tribunal: ${interaction.user.tag}`);
                        
                        const embedAbsolvido = new EmbedBuilder(interaction.message.embeds[0])
                            .setColor(0x00FF00).setTitle('⚖️ Veredito: DESBANIDO 🕊️').addFields({ name: 'Juiz', value: interaction.user.tag });
                        
                        await interaction.update({ embeds: [embedAbsolvido], components: [] });
                        logEvento(client, interaction.guild, 'Tribunal', '🕊️ Desbanido', `Usuário ${idAlvo} perdoado.`, [], 0x00FF00);
                    } catch (e) { interaction.reply({ content: 'Erro: Usuário já desbanido ou ID inválido.', flags: MessageFlags.Ephemeral }); }
                } 
                else if (acao === 'manter') {
                    const embedNegado = new EmbedBuilder(interaction.message.embeds[0])
                        .setColor(0xFF0000).setTitle('⚖️ Veredito: NEGADO 🔨').addFields({ name: 'Juiz', value: interaction.user.tag });
                    await interaction.update({ embeds: [embedNegado], components: [] });
                }
            }
        }
    },
};