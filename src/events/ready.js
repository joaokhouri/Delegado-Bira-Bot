const { Events, ActivityType } = require('discord.js');
const { checkStream } = require('../services/twitch'); // Importamos o vigilante

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`☕ SISTEMA INICIADO: Logado como ${client.user.tag}`);

        // ====================================================
        // 1. SISTEMA DE STATUS ROTATIVO (A cada 3 min)
        // ====================================================
        const activities = [
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
            i = (i + 1) % activities.length;
        };

        updateStatus(); // Roda status agora
        setInterval(updateStatus, 3 * 60 * 1000); // Muda a cada 3 minutos

        // ====================================================
        // 2. SISTEMA DE MONITORAMENTO DA TWITCH (A cada 2 min)
        // ====================================================
        console.log('📡 Vigilante da Twitch ativado...');
        
        checkStream(client); // Checa agora
        
        setInterval(() => {
            checkStream(client);
        }, 5 * 60 * 1000); // Checa a cada 2 minutos
    },
};