const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`☕ SISTEMA INICIADO: Logado como ${client.user.tag}`);

        // Sua lista personalizada de atividades
        const activities = [
            { name: '☕ Pausa para o cafézinho...', type: ActivityType.Playing }, // Playing para aparecer o ícone
            { name: 'as reclamações do patrão', type: ActivityType.Listening },
            { name: 'Candy Crush', type: ActivityType.Playing },
            { name: 'Os Donos da Bola', type: ActivityType.Watching },
            { name: '👍 Dando aquele joinha pro pessoal da firma.', type: ActivityType.Playing },
            { name: 'o jogo no radinho de pilha', type: ActivityType.Listening },
            { name: 'a movimentação no #geral', type: ActivityType.Watching },
            { name: '🔍 Inspecionando as permissões.', type: ActivityType.Watching }, // Trocado para Watching para aparecer
            { name: 'algum filme do Denzel Washington', type: ActivityType.Watching },
            { name: '🎵 Tim Maia', type: ActivityType.Listening },
        ];

        let i = 0;

        // Função que atualiza o status
        const updateStatus = () => {
            const activity = activities[i];
            
            client.user.setPresence({
                activities: [{ name: activity.name, type: activity.type }],
                status: 'online',
            });

            // Passa para o próximo
            i = (i + 1) % activities.length;
        };

        // Roda a primeira vez imediatamente (pra não esperar 5 min pro primeiro status)
        updateStatus();

        // Configura o intervalo para 5 minutos (5 * 60 * 1000 = 300000ms)
        setInterval(updateStatus, 5 * 60 * 1000);
    },
};