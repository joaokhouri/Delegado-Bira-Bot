const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`☕ SISTEMA INICIADO: Logado como ${client.user.tag}`);

        const activities = [
            // Usamos ActivityType.Custom para o Discord mostrar APENAS o texto (sem prefixo automático)
            // Aí escrevemos o verbo nós mesmos para garantir a leitura.

            { name: '☕ Tomando aquele cafézinho...', type: ActivityType.Custom },
            { name: '🍬 Jogando Candy Crush', type: ActivityType.Custom },
            { name: '👍 Dando joinha pro pessoal', type: ActivityType.Custom },
            { name: '👂 Ouvindo as reclamações do patrão', type: ActivityType.Custom },
            { name: '📻 Ouvindo o jogo no radinho', type: ActivityType.Custom },
            { name: '🎵 Ouvindo Tim Maia', type: ActivityType.Custom },
            { name: '📺 Assistindo Os Donos da Bola', type: ActivityType.Custom },
            { name: '👀 Assistindo a movimentação no #geral', type: ActivityType.Custom },
            { name: '🔍 Inspecionando as permissões', type: ActivityType.Custom },
            { name: '🎬 Assistindo filme do Denzel Washington', type: ActivityType.Custom },
        ];

        let i = 0;

        const updateStatus = () => {
            const activity = activities[i];
            
            client.user.setPresence({
                activities: [{ name: activity.name, type: activity.type }],
                status: 'online',
            });

            // Passa para o próximo
            i = (i + 1) % activities.length;
        };

        // Roda a primeira vez
        updateStatus();

        // Roda a cada 3 minutos
        setInterval(updateStatus, 3 * 60 * 1000);
    },
};