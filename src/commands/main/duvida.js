const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duvida')
        .setDescription('Faça uma pergunta para o Bira e receba a sabedoria da portaria')
        .addStringOption(option => option.setName('pergunta').setDescription('O que você quer saber?').setRequired(true)),

    async execute(interaction) {
        const pergunta = interaction.options.getString('pergunta');

        const respostas = [
            // Positivas
            'Com certeza, chefia!',
            'Pode apostar que sim.',
            'Tô sentindo que vai dar bom.',
            'Claro! O céu é o limite.',
            'Sim, assino embaixo.',
            
            // Neutras / Duvidosas
            'Ih, rapaz... sei não hein.',
            'Pergunta pro síndico que eu não sei.',
            'Melhor não te responder isso agora pra você não ficar triste.',
            'Foca no trabalho e esquece isso.',
            'Talvez sim, talvez não. O futuro a Deus pertence.',

            // Negativas
            'Nem a pau, Juvenal.',
            'Esquece. Sem chance.',
            'Minhas fontes dizem que não.',
            'Deu ruim. A resposta é não.',
            'Sai dessa que é cilada.'
        ];

        const resposta = respostas[Math.floor(Math.random() * respostas.length)];

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6) // Roxo Místico
            .setTitle('🔮 A Sabedoria do Bira')
            .addFields(
                { name: '❓ Pergunta', value: pergunta },
                { name: '🗣️ Resposta', value: `**${resposta}**` }
            );

        await interaction.reply({ embeds: [embed] });
    },
};