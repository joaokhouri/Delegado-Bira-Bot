const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- CORREÇÃO AQUI ---
// Aponta explicitamente para o arquivo .env na pasta anterior (raiz)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// --- VERIFICAÇÃO DE SEGURANÇA ---
if (!process.env.CLIENT_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
    console.error('❌ ERRO CRÍTICO: Faltam variáveis no arquivo .env!');
    console.error('Verifique se CLIENT_ID, GUILD_ID e DISCORD_TOKEN estão preenchidos.');
    process.exit(1);
}

console.log(`📦 Empacotando comandos para o Bot ID: ${process.env.CLIENT_ID}`);

// ... (O resto do código continua igual)
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`   ✅ Carregado: ${command.data.name}`);
        } else {
            console.log(`   ⚠️ [AVISO] O comando em ${filePath} está faltando "data" ou "execute".`);
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Atualizando ${commands.length} comandos (/) no servidor ${process.env.GUILD_ID}...`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('✨ SUCESSO! Comandos registrados com sucesso.');
    } catch (error) {
        console.error(error);
    }
})();