const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('carteirada')
        .setDescription('Mostra para todos quem é que manda aqui (Exclusivo Subs/VIPs)'),

    async execute(interaction) {
        // COLOQUE O ID DO CARGO DE SUB AQUI OU O NOME EXATO
        // Exemplo: const roleSub = interaction.guild.roles.cache.find(r => r.name === 'Twitch Subscriber');
        // Para testar agora, vamos permitir quem tem permissão de "Mover Membros" ou se você colocar o ID manual
        
        // Simulação: Vamos supor que quem tem cargo de 'Membros' é o sub por enquanto para teste
        // Na prática você vai por: interaction.member.roles.cache.has('ID_DO_CARGO_SUB')
        
        // Lógica de verificação (Exemplo genérico, depois você refina)
        const ehSub = interaction.member.roles.cache.some(role => role.name.includes('Subscriber') || role.name.includes('VIP') || role.name.includes('Booster'));
        
        // Se quiser testar sendo admin, descomente essa linha:
        // const ehSub = true; 

        if (!ehSub) {
            return interaction.reply({ 
                content: '🚫 **Negativo.** Você não tem a credencial VIP. Passa no RH (Twitch) e assina a carteira primeiro.', 
                ephemeral: true 
            });
        }

        const frasesElogio = [
            'Esse aqui paga a conta de luz da guarita! Respeito!',
            'Esse ai é "bigode" de verdade!',
            'Atenção: Cidadão de alta periculosidade (financeira) na área.',
            'O dono da lancha e do jet-ski. 🚤',
            'Silêncio! O patrão tá falando.'
        ];

        const frase = frasesElogio[Math.floor(Math.random() * frasesElogio.length)];

        const embed = new EmbedBuilder()
            .setColor(0xFFD700) // Dourado (Gold)
            .setTitle(`💎 A CARTEIRADA FOI DADA!`)
            .setDescription(`## 👑 ${interaction.user} \n\n> *"${frase}"*`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Verificado pelo Bira • Status: VIP Premium Gold' })
            .setImage('https://media.tenor.com/images/1c6c5923974534888f4078864f9f7734/tenor.gif'); // GIF de dinheiro ou respeito (opcional)

        await interaction.reply({ embeds: [embed] });
    },
};