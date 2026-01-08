require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Configuração de Permissões (Intents) - O Bira precisa ver e ouvir tudo
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Coleção de comandos na memória
client.commands = new Collection();

// Carrega o Handler
const setupHandlers = require('./src/handlers/mainHandler');
setupHandlers(client);

// Inicialização
(async () => {
    // 1. Carrega Comandos e Eventos
    await client.handleCommands();
    await client.handleEvents();
    
    // 2. Login
    client.login(process.env.DISCORD_TOKEN);
})();