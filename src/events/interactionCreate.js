const { Events, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logEvento } = require('../services/logger');
const categoryNames = require('../utils/commandCategories');

// --- ANTI-FLOOD DE BOTÃO ---
// Armazena quem clicou e quando: Map<UserId, Timestamp>
const buttonCooldowns = new Map();
const COOLDOWN_TIME = 10000; // 10 segundos de espera entre cliques

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
        // 2. MENUS DE SELEÇÃO (/COMANDOS)
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
                    await interaction.reply({ content: '❌ Erro ao carregar categoria.', flags: MessageFlags.Ephemeral });
                }
            }
        }

        // ====================================================
        // 3. MODAIS (/FALAR)
        // ====================================================
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_falar') {
                const texto = interaction.fields.getTextInputValue('texto_falar');
                await interaction.channel.send(texto);
                await interaction.reply({ content: '✅ Enviado!', flags: MessageFlags.Ephemeral });
                logEvento(client, interaction.guild, 'Admin', '📢 Bira Falou', `Admin: ${interaction.user.tag}\nMsg: ${texto}`, [], 0x00A8FC);
            }
        }

        // ====================================================
        // 4. BOTÕES (VERIFICAÇÃO E TRIBUNAL)
        // ====================================================
        else if (interaction.isButton()) {
            const customId = interaction.customId;

            // --- A. SISTEMA DE VERIFICAÇÃO (COM COOLDOWN) ---
            if (customId.startsWith('verificar_')) {
                
                // 1. Checa Cooldown (Anti-Flood)
                const now = Date.now();
                if (buttonCooldowns.has(interaction.user.id)) {
                    const expirationTime = buttonCooldowns.get(interaction.user.id) + COOLDOWN_TIME;
                    if (now < expirationTime) {
                        return interaction.reply({ 
                            content: '⏳ **Calma lá, apressadinho!** Espera um pouco pra clicar de novo.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                }
                // Atualiza o tempo do último clique
                buttonCooldowns.set(interaction.user.id, now);


                // 2. Lógica de Verificação
                // Procura o cargo "Verificado" ou "Membros"
                const role = interaction.guild.roles.cache.find(r => r.name === 'Verificado' || r.name === 'Membro' || r.name === 'Cidadão');

                if (!role) return interaction.reply({ content: '❌ Erro: Cargo de verificação não configurado no servidor.', flags: MessageFlags.Ephemeral });
                
                if (interaction.member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: '✅ Você já está verificado, chefia! Pode circular.', flags: MessageFlags.Ephemeral });
                }

                try {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: `🎉 **Acesso Liberado!** Bem-vindo ao condomínio, ${interaction.user}!`, flags: MessageFlags.Ephemeral });
                } catch (erro) {
                    await interaction.reply({ content: '❌ Erro de permissão: Meu cargo precisa estar ACIMA do cargo de Membros.', flags: MessageFlags.Ephemeral });
                }
            }

            // --- B. TRIBUNAL (UNBAN) ---
            else if (customId.startsWith('absolver_') || customId.startsWith('manter_')) {
                // ... (Lógica do tribunal permanece idêntica) ...
                if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: '🚫 Apenas Staff.', flags: MessageFlags.Ephemeral });
                const [acao, idAlvo] = customId.split('_');

                if (acao === 'absolver') {
                    try {
                        await interaction.guild.members.unban(idAlvo, `Tribunal: ${interaction.user.tag}`);
                        const embed = new EmbedBuilder(interaction.message.embeds[0]).setColor(0x00FF00).setTitle('⚖️ Veredito: DESBANIDO 🕊️').addFields({name:'Juiz', value:interaction.user.tag});
                        await interaction.update({ embeds: [embed], components: [] });
                        logEvento(client, interaction.guild, 'Tribunal', '🕊️ Desbanido', `Usuário ${idAlvo} perdoado.`, [], 0x00FF00);
                    } catch (e) { interaction.reply({ content: 'Erro ao desbanir.', flags: MessageFlags.Ephemeral }); }
                } else {
                    const embed = new EmbedBuilder(interaction.message.embeds[0]).setColor(0xFF0000).setTitle('⚖️ Veredito: NEGADO 🔨').addFields({name:'Juiz', value:interaction.user.tag});
                    await interaction.update({ embeds: [embed], components: [] });
                }
            }
        }
    },
};