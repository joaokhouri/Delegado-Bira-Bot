const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
// Certifique-se que o caminho volta duas pastas (../..) para chegar em utils
const categoryNames = require('../../utils/commandCategories');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comandos') // Renomeado conforme seu pedido
        .setDescription('Lista todos os meus procedimentos e manuais de operação.'),

    async execute(interaction) {
        // Lê as pastas dentro de src/commands (admin, mod, main)
        const commandsPath = path.join(__dirname, '..');
        
        // Pega apenas as pastas (diretórios)
        let commandFolders = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

        // --- 🔒 FILTRO DE SEGURANÇA BLINDADO ---
        // Se o usuário NÃO tiver permissão de expulsar (KickMembers), ele é civil.
        // Então escondemos as pastas 'mod' e 'admin' dele.
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            commandFolders = commandFolders.filter(folder => folder !== 'mod' && folder !== 'admin');
        }

        const initialEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📘 Manual de Operações do Bira')
            .setDescription(
                'Olá, cidadão! Sou o Bira, a unidade de segurança e ordem deste servidor. \n\nSelecione uma categoria abaixo para ver os procedimentos disponíveis para sua patente.'
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Selecione uma opção no menu abaixo ⬇️' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ajuda-menu')
            .setPlaceholder('📂 Escolha uma categoria...')
            .addOptions(
                commandFolders.map((folder) => {
                    // Pega o nome bonito do arquivo utils ou usa o nome da pasta em Maiúsculo
                    const label = categoryNames[folder] || folder.charAt(0).toUpperCase() + folder.slice(1);
                    
                    return {
                        label: label,
                        value: folder, // O valor enviado pro interactionCreate é o nome real da pasta (mod, main...)
                        description: `Comandos do módulo de ${folder}`,
                        emoji: '📁'
                    };
                })
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            embeds: [initialEmbed],
            components: [row],
            flags: MessageFlags.Ephemeral// Só quem chamou vê a mensagem
        });
    },
};