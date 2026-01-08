const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`☕ SISTEMA INICIADO: Logado como ${client.user.tag}`);
        
        client.user.setActivity('a portaria do prédio', { type: ActivityType.Watching });

        // Registro Global de Comandos (Isso faz os comandos aparecerem no chat)
        try {
            console.log('🔄 Sincronizando comandos com o Discord...');
            await client.application.commands.set(client.commandArray);
            console.log('✅ Comandos registrados com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao registrar comandos:', error);
        }
    },
};